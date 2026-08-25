# backend/services/project_access_service.py
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status

from database.database import (
    projects_collection,
    teams_collection,
    users_collection,
    project_join_requests_collection,
    notifications_collection,
    add_team_member,
    remove_team_member,
    is_user_in_project_team,
)


def _format_datetime(dt) -> str:
    """Helper to convert datetime objects to ISO format strings."""
    if not dt:
        return ""
    if isinstance(dt, datetime):
        return dt.isoformat()
    return str(dt)


async def _resolve_user_details(user_dict: dict) -> tuple:
    """Extract user ID, email, name, and system role cleanly."""
    user_id = str(user_dict.get("id") or user_dict.get("user_id") or user_dict.get("_id") or "")
    user_email = (user_dict.get("email") or "").strip().lower()
    user_role = user_dict.get("role") or "Developer"
    user_name = user_dict.get("name")

    if not user_name or not user_id or not user_email:
        query = {}
        if user_id and ObjectId.is_valid(user_id):
            query["_id"] = ObjectId(user_id)
        elif user_email:
            query["email"] = user_email

        if query:
            db_user = await users_collection.find_one(query)
            if db_user:
                user_id = str(db_user["_id"])
                user_email = db_user.get("email", user_email).strip().lower()
                user_name = db_user.get("name") or user_name
                user_role = db_user.get("role") or user_role

    if not user_name:
        user_name = user_email.split("@")[0].replace(".", " ").replace("_", " ").title() if user_email else "Developer"

    return user_id, user_email, user_name, user_role


async def get_project_access_status(project_id: str, current_user: dict) -> dict:
    """
    Check the current user's access status for a given project.
    Determines membership using teams_collection as the single source of truth.
    """
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid project ID format")

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_id, user_email, user_name, user_role = await _resolve_user_details(current_user)

    project_name = project.get("name", "Project")
    visibility = project.get("visibility", "private").lower()
    is_public = visibility == "public"

    # Check ownership
    owner_id_str = str(project.get("owner_id", ""))
    is_owner = (
        (owner_id_str and owner_id_str == user_id) or
        (project.get("owner_email") and project.get("owner_email").strip().lower() == user_email)
    )

    # Check team membership in teams_collection (single source of truth)
    is_team_member = await is_user_in_project_team(
        project_id=str(project["_id"]),
        user_email=user_email,
        user_id=user_id
    )

    # 1. Admin and QA roles automatically bypass private project gating
    if user_role in ["Admin", "QA"]:
        return {
            "status": "APPROVED",
            "project_id": str(project["_id"]),
            "project_name": project_name,
            "is_owner": is_owner,
            "is_team_member": is_team_member,
            "is_public": is_public,
            "user_role": user_role,
            "pending_request_id": None,
        }

    # 2. Public projects bypass gating
    if is_public:
        return {
            "status": "APPROVED",
            "project_id": str(project["_id"]),
            "project_name": project_name,
            "is_owner": is_owner,
            "is_team_member": is_team_member,
            "is_public": is_public,
            "user_role": user_role,
            "pending_request_id": None,
        }

    # 3. Project Owner has full access
    if is_owner:
        return {
            "status": "APPROVED",
            "project_id": str(project["_id"]),
            "project_name": project_name,
            "is_owner": True,
            "is_team_member": True,
            "is_public": is_public,
            "user_role": user_role,
            "pending_request_id": None,
        }

    # 4. Verified team members in teams_collection have full access
    if is_team_member:
        return {
            "status": "APPROVED",
            "project_id": str(project["_id"]),
            "project_name": project_name,
            "is_owner": False,
            "is_team_member": True,
            "is_public": is_public,
            "user_role": user_role,
            "pending_request_id": None,
        }

    # 5. Non-member: check project_join_requests history
    req_query = {
        "project_id": str(project["_id"]),
        "$or": [
            {"requester_id": user_id},
            {"requester_email": user_email}
        ]
    }
    latest_req = await project_join_requests_collection.find_one(
        req_query,
        sort=[("created_at", -1)]
    )

    if not latest_req:
        return {
            "status": "NOT_REQUESTED",
            "project_id": str(project["_id"]),
            "project_name": project_name,
            "is_owner": False,
            "is_team_member": False,
            "is_public": is_public,
            "user_role": user_role,
            "pending_request_id": None,
        }

    req_status = latest_req.get("status", "pending")
    if req_status == "pending":
        computed_status = "PENDING"
    elif req_status == "rejected":
        computed_status = "REJECTED"
    elif req_status == "approved":
        computed_status = "APPROVED"
    else:
        computed_status = "NOT_REQUESTED"

    return {
        "status": computed_status,
        "project_id": str(project["_id"]),
        "project_name": project_name,
        "is_owner": False,
        "is_team_member": False,
        "is_public": is_public,
        "user_role": user_role,
        "pending_request_id": str(latest_req["_id"]) if req_status == "pending" else None,
    }


async def request_to_join_project(project_id: str, current_user: dict) -> dict:
    """
    Developer submits a request to join a private project.
    Creates a record in project_join_requests and a notification for the project owner.
    """
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid project ID format")

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_id, user_email, user_name, user_role = await _resolve_user_details(current_user)

    # 1. If project is public, no join request needed
    if project.get("visibility", "private").lower() == "public":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This project is public and open to all contributors."
        )

    # 2. Check if already owner or in teams_collection
    owner_id_str = str(project.get("owner_id", ""))
    is_owner = (
        (owner_id_str and owner_id_str == user_id) or
        (project.get("owner_email") and project.get("owner_email").strip().lower() == user_email)
    )
    if is_owner:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are the owner of this project."
        )

    is_team_member = await is_user_in_project_team(
        project_id=str(project["_id"]),
        user_email=user_email,
        user_id=user_id
    )
    if is_team_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already an approved member of this project's team."
        )

    # 3. Check for existing pending request (prevent duplicates)
    existing_pending = await project_join_requests_collection.find_one({
        "project_id": str(project["_id"]),
        "status": "pending",
        "$or": [
            {"requester_id": user_id},
            {"requester_email": user_email}
        ]
    })
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A join request for this project is already pending."
        )

    # 4. Resolve owner details for notification delivery
    resolved_owner_id = owner_id_str
    resolved_owner_email = project.get("owner_email")

    if resolved_owner_id and ObjectId.is_valid(resolved_owner_id):
        owner_doc = await users_collection.find_one({"_id": ObjectId(resolved_owner_id)})
        if owner_doc:
            resolved_owner_email = owner_doc.get("email")
    elif resolved_owner_email:
        owner_doc = await users_collection.find_one({"email": resolved_owner_email.strip().lower()})
        if owner_doc:
            resolved_owner_id = str(owner_doc["_id"])

    now = datetime.now(timezone.utc)
    project_name = project.get("name", "Project")

    # Insert join request history record
    request_doc = {
        "project_id": str(project["_id"]),
        "project_name": project_name,
        "requester_id": user_id,
        "requester_name": user_name,
        "requester_email": user_email,
        "requester_role": user_role,
        "owner_id": resolved_owner_id or "",
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }

    req_result = await project_join_requests_collection.insert_one(request_doc)
    request_id_str = str(req_result.inserted_id)

    # Insert notification for project owner
    notif_doc = {
        "recipient_id": resolved_owner_id or "",
        "recipient_email": resolved_owner_email or "",
        "type": "join_request",
        "title": "New Project Join Request",
        "message": f"{user_name} requested to join {project_name}.",
        "project_id": str(project["_id"]),
        "project_name": project_name,
        "join_request_id": request_id_str,
        "requester_id": user_id,
        "requester_name": user_name,
        "requester_email": user_email,
        "requester_role": user_role,
        "status": "pending",
        "read": False,
        "created_at": now,
    }
    await notifications_collection.insert_one(notif_doc)

    return {
        "id": request_id_str,
        "project_id": str(project["_id"]),
        "project_name": project_name,
        "requester_id": user_id,
        "requester_name": user_name,
        "requester_email": user_email,
        "requester_role": user_role,
        "owner_id": resolved_owner_id or "",
        "status": "pending",
        "created_at": _format_datetime(now),
        "updated_at": _format_datetime(now),
    }


async def approve_join_request(request_id: str, current_user: dict) -> dict:
    """
    Project Owner (or Admin) approves a join request.
    1. Updates join request status to approved.
    2. Adds user to teams_collection as a Contributor.
    3. Updates owner's notification inline.
    4. Creates confirmation notification for requester.
    """
    if not request_id:
        raise HTTPException(status_code=400, detail="request_id is required")

    try:
        req_doc = await project_join_requests_collection.find_one({"_id": ObjectId(request_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid request ID format")

    if not req_doc:
        raise HTTPException(status_code=404, detail="Join request not found")

    if req_doc.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This join request is already {req_doc.get('status')}."
        )

    # Verify authorization
    user_id, user_email, user_name, user_role = await _resolve_user_details(current_user)
    project_id_str = req_doc.get("project_id")

    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id_str)})
    except Exception:
        project = None

    if not project:
        raise HTTPException(status_code=404, detail="Associated project not found")

    owner_id_str = str(project.get("owner_id", ""))
    is_owner = (
        (owner_id_str and owner_id_str == user_id) or
        (project.get("owner_email") and project.get("owner_email").strip().lower() == user_email)
    )

    if not is_owner and user_role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner or an Admin can approve join requests."
        )

    now = datetime.now(timezone.utc)

    # 1. Update join request status
    await project_join_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved", "updated_at": now}}
    )

    # 2. Add Developer to teams_collection (source of truth)
    await add_team_member(
        project_id=project_id_str,
        user_email=req_doc.get("requester_email"),
        role_in_project="Contributor",
        user_id=req_doc.get("requester_id")
    )

    # 3. Update owner's notification item inline
    requester_name = req_doc.get("requester_name", "Developer")
    project_name = req_doc.get("project_name", "Project")

    await notifications_collection.update_many(
        {"join_request_id": str(request_id)},
        {
            "$set": {
                "status": "approved",
                "read": True,
                "title": "Join Request Approved",
                "message": f"{requester_name} is now a member of {project_name}."
            }
        }
    )

    # 4. Dispatch notification to the approved Developer
    dev_notif = {
        "recipient_id": req_doc.get("requester_id", ""),
        "recipient_email": req_doc.get("requester_email", ""),
        "type": "join_approved",
        "title": "Join Request Approved",
        "message": f"Your request to join {project_name} was approved. You now have access.",
        "project_id": project_id_str,
        "project_name": project_name,
        "join_request_id": str(request_id),
        "status": "approved",
        "read": False,
        "created_at": now,
    }
    await notifications_collection.insert_one(dev_notif)

    return {
        "id": str(request_id),
        "project_id": project_id_str,
        "project_name": project_name,
        "requester_id": req_doc.get("requester_id"),
        "requester_name": requester_name,
        "requester_email": req_doc.get("requester_email"),
        "status": "approved",
        "updated_at": _format_datetime(now),
        "message": f"Approved {requester_name}'s request to join {project_name}."
    }


async def reject_join_request(request_id: str, current_user: dict) -> dict:
    """
    Project Owner (or Admin) rejects a join request.
    1. Updates join request status to rejected.
    2. Updates owner's notification inline.
    3. Creates notification for requester.
    """
    if not request_id:
        raise HTTPException(status_code=400, detail="request_id is required")

    try:
        req_doc = await project_join_requests_collection.find_one({"_id": ObjectId(request_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid request ID format")

    if not req_doc:
        raise HTTPException(status_code=404, detail="Join request not found")

    if req_doc.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This join request is already {req_doc.get('status')}."
        )

    # Verify authorization
    user_id, user_email, user_name, user_role = await _resolve_user_details(current_user)
    project_id_str = req_doc.get("project_id")

    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id_str)})
    except Exception:
        project = None

    if not project:
        raise HTTPException(status_code=404, detail="Associated project not found")

    owner_id_str = str(project.get("owner_id", ""))
    is_owner = (
        (owner_id_str and owner_id_str == user_id) or
        (project.get("owner_email") and project.get("owner_email").strip().lower() == user_email)
    )

    if not is_owner and user_role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner or an Admin can reject join requests."
        )

    now = datetime.now(timezone.utc)
    requester_name = req_doc.get("requester_name", "Developer")
    project_name = req_doc.get("project_name", "Project")

    # 1. Update join request status
    await project_join_requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected", "updated_at": now}}
    )

    # 2. Update owner's notification item inline
    await notifications_collection.update_many(
        {"join_request_id": str(request_id)},
        {
            "$set": {
                "status": "rejected",
                "read": True,
                "title": "Join Request Rejected",
                "message": f"{requester_name}'s request to join {project_name} was rejected."
            }
        }
    )

    # 3. Dispatch notification to the rejected Developer
    dev_notif = {
        "recipient_id": req_doc.get("requester_id", ""),
        "recipient_email": req_doc.get("requester_email", ""),
        "type": "join_rejected",
        "title": "Join Request Rejected",
        "message": f"Your request to join {project_name} was not approved.",
        "project_id": project_id_str,
        "project_name": project_name,
        "join_request_id": str(request_id),
        "status": "rejected",
        "read": False,
        "created_at": now,
    }
    await notifications_collection.insert_one(dev_notif)

    return {
        "id": str(request_id),
        "project_id": project_id_str,
        "project_name": project_name,
        "requester_id": req_doc.get("requester_id"),
        "requester_name": requester_name,
        "requester_email": req_doc.get("requester_email"),
        "status": "rejected",
        "updated_at": _format_datetime(now),
        "message": f"Rejected {requester_name}'s request to join {project_name}."
    }


async def remove_project_team_member(project_id: str, member_id_or_email: str, current_user: dict) -> dict:
    """
    Project Owner (or Admin) removes an approved member from teams_collection.
    """
    if not project_id or not member_id_or_email:
        raise HTTPException(status_code=400, detail="project_id and member identifier are required")

    try:
        project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid project ID format")

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_id, user_email, user_name, user_role = await _resolve_user_details(current_user)
    owner_id_str = str(project.get("owner_id", ""))
    is_owner = (
        (owner_id_str and owner_id_str == user_id) or
        (project.get("owner_email") and project.get("owner_email").strip().lower() == user_email)
    )

    if not is_owner and user_role != "Admin":
        raise HTTPException(status_code=403, detail="Only the project owner or Admin can remove team members.")

    # Remove from teams_collection
    removed = await remove_team_member(
        project_id=str(project["_id"]),
        user_email=member_id_or_email if "@" in member_id_or_email else None,
        user_id=member_id_or_email if "@" not in member_id_or_email else None
    )

    return {
        "success": removed,
        "message": "Team member removed successfully from project team." if removed else "Member not found in team."
    }


# =====================================================================
# NOTIFICATIONS SERVICES
# =====================================================================

async def get_user_notifications(current_user: dict) -> dict:
    """Retrieve notifications for the current user."""
    user_id, user_email, _, _ = await _resolve_user_details(current_user)

    or_clauses = []
    if user_id:
        or_clauses.append({"recipient_id": user_id})
    if user_email:
        or_clauses.append({"recipient_email": user_email})

    if not or_clauses:
        return {"notifications": [], "unread_count": 0}

    cursor = notifications_collection.find({"$or": or_clauses}).sort("created_at", -1).limit(50)
    notif_docs = await cursor.to_list(length=50)

    results = []
    unread_count = 0
    for doc in notif_docs:
        if not doc.get("read", False):
            unread_count += 1

        results.append({
            "id": str(doc["_id"]),
            "recipient_id": doc.get("recipient_id", ""),
            "recipient_email": doc.get("recipient_email", ""),
            "type": doc.get("type", "notification"),
            "title": doc.get("title", "Notification"),
            "message": doc.get("message", ""),
            "project_id": doc.get("project_id"),
            "project_name": doc.get("project_name"),
            "join_request_id": doc.get("join_request_id"),
            "requester_name": doc.get("requester_name"),
            "requester_email": doc.get("requester_email"),
            "requester_role": doc.get("requester_role"),
            "status": doc.get("status"),
            "read": doc.get("read", False),
            "created_at": _format_datetime(doc.get("created_at")),
        })

    return {
        "notifications": results,
        "unread_count": unread_count,
    }


async def mark_notification_as_read(notification_id: str, current_user: dict) -> dict:
    """Mark a notification as read."""
    if not notification_id:
        raise HTTPException(status_code=400, detail="notification_id is required")

    user_id, user_email, _, _ = await _resolve_user_details(current_user)

    query = {
        "_id": ObjectId(notification_id),
        "$or": [{"recipient_id": user_id}, {"recipient_email": user_email}]
    }

    result = await notifications_collection.update_one(query, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"id": notification_id, "read": True}


async def mark_all_notifications_read(current_user: dict) -> dict:
    """Mark all notifications as read for current user."""
    user_id, user_email, _, _ = await _resolve_user_details(current_user)

    query = {"$or": [{"recipient_id": user_id}, {"recipient_email": user_email}], "read": False}
    result = await notifications_collection.update_many(query, {"$set": {"read": True}})

    return {"modified_count": result.modified_count, "message": "All notifications marked as read."}


async def delete_notification(notification_id: str, current_user: dict) -> dict:
    """Delete / dismiss a notification."""
    if not notification_id:
        raise HTTPException(status_code=400, detail="notification_id is required")

    user_id, user_email, _, _ = await _resolve_user_details(current_user)

    query = {
        "_id": ObjectId(notification_id),
        "$or": [{"recipient_id": user_id}, {"recipient_email": user_email}]
    }

    result = await notifications_collection.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"id": notification_id, "deleted": True}

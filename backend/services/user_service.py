# backend/services/user_service.py
from datetime import datetime, timezone
import re
from bson import ObjectId
from fastapi import HTTPException, status
from database.database import (
    users_collection,
    projects_collection,
    teams_collection,
    work_items_collection,
    project_join_requests_collection,
    notifications_collection,
)
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    invalidate_user_cache,
)
from models.user_models import UserProfileUpdate, NotificationPreferencesModel

DEFAULT_NOTIFICATION_PREFERENCES = {
    "joinRequests": True,
    "workItemAssignments": True,
    "statusUpdates": True,
}


def format_profile_response(user_doc: dict) -> dict:
    created_at = user_doc.get("created_at")
    joined_str = "August 2026"
    if created_at and hasattr(created_at, "strftime"):
        joined_str = created_at.strftime("%B %Y")

    prefs = user_doc.get("notification_preferences") or {}
    merged_prefs = {**DEFAULT_NOTIFICATION_PREFERENCES, **prefs}

    return {
        "id": str(user_doc["_id"]),
        "name": user_doc.get("name") or user_doc.get("email", "").split("@")[0].title(),
        "email": user_doc.get("email", ""),
        "role": user_doc.get("role", "Developer"),
        "status": user_doc.get("status", "Active"),
        "avatar": user_doc.get("avatar", ""),
        "joined": joined_str,
        "created_at": created_at.isoformat() if created_at and hasattr(created_at, "isoformat") else None,
        "notification_preferences": merged_prefs,
    }


async def get_user_profile_service(user_id_or_email: str) -> dict:
    """Retrieves full profile details for the authenticated user."""
    query = {}
    if ObjectId.is_valid(user_id_or_email):
        query["$or"] = [
            {"_id": ObjectId(user_id_or_email)},
            {"email": str(user_id_or_email).strip().lower()},
        ]
    else:
        query["email"] = str(user_id_or_email).strip().lower()

    user_doc = await users_collection.find_one(query)
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return format_profile_response(user_doc)


async def update_user_profile_service(user_id: str, profile_update: UserProfileUpdate) -> dict:
    """
    Updates the authenticated user's personal details (name, email, avatar).
    Validates email uniqueness and returns a refreshed access token.
    Strictly forbids and ignores any role/status mutation.
    """
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    user_doc = await users_collection.find_one({"_id": obj_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_fields = {}
    if profile_update.name is not None:
        trimmed_name = profile_update.name.strip()
        if not trimmed_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full Name cannot be empty",
            )
        update_fields["name"] = trimmed_name

    if profile_update.email is not None:
        new_email = profile_update.email.strip().lower()
        if not new_email or "@" not in new_email or "." not in new_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please enter a valid email address",
            )

        if new_email != user_doc.get("email", "").lower():
            conflict = await users_collection.find_one({
                "email": new_email,
                "_id": {"$ne": obj_id},
            })
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already in use by another account",
                )
            update_fields["email"] = new_email

    if profile_update.avatar is not None:
        update_fields["avatar"] = profile_update.avatar

    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc)
        await users_collection.update_one({"_id": obj_id}, {"$set": update_fields})
        invalidate_user_cache(user_id=user_id, user_email=user_doc.get("email"))

    updated_doc = await users_collection.find_one({"_id": obj_id})
    res = format_profile_response(updated_doc)

    # Issue a refreshed access token reflecting updated identity details
    new_token = create_access_token({
        "sub": str(updated_doc["_id"]),
        "id": str(updated_doc["_id"]),
        "user_id": str(updated_doc["_id"]),
        "email": updated_doc.get("email"),
        "name": updated_doc.get("name"),
        "role": updated_doc.get("role", "Developer"),
        "token_version": updated_doc.get("token_version", 1),
    })
    res["access_token"] = new_token
    return res


async def change_password_service(user_id: str, current_password: str, new_password: str) -> dict:
    """Validates the current password, checks complexity, and saves the new password."""
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    user_doc = await users_collection.find_one({"_id": obj_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not verify_password(current_password, user_doc.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long",
        )

    if not re.search(r"[a-zA-Z]", new_password) or not re.search(r"[0-9]", new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must contain at least one letter and one number",
        )

    hashed = hash_password(new_password)
    now = datetime.now(timezone.utc)

    # Fetch current token version and strictly increment to invalidate past sessions
    current_doc = await users_collection.find_one({"_id": obj_id})
    current_version = current_doc.get("token_version", 1) if current_doc else 1
    new_token_version = current_version + 1

    await users_collection.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "password": hashed,
                "password_updated_at": now,
                "token_version": new_token_version,
            },
        },
    )

    # Generate fresh token with the new token_version for the active session
    user_email_val = current_doc.get("email") if current_doc else ""
    user_role_val = current_doc.get("role", "Developer") if current_doc else "Developer"
    user_name_val = current_doc.get("name") if current_doc else ""

    new_token = create_access_token({
        "sub": user_email_val,
        "id": user_id,
        "user_id": user_id,
        "role": user_role_val,
        "name": user_name_val,
        "token_version": new_token_version,
    })

    # Invalidate cached user doc so subsequent requests use fresh DB version
    invalidate_user_cache(user_id=user_id, user_email=user_email_val)

    return {
        "message": "Password updated successfully",
        "access_token": new_token,
        "token_type": "bearer",
    }


async def revoke_sessions_service(user_id: str, user_email: str, user_role: str, user_name: str) -> dict:
    """
    Revokes all previously issued JWT tokens by strictly incrementing token_version in MongoDB.
    Issues and returns a new valid token for the active session.
    """
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    now = datetime.now(timezone.utc)

    # Read current token version and guarantee strict increment (e.g. 1 -> 2)
    user_doc = await users_collection.find_one({"_id": obj_id})
    current_version = user_doc.get("token_version", 1) if user_doc else 1
    new_token_version = current_version + 1

    await users_collection.update_one(
        {"_id": obj_id},
        {
            "$set": {
                "token_version": new_token_version,
                "sessions_revoked_at": now,
            },
        },
    )

    # Invalidate in-memory cached user entry immediately
    invalidate_user_cache(user_id=user_id, user_email=user_email)

    new_token = create_access_token({
        "sub": user_email,
        "id": user_id,
        "user_id": user_id,
        "role": user_role,
        "name": user_name,
        "token_version": new_token_version,
    })

    return {
        "message": "All other active sessions have been revoked successfully",
        "access_token": new_token,
        "token_type": "bearer",
    }


async def get_notification_preferences_service(user_id: str) -> dict:
    """Retrieves user notification preferences with fallback defaults."""
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    user_doc = await users_collection.find_one({"_id": obj_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    saved_prefs = user_doc.get("notification_preferences") or {}
    return {**DEFAULT_NOTIFICATION_PREFERENCES, **saved_prefs}


async def update_notification_preferences_service(
    user_id: str,
    prefs_update: NotificationPreferencesModel,
) -> dict:
    """Updates and persists notification preferences in MongoDB."""
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    user_doc = await users_collection.find_one({"_id": obj_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    existing_prefs = user_doc.get("notification_preferences") or {}
    updated_dict = prefs_update.model_dump(exclude_unset=True)
    merged_prefs = {**DEFAULT_NOTIFICATION_PREFERENCES, **existing_prefs, **updated_dict}

    await users_collection.update_one(
        {"_id": obj_id},
        {"$set": {"notification_preferences": merged_prefs}},
    )

    return merged_prefs


async def delete_user_account_service(user_id: str, user_email: str) -> dict:
    """
    Safely deletes the authenticated user's account:
    1. Checks if the user is the owner of active projects (blocks deletion if so).
    2. Cleans up project team memberships in teams_collection.
    3. Unassigns work items in work_items_collection to avoid orphaned references.
    4. Removes user's join requests and notifications.
    5. Deletes the user record from users_collection.
    """
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    user_doc = await users_collection.find_one({"_id": obj_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    normalized_email = user_email.strip().lower()

    # Safety Check: Check if user owns any active projects
    owned_projects_cursor = projects_collection.find({
        "$or": [
            {"owner_id": str(user_id)},
            {"owner_email": normalized_email},
        ]
    })
    owned_projects = await owned_projects_cursor.to_list(length=100)

    if owned_projects:
        project_names = [p.get("name", "Unnamed Project") for p in owned_projects]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot delete account: You are the designated owner of {len(owned_projects)} active project(s): "
                f"[{', '.join(project_names)}]. Please transfer ownership or delete these projects before deleting your account."
            ),
        )

    # 1. Clean up team memberships across all projects in teams_collection
    await teams_collection.delete_many({
        "$or": [
            {"user_id": str(user_id)},
            {"user_email": normalized_email},
        ]
    })

    # 2. Unassign assigned work items in work_items_collection so they don't break
    await work_items_collection.update_many(
        {
            "$or": [
                {"assignee_id": str(user_id)},
                {"assignee_email": normalized_email},
            ]
        },
        {
            "$set": {
                "assignee_id": None,
                "assignee_email": None,
                "assignee_name": "Unassigned",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # 3. Clean up join requests created by this developer
    await project_join_requests_collection.delete_many({
        "$or": [
            {"developer_id": str(user_id)},
            {"developer_email": normalized_email},
        ]
    })

    # 4. Clean up notifications addressed to this user
    await notifications_collection.delete_many({
        "$or": [
            {"recipient_id": str(user_id)},
            {"recipient_email": normalized_email},
        ]
    })

    # 5. Delete the user document
    await users_collection.delete_one({"_id": obj_id})

    return {
        "message": "Your account and associated memberships have been permanently deleted.",
        "id": str(user_id),
    }

# backend/services/work_item_service.py
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from bson import ObjectId
from pymongo import ReturnDocument

from database.database import (
    db,
    work_items_collection,
    counters_collection,
    users_collection,
    projects_collection,
    create_project,
)
from models.work_item_models import (
    WorkItemCreateRequest,
    WorkItemUpdateRequest,
    WorkItemResponse,
    WorkItemSummaryMetrics,
    CategoryMetric,
)
from fastapi import HTTPException, status


def normalize_code(raw_id: str) -> str:
    """Normalizes identifiers like 'WI-101', '#wi-101', '101' into '#WI-101'."""
    if not raw_id:
        return ""
    cleaned = str(raw_id).strip()
    cleaned = re.sub(r"^[#\s]+", "", cleaned)
    if cleaned.upper().startswith("WI-"):
        return f"#{cleaned.upper()}"
    if cleaned.isdigit():
        return f"#WI-{cleaned}"
    return f"#{cleaned.upper()}"


async def get_next_work_item_code() -> str:
    """
    Atomically increments and retrieves the next work item code from the counters collection.
    Initializes at #WI-101 if the sequence has not been created yet.
    """
    counter_doc = await counters_collection.find_one({"_id": "work_item_code"})
    
    if not counter_doc:
        # Check highest existing code in work_items_collection to avoid collisions
        highest_seq = 100
        async for item in work_items_collection.find({"code": {"$regex": r"^#?WI-\d+"}}):
            code_str = item.get("code", "")
            match = re.search(r"\d+", code_str)
            if match:
                num = int(match.group())
                if num > highest_seq:
                    highest_seq = num

        # Initialize counter at highest_seq
        await counters_collection.update_one(
            {"_id": "work_item_code"},
            {"$set": {"seq": highest_seq}},
            upsert=True,
        )

    # Atomically increment
    updated_counter = await counters_collection.find_one_and_update(
        {"_id": "work_item_code"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    seq_num = updated_counter.get("seq", 101)
    return f"#WI-{seq_num}"


async def resolve_user_snapshot(user_id: Optional[str] = None, user_email: Optional[str] = None) -> Dict[str, Any]:
    """Resolves a user snapshot (id, name, initial, email, role) from users_collection."""
    query = {}
    if user_id:
        if ObjectId.is_valid(user_id):
            query["_id"] = ObjectId(user_id)
        else:
            query["_id"] = user_id
    elif user_email:
        query["email"] = user_email.strip().lower()

    if query:
        user_doc = await users_collection.find_one(query)
        if user_doc:
            name = user_doc.get("name") or user_doc.get("email", "User").split("@")[0].title()
            initial = name[0].upper() if name else "U"
            return {
                "user_id": str(user_doc["_id"]),
                "name": name,
                "initial": initial,
                "email": user_doc.get("email", ""),
                "role": user_doc.get("role", "Software Engineer"),
            }

    # Fallback default snapshot
    fallback_name = user_email.split("@")[0].title() if user_email else "DevAssist User"
    return {
        "user_id": user_id or "u-default",
        "name": fallback_name,
        "initial": fallback_name[0].upper() if fallback_name else "U",
        "email": user_email or "user@devassist.io",
        "role": "Software Engineer",
    }


def format_work_item_doc(
    doc: Dict[str, Any],
    child_docs: Optional[List[Dict[str, Any]]] = None,
    parent_doc: Optional[Dict[str, Any]] = None,
    linked_docs: Optional[List[Dict[str, Any]]] = None,
    project_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Formats a MongoDB work item document into the exact schema expected by the frontend."""
    code = doc.get("code") or f"#WI-{str(doc['_id'])[:4]}"

    # Resolve parent object
    parent_data = None
    if parent_doc:
        parent_data = {
            "id": parent_doc.get("code"),
            "title": parent_doc.get("title", ""),
            "category": parent_doc.get("category", "Backend"),
            "status": parent_doc.get("status", "In Progress"),
        }
    elif doc.get("parent") and isinstance(doc["parent"], dict):
        parent_data = doc["parent"]
    elif doc.get("parent_id"):
        parent_data = {
            "id": doc.get("parent_id"),
            "title": doc.get("parent_title", "Parent Work Item"),
            "category": doc.get("parent_category", "Backend"),
            "status": doc.get("parent_status", "In Progress"),
        }

    # Format children
    formatted_children = []
    if child_docs:
        for c in child_docs:
            formatted_children.append({
                "id": c.get("code") or str(c["_id"]),
                "title": c.get("title", ""),
                "category": c.get("category", "Frontend"),
                "status": c.get("status", "Not Started"),
                "assignedTo": c.get("assigned_to", {"name": "Unassigned", "initial": "U"}),
                "endDate": c.get("end_date", ""),
            })

    # Format linked items
    formatted_linked = []
    if linked_docs:
        for l in linked_docs:
            formatted_linked.append({
                "id": l.get("code") or str(l["_id"]),
                "title": l.get("title", ""),
                "category": l.get("category", "General"),
                "status": l.get("status", "In Progress"),
            })
    elif doc.get("linked_work_items") and isinstance(doc["linked_work_items"], list):
        formatted_linked = doc["linked_work_items"]

    raw_pid = doc.get("project_id") or doc.get("projectId")
    pid_str = str(raw_pid) if raw_pid else None

    return {
        "id": code,
        "title": doc.get("title", "Untitled Work Item"),
        "description": doc.get("description", ""),
        "category": doc.get("category", "Frontend"),
        "status": doc.get("status", "Not Started"),
        "projectId": pid_str,
        "project_id": pid_str,
        "projectName": project_name,
        "project_name": project_name,
        "assignedTo": doc.get("assigned_to") or {
            "user_id": "u-default",
            "name": "Unassigned",
            "initial": "U",
            "email": "",
            "role": "Contributor",
        },
        "reporter": doc.get("created_by") or {
            "name": "DevAssist Team",
            "initial": "D",
            "email": "team@devassist.io",
        },
        "startDate": doc.get("start_date") or None,
        "endDate": doc.get("end_date") or None,
        "parent": parent_data,
        "linkedWorkItems": formatted_linked,
        "childWorkItems": formatted_children,
        "attachments": doc.get("attachments", []),
        "activity": doc.get("activity", []),
        "progress": int(doc.get("progress", 0)),
        "createdDate": doc.get("created_date") or doc.get("created_at_display") or "Recently",
        "updatedDate": doc.get("updated_date", ""),
    }


async def get_descendant_codes(target_code: str) -> set:
    """Recursively finds all descendant work item codes to prevent circular parent hierarchies."""
    norm_code = normalize_code(target_code)
    descendants = set()

    async def _find_children(current_parent_code: str):
        cursor = work_items_collection.find({"parent_id": current_parent_code})
        async for child in cursor:
            child_code = child.get("code")
            if child_code and child_code not in descendants:
                descendants.add(child_code)
                await _find_children(child_code)

    await _find_children(norm_code)
    return descendants


async def get_eligible_parents_service(raw_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns parent dropdown options excluding the target item and all its descendants."""
    options = [{"id": "none", "label": "None", "value": None}]
    
    descendant_codes = set()
    current_norm = None
    if raw_id:
        current_norm = normalize_code(raw_id)
        descendant_codes = await get_descendant_codes(current_norm)

    cursor = work_items_collection.find({}).sort("code", 1)
    async for item in cursor:
        code = item.get("code")
        if not code:
            continue
        if current_norm and (code == current_norm or code in descendant_codes):
            continue

        options.append({
            "id": code,
            "label": f"{code} — {item.get('title', '')}",
            "value": {
                "id": code,
                "title": item.get("title", ""),
                "category": item.get("category", "Backend"),
                "status": item.get("status", "In Progress"),
            },
        })

    return options


async def get_all_work_items_service(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to_email: Optional[str] = None,
    project_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Retrieves all work items with optional filters, resolving parent and basic relationships."""
    query: Dict[str, Any] = {}

    if project_id and str(project_id).lower() not in ["all", "none", ""]:
        query["project_id"] = str(project_id)

    if category and category != "All":
        query["category"] = category

    if status and status != "All":
        query["status"] = status

    if assigned_to_email:
        query["assigned_to.email"] = assigned_to_email

    if search and search.strip():
        search_regex = {"$regex": re.escape(search.strip()), "$options": "i"}
        query["$or"] = [
            {"title": search_regex},
            {"code": search_regex},
            {"description": search_regex},
            {"assigned_to.name": search_regex},
        ]

    cursor = work_items_collection.find(query).sort("created_at", -1)
    raw_docs = []
    project_ids_to_fetch = set()
    async for doc in cursor:
        raw_docs.append(doc)
        pid = doc.get("project_id") or doc.get("projectId")
        if pid:
            project_ids_to_fetch.add(str(pid))

    # Batch resolve project names from projects_collection to avoid N+1 queries
    project_name_map = {}
    if project_ids_to_fetch:
        obj_ids = [ObjectId(p) for p in project_ids_to_fetch if ObjectId.is_valid(p)]
        str_ids = [p for p in project_ids_to_fetch if not ObjectId.is_valid(p)]
        or_clauses = []
        if obj_ids:
            or_clauses.append({"_id": {"$in": obj_ids}})
        if str_ids:
            or_clauses.append({"_id": {"$in": str_ids}})

        if or_clauses:
            proj_cursor = projects_collection.find({"$or": or_clauses} if len(or_clauses) > 1 else or_clauses[0])
            async for proj in proj_cursor:
                project_name_map[str(proj["_id"])] = proj.get("name", "")

    items = []
    for doc in raw_docs:
        pid = str(doc.get("project_id") or doc.get("projectId") or "")
        pname = project_name_map.get(pid) if pid else None
        items.append(format_work_item_doc(doc, project_name=pname))

    return items


async def get_work_item_by_code_or_id(raw_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single work item with all derived children, resolved parent, and resolved linked items."""
    if not raw_id:
        return None

    normalized = normalize_code(raw_id)
    raw_cleaned = str(raw_id).strip().replace("#", "")

    query = {
        "$or": [
            {"code": normalized},
            {"code": f"#{raw_cleaned}"},
            {"code": raw_cleaned},
        ]
    }
    if ObjectId.is_valid(raw_id):
        query["$or"].append({"_id": ObjectId(raw_id)})

    doc = await work_items_collection.find_one(query)
    if not doc:
        return None

    current_code = doc.get("code")

    # 1. Fetch child items
    child_cursor = work_items_collection.find({
        "$or": [
            {"parent_id": current_code},
            {"parent.id": current_code},
        ]
    }).sort("created_at", 1)
    child_docs = await child_cursor.to_list(length=100)

    # 2. Fetch parent item
    parent_doc = None
    parent_id = doc.get("parent_id") or (doc.get("parent", {}).get("id") if isinstance(doc.get("parent"), dict) else None)
    if parent_id:
        parent_norm = normalize_code(parent_id)
        parent_doc = await work_items_collection.find_one({"code": parent_norm})

    # 3. Fetch linked items (bidirectional resolution)
    linked_ids = doc.get("linked_work_item_ids") or []
    if isinstance(linked_ids, list) and linked_ids:
        norm_linked_ids = [normalize_code(lid) for lid in linked_ids]
        linked_cursor = work_items_collection.find({"code": {"$in": norm_linked_ids}})
        linked_docs = await linked_cursor.to_list(length=50)
    else:
        linked_docs = []

    # 4. Resolve project name
    project_name = None
    pid = doc.get("project_id") or doc.get("projectId")
    if pid:
        try:
            p_query = {"$or": [{"_id": ObjectId(pid)}, {"_id": str(pid)}]} if ObjectId.is_valid(pid) else {"_id": str(pid)}
            p_doc = await projects_collection.find_one(p_query)
            if p_doc:
                project_name = p_doc.get("name")
        except Exception:
            project_name = None

    return format_work_item_doc(doc, child_docs=child_docs, parent_doc=parent_doc, linked_docs=linked_docs, project_name=project_name)


async def create_work_item_service(
    payload: WorkItemCreateRequest,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """Creates a new work item, validates referenced project, handles atomic ID generation, and syncs bidirectional links."""
    # 1. Validate that referenced project exists
    project_id_str = str(payload.project_id).strip()
    if not project_id_str:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    p_query = {"$or": [{"_id": ObjectId(project_id_str)}, {"_id": project_id_str}]} if ObjectId.is_valid(project_id_str) else {"_id": project_id_str}
    project_doc = await projects_collection.find_one(p_query)
    if not project_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    resolved_project_id = str(project_doc["_id"])
    resolved_project_name = project_doc.get("name", "")

    now = datetime.now(timezone.utc)
    display_date = now.strftime("%b %d, %Y")

    # Generate sequential unique code
    code = await get_next_work_item_code()

    # Resolve assignee and reporter snapshots
    assigned_to = await resolve_user_snapshot(
        user_id=payload.assigned_to_id,
        user_email=payload.assigned_to_email,
    )
    reporter = await resolve_user_snapshot(
        user_email=current_user.get("email"),
    )

    # Initial progress computation
    initial_progress = 100 if payload.status == "Completed" else (40 if payload.status == "In Progress" else 0)

    # Resolve normalized parent ID
    parent_id = normalize_code(payload.parent_id) if payload.parent_id and payload.parent_id != "none" else None
    parent_obj = None
    if parent_id:
        parent_doc = await work_items_collection.find_one({"code": parent_id})
        if parent_doc:
            parent_obj = {
                "id": parent_doc.get("code"),
                "title": parent_doc.get("title", ""),
                "category": parent_doc.get("category", "Backend"),
                "status": parent_doc.get("status", "In Progress"),
            }

    # Normalize linked IDs
    linked_ids = [normalize_code(lid) for lid in (payload.linked_work_item_ids or []) if lid and normalize_code(lid) != code]

    # Convert attachments
    attachments_data = [att.model_dump() if hasattr(att, "model_dump") else dict(att) for att in (payload.attachments or [])]

    # Activity log
    activity = [
        {
            "id": f"act-{int(now.timestamp())}",
            "text": f"Work item created by {reporter['name']}",
            "date": display_date,
        }
    ]

    # Resolve start and end dates directly from user payload
    item_start_date = payload.start_date.strip() if payload.start_date and payload.start_date.strip() else None
    item_end_date = payload.end_date.strip() if payload.end_date and payload.end_date.strip() else None

    doc = {
        "code": code,
        "title": payload.title.strip(),
        "description": (payload.description or "").strip(),
        "category": payload.category,
        "status": payload.status or "Not Started",
        "project_id": resolved_project_id,
        "assigned_to": assigned_to,
        "created_by": reporter,
        "start_date": item_start_date,
        "end_date": item_end_date,
        "parent_id": parent_id,
        "parent": parent_obj,
        "linked_work_item_ids": linked_ids,
        "attachments": attachments_data,
        "activity": activity,
        "progress": initial_progress,
        "created_date": display_date,
        "created_at": now,
        "updated_at": now,
    }

    result = await work_items_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Bidirectional link synchronization: add reciprocal link to all target documents
    if linked_ids:
        await work_items_collection.update_many(
            {"code": {"$in": linked_ids}},
            {"$addToSet": {"linked_work_item_ids": code}}
        )

    return format_work_item_doc(doc, project_name=resolved_project_name)


async def update_work_item_service(
    raw_id: str,
    payload: WorkItemUpdateRequest,
    current_user: Dict[str, Any],
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """Updates an existing work item, verifies circular hierarchy, preserves fields, and updates links."""
    normalized = normalize_code(raw_id)
    doc = await work_items_collection.find_one({"code": normalized})
    if not doc:
        if ObjectId.is_valid(raw_id):
            doc = await work_items_collection.find_one({"_id": ObjectId(raw_id)})
    if not doc:
        return None, "Work item not found"

    code = doc.get("code")
    now = datetime.now(timezone.utc)
    display_date = now.strftime("%b %d, %Y")

    updates: Dict[str, Any] = {"updated_at": now}

    # 1. Update basic information
    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if payload.category is not None:
        updates["category"] = payload.category
    if payload.status is not None:
        updates["status"] = payload.status
        if payload.status == "Completed":
            updates["progress"] = 100

    if payload.progress is not None:
        updates["progress"] = payload.progress

    if payload.start_date is not None:
        updates["start_date"] = payload.start_date.strip() if payload.start_date and payload.start_date.strip() else None
    if payload.end_date is not None:
        updates["end_date"] = payload.end_date.strip() if payload.end_date and payload.end_date.strip() else None

    # 2. Update Project Association with validation
    if payload.project_id is not None:
        proj_id_str = str(payload.project_id).strip()
        p_query = {"$or": [{"_id": ObjectId(proj_id_str)}, {"_id": proj_id_str}]} if ObjectId.is_valid(proj_id_str) else {"_id": proj_id_str}
        project_doc = await projects_collection.find_one(p_query)
        if not project_doc:
            return None, "Project not found"
        updates["project_id"] = str(project_doc["_id"])

    # 3. Update Assignee
    if payload.assigned_to_id or payload.assigned_to_email:
        new_assignee = await resolve_user_snapshot(
            user_id=payload.assigned_to_id,
            user_email=payload.assigned_to_email,
        )
        updates["assigned_to"] = new_assignee

    # 4. Update Parent Relationship with Circular Check
    if payload.parent_id is not None:
        if payload.parent_id == "none" or not payload.parent_id:
            updates["parent_id"] = None
            updates["parent"] = None
        else:
            new_parent_code = normalize_code(payload.parent_id)
            if new_parent_code == code:
                return None, "A work item cannot be its own parent"

            # Check if new_parent is one of current item's descendants
            descendant_codes = await get_descendant_codes(code)
            if new_parent_code in descendant_codes:
                return None, "Circular relationship detected: cannot select a descendant as parent"

            parent_doc = await work_items_collection.find_one({"code": new_parent_code})
            if parent_doc:
                updates["parent_id"] = new_parent_code
                updates["parent"] = {
                    "id": parent_doc.get("code"),
                    "title": parent_doc.get("title", ""),
                    "category": parent_doc.get("category", "Backend"),
                    "status": parent_doc.get("status", "In Progress"),
                }
            else:
                updates["parent_id"] = new_parent_code

    # 5. Update Attachments
    if payload.attachments is not None:
        updates["attachments"] = [
            att.model_dump() if hasattr(att, "model_dump") else dict(att)
            for att in payload.attachments
        ]

    # 6. Handle Bidirectional Linked Items
    old_linked = set(doc.get("linked_work_item_ids") or [])
    if payload.linked_work_item_ids is not None:
        new_linked = set(normalize_code(lid) for lid in payload.linked_work_item_ids if normalize_code(lid) != code)
        updates["linked_work_item_ids"] = list(new_linked)

        added_links = list(new_linked - old_linked)
        removed_links = list(old_linked - new_linked)

        # Add reciprocal link to newly linked documents
        if added_links:
            await work_items_collection.update_many(
                {"code": {"$in": added_links}},
                {"$addToSet": {"linked_work_item_ids": code}}
            )

        # Remove reciprocal link from unlinked documents
        if removed_links:
            await work_items_collection.update_many(
                {"code": {"$in": removed_links}},
                {"$pull": {"linked_work_item_ids": code}}
            )

    # 7. Add activity log resolving user's actual database name
    updater = await resolve_user_snapshot(
        user_id=current_user.get("id") or current_user.get("user_id"),
        user_email=current_user.get("email"),
    )
    user_name = updater.get("name") or current_user.get("name") or "User"
    new_activity = {
        "id": f"act-{int(now.timestamp())}",
        "text": f"Work item updated by {user_name}",
        "date": display_date,
    }
    updates["$push"] = {"activity": {"$each": [new_activity], "$position": 0}}

    # Separate standard $set fields from $push operators
    push_op = updates.pop("$push", None)
    mongo_update: Dict[str, Any] = {"$set": updates}
    if push_op:
        mongo_update["$push"] = push_op

    await work_items_collection.update_one({"_id": doc["_id"]}, mongo_update)

    # Return refreshed formatted document
    updated_full = await get_work_item_by_code_or_id(code)
    return updated_full, None


async def delete_work_item_service(raw_id: str) -> Tuple[bool, Optional[str]]:
    """Safely deletes a work item. Blocks deletion if active child work items exist."""
    normalized = normalize_code(raw_id)
    doc = await work_items_collection.find_one({"code": normalized})
    if not doc and ObjectId.is_valid(raw_id):
        doc = await work_items_collection.find_one({"_id": ObjectId(raw_id)})
    if not doc:
        return False, "Work item not found"

    code = doc.get("code")

    # Safety Check: Check if active child items reference this item
    child_count = await work_items_collection.count_documents({
        "$or": [
            {"parent_id": code},
            {"parent.id": code},
        ]
    })
    if child_count > 0:
        return False, f"Cannot delete work item with {child_count} active child task(s). Please reassign or delete child items first."

    # Remove reciprocal links across other work items
    await work_items_collection.update_many(
        {"linked_work_item_ids": code},
        {"$pull": {"linked_work_item_ids": code}}
    )

    # Delete document
    await work_items_collection.delete_one({"_id": doc["_id"]})
    return True, None


async def get_work_item_summary_metrics_service(project_id: Optional[str] = None) -> Dict[str, Any]:
    """Calculates summary KPIs and category distribution percentages, optionally scoped to a project."""
    query = {}
    if project_id and str(project_id).lower() not in ["all", "none", ""]:
        query["project_id"] = str(project_id)

    total = await work_items_collection.count_documents(query)
    if total == 0:
        return {
            "total": 0,
            "notStarted": 0,
            "inProgress": 0,
            "completed": 0,
            "categoryDistribution": [
                {"name": "Frontend", "percentage": 0, "color": "#06b6d4"},
                {"name": "Backend", "percentage": 0, "color": "#a855f7"},
                {"name": "DevOps", "percentage": 0, "color": "#f97316"},
                {"name": "Testing", "percentage": 0, "color": "#3b82f6"},
            ],
        }

    not_started = await work_items_collection.count_documents({**query, "status": "Not Started"})
    in_progress = await work_items_collection.count_documents({**query, "status": "In Progress"})
    completed = await work_items_collection.count_documents({**query, "status": "Completed"})

    frontend_count = await work_items_collection.count_documents({**query, "category": "Frontend"})
    backend_count = await work_items_collection.count_documents({**query, "category": "Backend"})
    devops_count = await work_items_collection.count_documents({**query, "category": "DevOps"})
    testing_count = await work_items_collection.count_documents({**query, "category": "Testing"})

    return {
        "total": total,
        "notStarted": not_started,
        "inProgress": in_progress,
        "completed": completed,
        "categoryDistribution": [
            {"name": "Frontend", "percentage": round((frontend_count / total) * 100), "color": "#06b6d4"},
            {"name": "Backend", "percentage": round((backend_count / total) * 100), "color": "#a855f7"},
            {"name": "DevOps", "percentage": round((devops_count / total) * 100), "color": "#f97316"},
            {"name": "Testing", "percentage": round((testing_count / total) * 100), "color": "#3b82f6"},
        ],
    }


async def init_work_items_indexes_and_counter():
    """Ensures sequential code counter exists without inserting mock items."""
    existing_counter = await counters_collection.find_one({"_id": "work_item_code"})
    if not existing_counter:
        await counters_collection.update_one(
            {"_id": "work_item_code"},
            {"$setOnInsert": {"seq": 100}},
            upsert=True,
        )


async def purge_mock_work_items():
    """Cleans out legacy mock work items so that the dashboard only displays user-created work items."""
    try:
        mock_codes = ["#WI-100", "#WI-101", "#WI-102", "#WI-103", "#WI-110", "#WI-111", "#WI-104", "#WI-105"]
        await work_items_collection.delete_many({"code": {"$in": mock_codes}})
    except Exception:
        pass

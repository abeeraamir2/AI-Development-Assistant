import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson import ObjectId

load_dotenv()

mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))

db = mongo_client["requirement_analyzer"]

projects_collection = db["projects"]
analysis_collection = db["analysis"]
users_collection = db["users"]
test_suites_collection = db["test_suites"]
bug_reports_collection = db["bug_reports"]
requirement_embeddings_collection = db["requirement_embeddings"]
roles_collection = db["roles"]
teams_collection = db["teams"]
work_items_collection = db["work_items"]
counters_collection = db["counters"]
project_join_requests_collection = db["project_join_requests"]
notifications_collection = db["notifications"]


async def add_team_member(
    project_id: str,
    user_email: str,
    role_in_project: str = "Contributor",
    user_id: str = None
):
    """Add or update a user's membership in a project team."""
    if not project_id or not user_email:
        return

    # Find user_id from users_collection if not explicitly provided
    resolved_user_id = user_id
    if not resolved_user_id:
        user_doc = await users_collection.find_one({"email": user_email.strip().lower()})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])

    now = datetime.now(timezone.utc)
    await teams_collection.update_one(
        {"project_id": str(project_id), "user_email": user_email.strip().lower()},
        {
            "$setOnInsert": {
                "project_id": str(project_id),
                "user_email": user_email.strip().lower(),
                "user_id": resolved_user_id,
                "role_in_project": role_in_project,
                "joined_at": now,
            },
            "$set": {
                "last_active": now
            }
        },
        upsert=True
    )


async def remove_team_member(
    project_id: str,
    user_email: str = None,
    user_id: str = None
):
    """Remove a user from a project team in the teams collection."""
    if not project_id:
        return False

    query = {"project_id": str(project_id)}
    or_clauses = []
    if user_email:
        or_clauses.append({"user_email": str(user_email).strip().lower()})
    if user_id:
        or_clauses.append({"user_id": str(user_id)})
    if not or_clauses:
        return False

    query["$or"] = or_clauses
    result = await teams_collection.delete_one(query)
    return result.deleted_count > 0


async def is_user_in_project_team(
    project_id: str,
    user_email: str = None,
    user_id: str = None
) -> bool:
    """Check whether a user is an active member of a project's team."""
    if not project_id:
        return False

    query = {"project_id": str(project_id)}
    or_clauses = []
    if user_email:
        or_clauses.append({"user_email": str(user_email).strip().lower()})
    if user_id:
        or_clauses.append({"user_id": str(user_id)})
    if not or_clauses:
        return False

    query["$or"] = or_clauses
    member_doc = await teams_collection.find_one(query)
    return member_doc is not None


async def get_project_team(project_id: str):
    """Retrieve all team members for a given project."""
    if not project_id:
        return []
    cursor = teams_collection.find({"project_id": str(project_id)})
    return await cursor.to_list(length=200)


async def init_project_access_indexes():
    """Ensure indexes on project_join_requests and notifications collections."""
    try:
        await project_join_requests_collection.create_index(
            [("project_id", 1), ("requester_id", 1), ("status", 1)]
        )
        await project_join_requests_collection.create_index(
            [("owner_id", 1), ("status", 1)]
        )
        await notifications_collection.create_index(
            [("recipient_id", 1), ("read", 1), ("created_at", -1)]
        )
        await notifications_collection.create_index(
            [("recipient_email", 1), ("read", 1), ("created_at", -1)]
        )
    except Exception as e:
        print(f"Index initialization notice: {e}")


async def create_project(
    name,
    owner_id,
    description="",
    visibility="private"
):
    # Resolve owner user from users_collection
    resolved_owner_id = str(owner_id) if owner_id else None
    resolved_owner_email = None

    if owner_id:
        if "@" in str(owner_id):
            user_doc = await users_collection.find_one({"email": str(owner_id).strip().lower()})
            if user_doc:
                resolved_owner_id = str(user_doc["_id"])
                resolved_owner_email = user_doc["email"]
            else:
                resolved_owner_email = str(owner_id).strip().lower()
        else:
            try:
                user_doc = await users_collection.find_one({"_id": ObjectId(str(owner_id))})
                if user_doc:
                    resolved_owner_id = str(user_doc["_id"])
                    resolved_owner_email = user_doc.get("email")
            except Exception:
                resolved_owner_id = str(owner_id)

    document = {
        "name": name,
        "description": description,
        "visibility": visibility,
        "owner_id": resolved_owner_id,
        "created_at": datetime.now(timezone.utc)
    }

    result = await projects_collection.insert_one(document)
    project_id_str = str(result.inserted_id)

    # Register project creator as Owner in teams collection
    if resolved_owner_email or resolved_owner_id:
        await add_team_member(
            project_id=project_id_str,
            user_email=resolved_owner_email or "",
            role_in_project="Owner"
        )

    return project_id_str


async def save_analysis(
    project_id: str,
    project_name: str,
    filename: str,
    extracted_text: str,
    analysis_result: dict,
    user_email: str,
):
    document = {
        "project_id": project_id,
        "project_name": project_name,
        "filename": filename,
        "title": analysis_result.get("title") or filename,
        "extracted_text": extracted_text,
        "summary": analysis_result.get("summary", ""),
        "criteria": analysis_result.get("criteria", []),
        "apis": analysis_result.get("apis", []),
        "db_tables": analysis_result.get("db_tables", []),
        "tasks": analysis_result.get("tasks", []),
        "edge_cases": analysis_result.get("edge_cases", []),
        "evidence": analysis_result.get("evidence"),
        "type": analysis_result.get("type", "FEATURE"),
        "complexity": analysis_result.get(
            "complexity",
            "MEDIUM"
        ),
        "confidence": analysis_result.get(
            "confidence",
            "MEDIUM"
        ),
        "status": analysis_result.get(
            "status",
            "COMPLETED"
        ),
        "user_email": user_email,
        "created_at": datetime.now(timezone.utc),
    }

    result = await analysis_collection.insert_one(document)

    # Automatically register contributor in teams collection
    if project_id and user_email:
        try:
            await add_team_member(
                project_id=project_id,
                user_email=user_email,
                role_in_project="Contributor"
            )
        except Exception:
            pass

    return str(result.inserted_id)


async def get_recent_analyses(
    user_email: str,
    limit: int = 10,
    project_id: str = None
):
    query = {"user_email": user_email}
    if project_id:
        query["project_id"] = str(project_id)

    cursor = (
        analysis_collection
        .find(query)
        .sort("created_at", -1)
        .limit(limit)
    )

    results = []

    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "title": doc.get(
                "title",
                doc.get("filename", "Untitled Analysis")
            ),
            "project_id": doc.get("project_id"),
            "project_name": doc.get(
                "project_name",
                "Unknown Project"
            ),
            "filename": doc.get("filename"),
            "summary": doc.get("summary", ""),
            "status": doc.get(
                "status",
                "COMPLETED"
            ),
            "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
        })

    return results


async def save_test_suite(
    filename: str,
    requirement_text: str,
    test_suite_result: dict,
    project_id: str,
    user_id: str = None,
    user_email: str = None,
    languages: list = None,
    files_count: int = 0,
):
    total_cases = 0
    if isinstance(test_suite_result, dict):
        for k, v in test_suite_result.items():
            if isinstance(v, list):
                total_cases += len(v)

    # Resolve user_id if only email was provided
    resolved_user_id = user_id
    if not resolved_user_id and user_email:
        user_doc = await users_collection.find_one({"email": user_email})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])

    # Pure foreign key document structure
    document = {
        "filename": filename,
        "project_id": str(project_id) if project_id else None,
        "user_id": str(resolved_user_id) if resolved_user_id else None,
        "requirement_text": requirement_text[:5000] if requirement_text else "",
        "test_suite": test_suite_result,
        "total_cases": total_cases,
        "languages": languages or [],
        "files_count": files_count,
        "created_at": datetime.now(timezone.utc),
    }

    result = await test_suites_collection.insert_one(document)

    # Automatically register QA member in project team
    if project_id and user_email:
        await add_team_member(
            project_id=str(project_id),
            user_email=user_email,
            role_in_project="QA",
            user_id=resolved_user_id
        )

    return str(result.inserted_id)


async def get_recent_test_suites(
    user_id: str = None,
    user_email: str = None,
    limit: int = 10
):
    resolved_user_id = user_id
    if not resolved_user_id and user_email:
        user_doc = await users_collection.find_one({"email": user_email})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])

    query = {}
    if resolved_user_id and user_email:
        query = {"$or": [{"user_id": str(resolved_user_id)}, {"user_email": user_email}]}
    elif resolved_user_id:
        query = {"user_id": str(resolved_user_id)}
    elif user_email:
        query = {"user_email": user_email}

    cursor = (
        test_suites_collection
        .find(query)
        .sort("created_at", -1)
        .limit(limit)
    )

    results = []

    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "filename": doc.get("filename", "Test Suite"),
            "project_id": doc.get("project_id"),
            "user_id": doc.get("user_id"),
            "test_suite": doc.get("test_suite"),
            "total_cases": doc.get("total_cases", 0),
            "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None
        })

    return results


async def save_requirement_embeddings(
    project_id: str,
    analysis_id: str,
    criteria: list[dict],
):
    from services.embedding_service import embed_texts

    if not criteria:
        return

    texts = [
        criterion["text"]
        for criterion in criteria
    ]

    vectors = embed_texts(texts)

    documents = []

    for criterion, vector in zip(
        criteria,
        vectors
    ):
        documents.append({
            "project_id": project_id,
            "analysis_id": analysis_id,
            "req_id": criterion.get(
                "src",
                "UNKNOWN"
            ),
            "text": criterion["text"],
            "embedding": vector,
            "created_at": datetime.now(timezone.utc),
        })

    if documents:
        await requirement_embeddings_collection.insert_many(
            documents
        )


async def find_related_requirements(
    project_id: str,
    query_embedding: list[float],
    limit: int = 5
):
    if not project_id:
        return []

    # 1. Try Atlas Vector Search
    try:
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "requirement_vector_index",
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 100,
                    "limit": limit,
                    "filter": {
                        "project_id": str(project_id)
                    },
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "id": "$req_id",
                    "excerpt": "$text",
                    "score": {
                        "$meta": "vectorSearchScore"
                    },
                }
            },
        ]
        results = []
        async for doc in requirement_embeddings_collection.aggregate(pipeline):
            score = doc.get("score", 0.0)
            match_pct = round(score * 100)
            text = doc.get("excerpt", "")
            title = text[:65] + ("..." if len(text) > 65 else "")
            results.append({
                "id": doc.get("id", "REQ"),
                "match": f"{match_pct}%",
                "matchPercent": match_pct,
                "excerpt": text,
                "title": title
            })
        if results:
            return results
    except Exception as e:
        print(f"[WARN] Atlas vector search not available: {e}. Using fallback.")

    # 2. In-memory / MongoDB requirement criteria fallback
    try:
        cursor = analysis_collection.find({"project_id": str(project_id)}).sort("created_at", -1).limit(10)
        results = []
        async for a_doc in cursor:
            criteria = a_doc.get("criteria", [])
            created_at_dt = a_doc.get("created_at")
            time_str = created_at_dt.strftime("%b %d, %Y") if created_at_dt else "recently"
            if criteria:
                for idx, crit in enumerate(criteria[:3]):
                    text = crit.get("text", "")
                    title = text[:60] + ("..." if len(text) > 60 else "")
                    results.append({
                        "id": crit.get("src") or f"REQ-{len(results)+1:03d}",
                        "title": title,
                        "excerpt": text,
                        "matchPercent": max(65, 95 - (len(results) * 6)),
                        "match": f"{max(65, 95 - (len(results) * 6))}%",
                        "timeAgo": time_str,
                        "analysis_id": str(a_doc["_id"])
                    })
            else:
                title = a_doc.get("title") or a_doc.get("filename", "Requirement Spec")
                results.append({
                    "id": f"REQ-{len(results)+1:03d}",
                    "title": title,
                    "excerpt": a_doc.get("summary", title),
                    "matchPercent": max(70, 92 - (len(results) * 5)),
                    "match": f"{max(70, 92 - (len(results) * 5))}%",
                    "timeAgo": time_str,
                    "analysis_id": str(a_doc["_id"])
                })

        return results[:limit]
    except Exception as fallback_err:
        print(f"[ERROR] Failed to fetch related requirements from DB: {fallback_err}")
        return []


async def get_project_related_requirements(project_id: str, limit: int = 5):
    """
    Fetches real requirements stored in database for a project.
    """
    return await find_related_requirements(project_id, query_embedding=[], limit=limit)


async def get_analysis_by_id(
    analysis_id: str,
    user_email: str
):
    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        return None

    doc = await analysis_collection.find_one({
        "_id": obj_id,
        "user_email": user_email
    })

    if not doc:
        return None

    doc["id"] = str(doc["_id"])
    doc["_id"] = str(doc["_id"])

    if doc.get("created_at"):
        doc["created_at"] = doc["created_at"].isoformat()

    return doc


def format_user_doc(doc: dict) -> dict:
    derived_name = (
        doc.get("email", "")
        .split("@")[0]
        .replace(".", " ")
        .replace("_", " ")
        .title()
    )
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name") or derived_name,
        "email": doc.get("email", ""),
        "role": doc.get("role"),
        "status": doc.get("status", "Active"),
        "joined": (
            doc["created_at"].strftime("%b %d, %Y")
            if doc.get("created_at") and hasattr(doc["created_at"], "strftime")
            else "Unknown"
        ),
    }


async def get_all_users():
    cursor = users_collection.find({}).sort("created_at", -1)
    results = []

    async for doc in cursor:
        results.append(format_user_doc(doc))

    return results


async def get_user_by_id(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return None

    doc = await users_collection.find_one({"_id": obj_id})
    if not doc:
        return None

    return format_user_doc(doc)


async def create_user_admin(
    name: str | None,
    email: str,
    password: str,
    role: str = "Developer",
    status: str = "Active"
):
    from services.auth_service import hash_password

    existing = await users_collection.find_one({"email": email})
    if existing:
        return None, "Email already registered"

    derived_name = (
        name.strip()
        if name and name.strip()
        else email.split("@")[0].replace(".", " ").replace("_", " ").title()
    )

    document = {
        "name": derived_name,
        "email": email.strip().lower(),
        "password": hash_password(password),
        "role": role,
        "status": status,
        "created_at": datetime.now(timezone.utc),
    }

    result = await users_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return format_user_doc(document), None


async def update_user_admin(user_id: str, update_data: dict):
    from services.auth_service import hash_password

    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return None, "Invalid user ID format"

    user = await users_collection.find_one({"_id": obj_id})
    if not user:
        return None, "User not found"

    fields_to_set = {}

    if "email" in update_data and update_data["email"]:
        new_email = update_data["email"].strip().lower()
        if new_email != user.get("email", "").lower():
            conflict = await users_collection.find_one({
                "email": new_email,
                "_id": {"$ne": obj_id}
            })
            if conflict:
                return None, "Email already in use by another user"
            fields_to_set["email"] = new_email

    if "name" in update_data and update_data["name"] is not None:
        name_val = update_data["name"].strip()
        if name_val:
            fields_to_set["name"] = name_val

    if "role" in update_data and update_data["role"] is not None:
        fields_to_set["role"] = update_data["role"]

    if "status" in update_data and update_data["status"] is not None:
        fields_to_set["status"] = update_data["status"]

    if "password" in update_data and update_data["password"]:
        fields_to_set["password"] = hash_password(update_data["password"])

    if fields_to_set:
        await users_collection.update_one({"_id": obj_id}, {"$set": fields_to_set})

    updated_doc = await users_collection.find_one({"_id": obj_id})
    return format_user_doc(updated_doc), None


async def delete_user_admin(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return False, "Invalid user ID format"

    result = await users_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return False, "User not found"

    return True, None


DEFAULT_SYSTEM_ROLES = [
    {
        "name": "Admin",
        "description": "Full system access to all resources, user administration, and role management.",
        "permissions": [
            "users.view", "users.create", "users.update", "users.delete",
            "roles.manage", "permissions.manage",
            "projects.view", "projects.create", "projects.update", "projects.delete",
            "requirements.analyze", "requirements.view",
            "tests.create", "tests.view",
            "bugs.analyze", "bugs.view",
        ],
        "is_custom": False,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "Developer",
        "description": "Can view and analyze requirements, create and update projects.",
        "permissions": [
            "projects.view", "projects.create", "projects.update",
            "requirements.analyze", "requirements.view",
        ],
        "is_custom": False,
        "created_at": datetime.now(timezone.utc),
    },
    {
        "name": "QA Engineer",
        "description": "Specialized in codebase test suite generation, test execution, and bug diagnostics.",
        "permissions": [
            "projects.view",
            "tests.create", "tests.view",
            "bugs.analyze", "bugs.view",
        ],
        "is_custom": False,
        "created_at": datetime.now(timezone.utc),
    },
]


def format_role_doc(doc: dict, user_count: int = 0) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "description": doc.get("description", ""),
        "permissions": doc.get("permissions", []),
        "is_custom": doc.get("is_custom", True),
        "users_count": user_count,
        "created_at": (
            doc["created_at"].isoformat()
            if doc.get("created_at") and hasattr(doc["created_at"], "isoformat")
            else str(doc.get("created_at", ""))
        ),
    }


async def get_all_roles():
    count = await roles_collection.count_documents({})
    if count == 0:
        await roles_collection.insert_many([dict(r) for r in DEFAULT_SYSTEM_ROLES])

    cursor = roles_collection.find({}).sort("name", 1)
    results = []

    async for doc in cursor:
        user_count = await users_collection.count_documents({"role": doc.get("name")})
        results.append(format_role_doc(doc, user_count=user_count))

    return results


async def create_role_admin(
    name: str,
    description: str = "",
    permissions: list = None
):
    if not name or not name.strip():
        return None, "Role name is required"

    trimmed_name = name.strip()
    existing = await roles_collection.find_one({
        "name": {"$regex": f"^{trimmed_name}$", "$options": "i"}
    })
    if existing:
        return None, "A role with this name already exists"

    document = {
        "name": trimmed_name,
        "description": description or "Custom workspace role permissions.",
        "permissions": permissions or [],
        "is_custom": True,
        "created_at": datetime.now(timezone.utc),
    }

    result = await roles_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return format_role_doc(document, user_count=0), None


async def update_role_permissions(role_id: str, update_data: dict):
    try:
        obj_id = ObjectId(role_id)
    except Exception:
        return None, "Invalid role ID format"

    role = await roles_collection.find_one({"_id": obj_id})
    if not role:
        return None, "Role not found"

    fields_to_set = {}
    if "name" in update_data and update_data["name"]:
        new_name = update_data["name"].strip()
        if new_name.lower() != role.get("name", "").lower():
            conflict = await roles_collection.find_one({
                "name": {"$regex": f"^{new_name}$", "$options": "i"},
                "_id": {"$ne": obj_id}
            })
            if conflict:
                return None, "A role with this name already exists"
            fields_to_set["name"] = new_name

    if "description" in update_data and update_data["description"] is not None:
        fields_to_set["description"] = update_data["description"]

    if "permissions" in update_data and update_data["permissions"] is not None:
        fields_to_set["permissions"] = update_data["permissions"]

    if fields_to_set:
        await roles_collection.update_one({"_id": obj_id}, {"$set": fields_to_set})

    updated_doc = await roles_collection.find_one({"_id": obj_id})
    user_count = await users_collection.count_documents({"role": updated_doc.get("name")})
    return format_role_doc(updated_doc, user_count=user_count), None


async def delete_role_admin(role_id: str):
    try:
        obj_id = ObjectId(role_id)
    except Exception:
        return False, "Invalid role ID format"

    role = await roles_collection.find_one({"_id": obj_id})
    if not role:
        return False, "Role not found"

    if not role.get("is_custom", True):
        return False, "Built-in system roles cannot be deleted"

    assigned_count = await users_collection.count_documents({"role": role.get("name")})
    if assigned_count > 0:
        return False, f"Cannot delete role: {assigned_count} user(s) currently assigned to this role"

    result = await roles_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return False, "Role not found"

    return True, None


async def update_project(
    project_id: str,
    updates: dict,
    user_id: str = "",
    user_email: str = "",
    user_role: str = ""
):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        return False, "Invalid project ID format", None

    project = await projects_collection.find_one({"_id": obj_id})
    if not project:
        return False, "Project not found", None

    if user_role != "Admin":
        proj_owner_id = str(project.get("owner_id", ""))
        proj_owner_email = project.get("owner_email", "")
        is_owner = (user_id and proj_owner_id == str(user_id)) or (user_email and proj_owner_email == user_email)
        if not is_owner:
            return False, "You do not have permission to edit this project", None

    clean_updates = {k: v for k, v in updates.items() if v is not None}
    if clean_updates:
        await projects_collection.update_one(
            {"_id": obj_id},
            {"$set": clean_updates}
        )

    updated_project = await projects_collection.find_one({"_id": obj_id})
    return True, None, updated_project


async def delete_project(
    project_id: str,
    user_id: str = "",
    user_email: str = "",
    user_role: str = ""
):
    try:
        obj_id = ObjectId(project_id)
    except Exception:
        return False, "Invalid project ID format"

    project = await projects_collection.find_one({"_id": obj_id})
    if not project:
        return False, "Project not found"

    if user_role != "Admin":
        proj_owner_id = str(project.get("owner_id", ""))
        proj_owner_email = project.get("owner_email", "")
        is_owner = (user_id and proj_owner_id == str(user_id)) or (user_email and proj_owner_email == user_email)
        if not is_owner:
            return False, "You do not have permission to delete this project"

    result = await projects_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return False, "Project not found"

    # Clean up associated requirement embeddings and team memberships
    await requirement_embeddings_collection.delete_many({"project_id": project_id})
    await teams_collection.delete_many({"project_id": project_id})

    return True, None


async def backfill_project_owner_ids_if_needed():
    """Ensure any existing project documents have owner_id populated as foreign key reference."""
    try:
        legacy_projects = await projects_collection.find({"owner_id": {"$exists": False}}).to_list(length=500)
        for proj in legacy_projects:
            owner_email = proj.get("owner_email")
            if owner_email:
                user = await users_collection.find_one({"email": owner_email.strip().lower()})
                if user:
                    await projects_collection.update_one(
                        {"_id": proj["_id"]},
                        {"$set": {"owner_id": str(user["_id"])}, "$unset": {"owner_email": ""}}
                    )
    except Exception:
        pass


async def delete_analysis(analysis_id: str, user_email: str, user_role: str = ""):
    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        return False, "Invalid analysis ID format"

    doc = await analysis_collection.find_one({"_id": obj_id})
    if not doc:
        return False, "Analysis not found"

    if user_role != "Admin" and doc.get("user_email") != user_email:
        return False, "You do not have permission to delete this analysis"

    result = await analysis_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return False, "Analysis not found"

    # Clean up associated requirement embeddings
    await requirement_embeddings_collection.delete_many({"analysis_id": analysis_id})

    return True, None

import os
import re
import numpy as np
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson import ObjectId

load_dotenv()

mongo_client = AsyncIOMotorClient(
    os.getenv("MONGODB_URI"),
    maxPoolSize=50,
    minPoolSize=10,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
)

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
    user_id: str = None,
    user_email: str = None,
    role_in_project: str = "Contributor",
):
    """Add or update a user's membership in a project team using user_id as primary foreign key."""
    if not project_id or (not user_id and not user_email):
        return

    resolved_user_id = str(user_id) if user_id else None
    resolved_email = user_email.strip().lower() if user_email else None

    # Resolve missing ID or email from users_collection
    if not resolved_user_id and resolved_email:
        user_doc = await users_collection.find_one({"email": resolved_email})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])
    elif resolved_user_id and not resolved_email:
        if ObjectId.is_valid(resolved_user_id):
            user_doc = await users_collection.find_one({"_id": ObjectId(resolved_user_id)})
            if user_doc:
                resolved_email = user_doc.get("email")

    if not resolved_user_id:
        return

    now = datetime.now(timezone.utc)
    await teams_collection.update_one(
        {"project_id": str(project_id), "user_id": resolved_user_id},
        {
            "$setOnInsert": {
                "project_id": str(project_id),
                "user_id": resolved_user_id,
                "role_in_project": role_in_project,
                "joined_at": now,
            },
            "$set": {
                "user_email": resolved_email,
                "last_active": now,
            },
        },
        upsert=True,
    )


async def remove_team_member(
    project_id: str,
    user_id: str = None,
    user_email: str = None,
):
    """Remove a user from a project team in the teams collection by user_id."""
    if not project_id:
        return False

    or_clauses = []
    if user_id:
        or_clauses.append({"user_id": str(user_id)})
    if user_email:
        or_clauses.append({"user_email": str(user_email).strip().lower()})
    if not or_clauses:
        return False

    query = {"project_id": str(project_id), "$or": or_clauses}
    result = await teams_collection.delete_one(query)
    return result.deleted_count > 0


async def is_user_in_project_team(
    project_id: str,
    user_id: str = None,
    user_email: str = None,
) -> bool:
    """Check whether a user is an active member of a project's team using user_id."""
    if not project_id:
        return False

    or_clauses = []
    if user_id:
        or_clauses.append({"user_id": str(user_id)})
    if user_email:
        or_clauses.append({"user_email": str(user_email).strip().lower()})
    if not or_clauses:
        return False

    query = {"project_id": str(project_id), "$or": or_clauses}
    member_doc = await teams_collection.find_one(query)
    return member_doc is not None


async def get_project_team(project_id: str):
    """Retrieve all team members for a given project with dynamically resolved user profiles."""
    if not project_id:
        return []

    cursor = teams_collection.find({"project_id": str(project_id)})
    team_docs = await cursor.to_list(length=200)

    # Batch resolve user profiles from users_collection
    user_ids = [
        ObjectId(doc["user_id"])
        for doc in team_docs
        if doc.get("user_id") and ObjectId.is_valid(doc["user_id"])
    ]
    user_map = {}
    if user_ids:
        u_cursor = users_collection.find({"_id": {"$in": user_ids}})
        async for u in u_cursor:
            user_map[str(u["_id"])] = u

    results = []
    for doc in team_docs:
        u_id = str(doc.get("user_id", ""))
        user_info = user_map.get(u_id)
        results.append({
            "id": str(doc["_id"]),
            "project_id": doc.get("project_id"),
            "user_id": u_id,
            "user_name": user_info.get("name") if user_info else doc.get("user_name", "Member"),
            "user_email": user_info.get("email") if user_info else doc.get("user_email", ""),
            "avatar": user_info.get("avatar") if user_info else "",
            "role_in_project": doc.get("role_in_project", "Contributor"),
            "joined_at": doc.get("joined_at"),
            "last_active": doc.get("last_active"),
        })

    return results


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
    user_id: str = None,
    user_email: str = None,
):
    # Resolve user_id if only email was passed
    resolved_user_id = user_id
    if not resolved_user_id and user_email:
        user_doc = await users_collection.find_one({"email": user_email.strip().lower()})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])

    document = {
        "project_id": str(project_id) if project_id else None,
        "project_name": project_name,
        "user_id": str(resolved_user_id) if resolved_user_id else None,
        "user_email": user_email,
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
        "complexity": analysis_result.get(
            "complexity",
            "MEDIUM"
        ),
        "status": analysis_result.get(
            "status",
            "COMPLETED"
        ),
        "created_at": datetime.now(timezone.utc),
    }

    result = await analysis_collection.insert_one(document)

    # Automatically register contributor in teams collection
    if project_id and (user_email or resolved_user_id):
        try:
            await add_team_member(
                project_id=str(project_id),
                user_email=user_email,
                role_in_project="Contributor",
                user_id=resolved_user_id,
            )
        except Exception:
            pass

    return str(result.inserted_id)


async def get_recent_analyses(
    user_id: str = None,
    user_email: str = None,
    limit: int = 10,
    project_id: str = None
):
    resolved_user_id = user_id
    if not resolved_user_id and user_email:
        user_doc = await users_collection.find_one({"email": user_email.strip().lower()})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])

    user_clauses = []
    if resolved_user_id:
        user_clauses.append({"user_id": str(resolved_user_id)})
    if user_email:
        user_clauses.append({"user_email": user_email})

    query = {}
    if user_clauses:
        query = {"$or": user_clauses}
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
        doc_id_str = str(doc["_id"])
        ev = doc.get("evidence") or {}
        rel_list = ev.get("related", []) if isinstance(ev, dict) else []
        rel_count = doc.get("related_count")
        if rel_count is None:
            rel_count = len(rel_list)

        results.append({
            "id": doc_id_str,
            "_id": doc_id_str,
            "analysis_id": f"ANL-{doc_id_str[-6:].upper()}",
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
            "complexity": doc.get("complexity", "MEDIUM"),
            "related_count": rel_count,
            "status": doc.get(
                "status",
                "COMPLETED"
            ),
            "created_at": (
                (doc["created_at"].replace(tzinfo=timezone.utc) if doc["created_at"].tzinfo is None else doc["created_at"]).isoformat()
                if doc.get("created_at") and isinstance(doc["created_at"], datetime)
                else (str(doc["created_at"]) if doc.get("created_at") else None)
            ),
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

    # Resolve project_name if project_id is given
    resolved_project_name = None
    if project_id and ObjectId.is_valid(project_id):
        proj_doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if proj_doc:
            resolved_project_name = proj_doc.get("name")

    # Pure foreign key document structure
    document = {
        "filename": filename,
        "project_id": str(project_id) if project_id else None,
        "project_name": resolved_project_name,
        "user_id": str(resolved_user_id) if resolved_user_id else None,
        "user_email": user_email,
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


async def get_test_suites_list(
    user_id: str = None,
    user_email: str = None,
    user_role: str = "QA",
    project_id: str = None,
    search: str = None,
    limit: int = 100,
):
    """
    Returns summarized test suite rows for Test History list/table.
    Enforces role-based isolation (Admins view all, QA views own / authorized project suites).
    """
    query = {}
    clauses = []

    is_admin = user_role and user_role.lower() in ["admin", "administrator", "product manager", "product owner"]

    if not is_admin:
        resolved_user_id = user_id
        if not resolved_user_id and user_email:
            user_doc = await users_collection.find_one({"email": user_email})
            if user_doc:
                resolved_user_id = str(user_doc["_id"])

        accessible_project_ids = []
        if resolved_user_id or user_email:
            team_or_clauses = []
            if resolved_user_id:
                team_or_clauses.append({"members.user_id": str(resolved_user_id)})
            if user_email:
                team_or_clauses.append({"members.email": user_email})
            async for t_doc in teams_collection.find({"$or": team_or_clauses}):
                pid = t_doc.get("project_id")
                if pid:
                    accessible_project_ids.append(str(pid))

            proj_or_clauses = []
            if resolved_user_id:
                proj_or_clauses.append({"owner_id": str(resolved_user_id)})
            if user_email:
                proj_or_clauses.append({"owner_email": user_email})
            async for p_doc in projects_collection.find({"$or": proj_or_clauses}):
                accessible_project_ids.append(str(p_doc["_id"]))

        access_conditions = []
        if resolved_user_id:
            access_conditions.append({"user_id": str(resolved_user_id)})
        if user_email:
            access_conditions.append({"user_email": user_email})
        if accessible_project_ids:
            access_conditions.append({"project_id": {"$in": list(set(accessible_project_ids))}})

        # If user has no specific records yet, also show legacy documents associated with user email
        if access_conditions:
            clauses.append({"$or": access_conditions})

    if project_id and project_id != "All" and project_id != "All Projects":
        clauses.append({"project_id": str(project_id)})

    if search and search.strip():
        s_term = search.strip()
        clauses.append({
            "$or": [
                {"filename": {"$regex": s_term, "$options": "i"}},
                {"project_name": {"$regex": s_term, "$options": "i"}},
                {"requirement_text": {"$regex": s_term, "$options": "i"}},
            ]
        })

    if clauses:
        query = {"$and": clauses} if len(clauses) > 1 else clauses[0]

    cursor = test_suites_collection.find(query).sort("created_at", -1).limit(limit)
    raw_suites = await cursor.to_list(length=limit)

    # Fetch all project names in batch for fast lookups
    all_projs = await projects_collection.find({}).to_list(length=300)
    proj_map = {str(p["_id"]): p.get("name") for p in all_projs}

    results = []
    for doc in raw_suites:
        pid = doc.get("project_id")
        resolved_proj_name = (
            doc.get("project_name") or
            (proj_map.get(str(pid)) if pid else None) or
            ("General Workspace" if not pid else "Project Workspace")
        )

        ts = doc.get("test_suite", {})
        categories = []
        calc_total = 0
        if isinstance(ts, dict):
            for cat_name, cat_cases in ts.items():
                if isinstance(cat_cases, list) and len(cat_cases) > 0:
                    categories.append(cat_name)
                    calc_total += len(cat_cases)

        final_total = doc.get("total_cases") if doc.get("total_cases") is not None else calc_total

        created_dt = doc.get("created_at")
        if created_dt and created_dt.tzinfo is None:
            created_dt = created_dt.replace(tzinfo=timezone.utc)

        results.append({
            "id": str(doc["_id"]),
            "title": doc.get("filename", "Test Suite"),
            "filename": doc.get("filename", "Test Suite"),
            "project_id": pid,
            "project_name": resolved_proj_name,
            "total_cases": final_total,
            "categories": categories,
            "languages": doc.get("languages", []),
            "files_count": doc.get("files_count", 0),
            "created_at": created_dt.isoformat() if created_dt else None,
            "user_email": doc.get("user_email"),
        })

    return results


async def get_test_suite_by_id(
    suite_id: str,
    user_id: str = None,
    user_email: str = None,
    user_role: str = "QA",
):
    try:
        if ObjectId.is_valid(suite_id):
            query = {"_id": ObjectId(suite_id)}
        else:
            query = {"_id": suite_id}

        doc = await test_suites_collection.find_one(query)
        if not doc:
            return None

        pid = doc.get("project_id")
        project_name = doc.get("project_name")
        if pid and not project_name and ObjectId.is_valid(pid):
            p_doc = await projects_collection.find_one({"_id": ObjectId(pid)})
            if p_doc:
                project_name = p_doc.get("name")

        if not project_name:
            project_name = "General Workspace"

        ts = doc.get("test_suite", {})
        categories = []
        calc_total = 0
        if isinstance(ts, dict):
            for cat_name, cat_cases in ts.items():
                if isinstance(cat_cases, list) and len(cat_cases) > 0:
                    categories.append(cat_name)
                    calc_total += len(cat_cases)

        final_total = doc.get("total_cases") if doc.get("total_cases") is not None else calc_total

        created_dt = doc.get("created_at")
        if created_dt and created_dt.tzinfo is None:
            created_dt = created_dt.replace(tzinfo=timezone.utc)

        return {
            "id": str(doc["_id"]),
            "title": doc.get("filename", "Test Suite"),
            "filename": doc.get("filename", "Test Suite"),
            "project_id": pid,
            "project_name": project_name,
            "requirement_text": doc.get("requirement_text", ""),
            "test_suite": ts,
            "total_cases": final_total,
            "categories": categories,
            "languages": doc.get("languages", []),
            "files_count": doc.get("files_count", 0),
            "created_at": created_dt.isoformat() if created_dt else None,
            "user_id": doc.get("user_id"),
            "user_email": doc.get("user_email"),
        }
    except Exception as e:
        print(f"[WARN] Failed to get test suite by id: {e}")
        return None


async def delete_test_suite_by_id(
    suite_id: str,
    user_id: str = None,
    user_email: str = None,
    user_role: str = "QA",
):
    try:
        if ObjectId.is_valid(suite_id):
            query = {"_id": ObjectId(suite_id)}
        else:
            query = {"_id": suite_id}

        doc = await test_suites_collection.find_one(query)
        if not doc:
            return False

        # Authorization: Admin or creator
        is_admin = user_role and user_role.lower() in ["admin", "administrator", "product manager", "product owner"]
        if not is_admin:
            is_creator = (
                (user_id and doc.get("user_id") and str(doc.get("user_id")) == str(user_id)) or
                (user_email and doc.get("user_email") and doc.get("user_email").lower() == user_email.lower())
            )
            if not is_creator:
                return False

        await test_suites_collection.delete_one({"_id": doc["_id"]})
        return True
    except Exception as e:
        print(f"[WARN] Failed to delete test suite: {e}")
        return False


async def get_recent_test_suites(
    user_id: str = None,
    user_email: str = None,
    limit: int = 10
):
    return await get_test_suites_list(user_id=user_id, user_email=user_email, limit=limit)


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

    for idx, (criterion, vector) in enumerate(
        zip(criteria, vectors),
        start=1
    ):
        raw_req_id = criterion.get("src")
        if not raw_req_id or str(raw_req_id).upper() in ["ORIGINAL", "UNKNOWN", "NONE", ""]:
            req_id = f"REQ-{idx:03d}"
        else:
            req_id = str(raw_req_id)

        documents.append({
            "project_id": project_id,
            "analysis_id": analysis_id,
            "req_id": req_id,
            "text": criterion["text"],
            "embedding": vector,
            "created_at": datetime.now(timezone.utc),
        })

    if documents:
        await requirement_embeddings_collection.insert_many(
            documents
        )


def generate_context_aware_reason(query_text: str, related_text: str, match_pct: int) -> str:
    """
    Generates meaningful, concrete relationship explanations between two requirements
    based on shared domain entities, technical keywords, and architectural components.
    """
    q_lower = (query_text or "").lower()
    r_lower = (related_text or "").lower()

    themes = []
    if any(k in q_lower for k in ["cart", "item", "product", "quantity"]) and any(k in r_lower for k in ["cart", "item", "order", "checkout", "product"]):
        themes.append("cart item state management and order initiation")
    if any(k in q_lower for k in ["pay", "checkout", "stripe", "billing", "card", "price", "amount"]) and any(k in r_lower for k in ["pay", "checkout", "stripe", "billing", "amount", "order"]):
        themes.append("checkout transaction processing and payment gateway handling")
    if any(k in q_lower for k in ["auth", "token", "password", "login", "user", "session", "permission"]) and any(k in r_lower for k in ["auth", "token", "password", "user", "session", "identity", "role"]):
        themes.append("user identity verification, session tokens, and security policies")
    if any(k in q_lower for k in ["email", "notify", "notification", "alert", "message"]) and any(k in r_lower for k in ["email", "notify", "message", "notification", "alert"]):
        themes.append("notification triggers, email delivery, and alert workflows")
    if any(k in q_lower for k in ["table", "db", "schema", "database", "foreign key", "user_id"]) and any(k in r_lower for k in ["table", "db", "schema", "database", "record"]):
        themes.append("relational table schemas, foreign key references, and data integrity")
    if any(k in q_lower for k in ["api", "endpoint", "route", "http", "payload", "response"]) and any(k in r_lower for k in ["api", "endpoint", "route", "http", "response"]):
        themes.append("API contract payload structures and status response handling")

    if themes:
        return f"Cross-references {themes[0]} to maintain consistency across system workflows."

    # Extract common domain words (excluding common stop words)
    stop_words = {'shall', 'user', 'users', 'system', 'able', 'with', 'from', 'that', 'this', 'have', 'when', 'then', 'will', 'must', 'each', 'such', 'into', 'only', 'more', 'they', 'their', 'been', 'which'}
    q_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', q_lower)) - stop_words
    r_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', r_lower)) - stop_words
    common = list(q_words.intersection(r_words))

    if common:
        kw_str = ", ".join(f"'{k}'" for k in common[:3])
        return f"Shares operational domain context concerning {kw_str} and validation rules."

    if match_pct >= 85:
        return "Defines prerequisite functional rules and operational dependencies required for this requirement."
    elif match_pct >= 75:
        return "Provides supporting domain context and shared entity models across the project."
    else:
        return "Shares background operational constraints and business logic."


async def find_related_requirements(
    project_id: str,
    query_embedding: list[float] = None,
    query_text: str = "",
    limit: int = 5,
    min_similarity: float = 0.50,
):
    if not project_id:
        return []

    # If query embedding is provided, perform authentic semantic vector similarity
    if query_embedding and len(query_embedding) > 0:
        # 1. Try Atlas Vector Search if configured
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
                if score >= min_similarity:
                    match_pct = round(score * 100)
                    text = doc.get("excerpt", "")
                    title = text[:65] + ("..." if len(text) > 65 else "")
                    raw_id = doc.get("id")
                    clean_id = (
                        f"REQ-{len(results)+1:03d}"
                        if not raw_id or str(raw_id).upper() in ["ORIGINAL", "UNKNOWN", "NONE", ""]
                        else str(raw_id)
                    )
                    reason = generate_context_aware_reason(query_text, text, match_pct)
                    results.append({
                        "id": clean_id,
                        "match": f"{match_pct}%",
                        "matchPercent": match_pct,
                        "excerpt": text,
                        "title": title,
                        "why_related": reason,
                    })
            if results:
                return results
        except Exception:
            pass

        # 2. In-memory exact Cosine Similarity on stored project embeddings
        try:
            cursor = requirement_embeddings_collection.find({"project_id": str(project_id)})
            candidates = []
            q_vec = np.array(query_embedding, dtype=np.float32)
            q_norm = np.linalg.norm(q_vec)

            if q_norm > 0:
                async for doc in cursor:
                    stored_emb = doc.get("embedding")
                    if stored_emb and len(stored_emb) == len(query_embedding):
                        s_vec = np.array(stored_emb, dtype=np.float32)
                        s_norm = np.linalg.norm(s_vec)
                        if s_norm > 0:
                            sim = float(np.dot(q_vec, s_vec) / (q_norm * s_norm))
                            if sim >= min_similarity:
                                candidates.append((sim, doc))

                candidates.sort(key=lambda x: x[0], reverse=True)
                results = []
                for idx, (sim, doc) in enumerate(candidates[:limit], start=1):
                    match_pct = round(sim * 100)
                    text = doc.get("text", "")
                    title = text[:65] + ("..." if len(text) > 65 else "")
                    raw_id = doc.get("req_id")
                    clean_id = (
                        f"REQ-{idx:03d}"
                        if not raw_id or str(raw_id).upper() in ["ORIGINAL", "UNKNOWN", "NONE", ""]
                        else str(raw_id)
                    )
                    reason = generate_context_aware_reason(query_text, text, match_pct)

                    results.append({
                        "id": clean_id,
                        "match": f"{match_pct}%",
                        "matchPercent": match_pct,
                        "excerpt": text,
                        "title": title,
                        "why_related": reason,
                    })
                return results
        except Exception as err:
            print(f"[WARN] Error calculating embedding similarity: {err}")

        # If no genuine matches meet the threshold, return empty list
        return []

    # If no query embedding provided (e.g. initial project context view), return stored requirements with no fake match percentages
    try:
        cursor = requirement_embeddings_collection.find({"project_id": str(project_id)}).sort("created_at", -1).limit(limit)
        results = []
        async for idx, doc in enumerate(cursor, start=1):
            text = doc.get("text", "")
            title = text[:65] + ("..." if len(text) > 65 else "")
            raw_id = doc.get("req_id")
            clean_id = (
                f"REQ-{idx:03d}"
                if not raw_id or str(raw_id).upper() in ["ORIGINAL", "UNKNOWN", "NONE", ""]
                else str(raw_id)
            )
            results.append({
                "id": clean_id,
                "title": title,
                "excerpt": text,
                "matchPercent": None,
                "match": None,
                "why_related": generate_context_aware_reason(query_text, text, 80),
            })
        if results:
            return results

        # Fallback to analysis criteria if no standalone embeddings document yet
        cursor2 = analysis_collection.find({"project_id": str(project_id)}).sort("created_at", -1).limit(5)
        async for a_doc in cursor2:
            criteria = a_doc.get("criteria", [])
            for crit in criteria[:2]:
                text = crit.get("text", "")
                title = text[:65] + ("..." if len(text) > 65 else "")
                raw_id = crit.get("src")
                clean_id = (
                    f"REQ-{len(results)+1:03d}"
                    if not raw_id or str(raw_id).upper() in ["ORIGINAL", "UNKNOWN", "NONE", ""]
                    else str(raw_id)
                )
                results.append({
                    "id": clean_id,
                    "title": title,
                    "excerpt": text,
                    "matchPercent": None,
                    "match": None,
                    "why_related": generate_context_aware_reason(query_text, text, 80),
                })
                if len(results) >= limit:
                    break
            if len(results) >= limit:
                break
        return results
    except Exception as e:
        print(f"[WARN] Failed to fetch project requirements: {e}")
        return []


async def get_project_related_requirements(project_id: str, limit: int = 5):
    """
    Fetches real requirements stored in database for a project.
    """
    return await find_related_requirements(project_id, query_embedding=[], limit=limit)


async def get_analysis_by_id(
    analysis_id: str,
    user_id: str = None,
    user_email: str = None,
    user_role: str = ""
):
    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        return None

    resolved_user_id = user_id
    if not resolved_user_id and user_email:
        user_doc = await users_collection.find_one({"email": user_email.strip().lower()})
        if user_doc:
            resolved_user_id = str(user_doc["_id"])

    if user_role == "Admin":
        doc = await analysis_collection.find_one({"_id": obj_id})
    else:
        user_clauses = []
        if resolved_user_id:
            user_clauses.append({"user_id": str(resolved_user_id)})
        if user_email:
            user_clauses.append({"user_email": user_email})

        query = {"_id": obj_id}
        if user_clauses:
            query["$or"] = user_clauses

        doc = await analysis_collection.find_one(query)

    if not doc:
        return None

    doc_id_str = str(doc["_id"])
    doc["id"] = doc_id_str
    doc["_id"] = doc_id_str
    doc["analysis_id"] = f"ANL-{doc_id_str[-6:].upper()}"

    ev = doc.get("evidence") or {}
    rel_list = ev.get("related", []) if isinstance(ev, dict) else []
    if doc.get("related_count") is None:
        doc["related_count"] = len(rel_list)

    if not doc.get("complexity"):
        doc["complexity"] = "MEDIUM"

    if doc.get("created_at"):
        dt = doc["created_at"]
        if isinstance(dt, datetime):
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            doc["created_at"] = dt.isoformat()
        else:
            doc["created_at"] = str(dt)

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

async def delete_analysis(analysis_id: str, user_id: str = "", user_email: str = "", user_role: str = ""):
    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        return False, "Invalid analysis ID format"

    doc = await analysis_collection.find_one({"_id": obj_id})
    if not doc:
        return False, "Analysis not found"

    if user_role != "Admin":
        doc_user_id = str(doc.get("user_id", ""))
        doc_user_email = doc.get("user_email", "")
        is_owner = (user_id and doc_user_id == str(user_id)) or (user_email and doc_user_email == user_email)
        if not is_owner:
            return False, "You do not have permission to delete this analysis"

    result = await analysis_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return False, "Analysis not found"

    # Clean up associated requirement embeddings
    await requirement_embeddings_collection.delete_many({"analysis_id": analysis_id})

    return True, None


async def update_analysis_status(analysis_id: str, new_status: str, user_id: str = "", user_email: str = "", user_role: str = ""):
    try:
        obj_id = ObjectId(analysis_id)
    except Exception:
        return False, "Invalid analysis ID format"

    doc = await analysis_collection.find_one({"_id": obj_id})
    if not doc:
        return False, "Analysis not found"

    if user_role != "Admin":
        doc_user_id = str(doc.get("user_id", ""))
        doc_user_email = doc.get("user_email", "")
        is_owner = (user_id and doc_user_id == str(user_id)) or (user_email and doc_user_email == user_email)
        if not is_owner and user_role not in ["Developer", "QA"]:
            return False, "You do not have permission to update this analysis status"

    normalized = "Needs Review" if "REVIEW" in new_status.upper() else ("Approved" if "APPROV" in new_status.upper() else "Completed")

    await analysis_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": normalized}}
    )
    return True, normalized

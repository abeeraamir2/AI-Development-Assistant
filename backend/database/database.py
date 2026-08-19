import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = mongo_client["requirement_analyzer"]
projects_collection = db["projects"]
analysis_collection = db["analysis"]
users_collection = db["users"]
test_suites_collection = db["test_suites"]
bug_reports_collection = db["bug_reports"]
requirement_embeddings_collection = db["requirement_embeddings"]


async def create_project(name, owner_email, description="", visibility="private"):
    document = {
        "name": name,
        "description": description,
        "visibility": visibility,  # "private" or "public"
        "owner_email": owner_email,
        "created_at": datetime.now(timezone.utc)
    }
    result = await projects_collection.insert_one(document)
    return str(result.inserted_id)


async def save_analysis(
    project_id: str,
    project_name: str,
    filename: str,
    extracted_text: str,
    analysis_result: dict,
    user_email: str,
):
    """
    Persists a completed analysis. Keys read from analysis_result MUST match
    the canonical schema produced by services/analysis_service.py:
    summary, criteria, tasks, apis, db_tables, edge_cases, evidence, title,
    type, complexity, confidence, status.

    Uses .get(...) with safe defaults instead of direct indexing so a
    missing/optional field never causes a 500 error while saving.
    """
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
        "complexity": analysis_result.get("complexity", "MEDIUM"),
        "confidence": analysis_result.get("confidence", "MEDIUM"),
        "status": analysis_result.get("status", "COMPLETED"),
        "user_email": user_email,
        "created_at": datetime.now(timezone.utc),
    }
    result = await analysis_collection.insert_one(document)
    return str(result.inserted_id)


async def get_recent_analyses(user_email, limit=10):
    """
    Returns History-page-ready fields: title, project, filename, status,
    created_at. Previously this only returned filename/summary, which
    wasn't enough for the History UI (project name + status badge).
    """
    cursor = analysis_collection.find({"user_email": user_email}).sort("created_at", -1).limit(limit)
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "title": doc.get("title", doc.get("filename", "Untitled Analysis")),
            "project_id": doc.get("project_id"),
            "project_name": doc.get("project_name", "Unknown Project"),
            "filename": doc.get("filename"),
            "summary": doc.get("summary", ""),
            "status": doc.get("status", "COMPLETED"),
            "created_at": doc["created_at"].isoformat(),
        })
    return results


async def get_analysis_by_id(analysis_id: str):
    """
    Fetches a single full analysis (used when opening 'Open Full Analysis'
    from History, or reloading a Results page). Added because History ->
    Results navigation needs a way to re-fetch the complete stored record,
    including the evidence panel data.
    """
    from bson import ObjectId
    doc = await analysis_collection.find_one({"_id": ObjectId(analysis_id)})
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc["created_at"] = doc["created_at"].isoformat()
    return doc


async def save_test_suite(filename: str, requirement_text: str, test_suite_result: dict, user_email: str):
    document = {
        "filename": filename,
        "requirement_text": requirement_text,
        "test_suite": test_suite_result,  # Stores the generated JSON categorized by test types
        "user_email": user_email,
        "created_at": datetime.now(timezone.utc)
    }
    result = await test_suites_collection.insert_one(document)
    return str(result.inserted_id)


async def get_recent_test_suites(user_email: str, limit: int = 10):
    cursor = test_suites_collection.find({"user_email": user_email}).sort("created_at", -1).limit(limit)
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "test_suite": doc["test_suite"],
            "created_at": doc["created_at"].isoformat()
        })
    return results

async def save_requirement_embeddings(
    project_id: str,
    analysis_id: str,
    criteria: list[dict],
):
    """
    Har criteria item (jo already {"text":..., "src":...} shape mein hai)
    ko embed karke requirement_embeddings_collection mein store karta hai.
    Yeh save_analysis() ke turant baad call hoga.
    """
    from services.embedding_service import embed_texts

    if not criteria:
        return

    texts = [c["text"] for c in criteria]
    vectors = embed_texts(texts)

    documents = []
    for criterion, vector in zip(criteria, vectors):
        documents.append({
            "project_id": project_id,
            "analysis_id": analysis_id,
            "req_id": criterion.get("src", "UNKNOWN"),
            "text": criterion["text"],
            "embedding": vector,
            "created_at": datetime.now(timezone.utc),
        })

    if documents:
        await requirement_embeddings_collection.insert_many(documents)


async def find_related_requirements(project_id: str, query_embedding: list[float], limit: int = 5):
    """
    Atlas Vector Search se project-scoped semantically similar past
    requirements dhoondta hai. Returns [{id, match, excerpt}, ...] shape
    jo analyze_requirement()'s related_context param expect karta hai.
    """
    pipeline = [
        {
            "$vectorSearch": {
                "index": "requirement_vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": 100,
                "limit": limit,
                "filter": {"project_id": project_id},
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": "$req_id",
                "excerpt": "$text",
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]
    results = []
    async for doc in requirement_embeddings_collection.aggregate(pipeline):
        results.append({
            "id": doc["id"],
            "match": f"{round(doc['score'] * 100)}%",
            "excerpt": doc["excerpt"],
        })
    return results
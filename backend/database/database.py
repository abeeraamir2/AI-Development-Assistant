import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = mongo_client["requirement_analyzer"]
analysis_collection = db["analysis"]
users_collection = db["users"]
test_suites_collection = db["test_suites"]
bug_reports_collection = db["bug_reports"]

async def save_analysis(filename, extracted_text, analysis_result, user_email):
    document = {
        "filename": filename,
        "extracted_text": extracted_text,
        "summary": analysis_result["summary"],
        "criteria": analysis_result["criteria"],
        "apis": analysis_result["apis"],
        "dbTables": analysis_result["dbTables"],
        "tasks": analysis_result["tasks"],
        "edgeCases": analysis_result["edgeCases"],
        "user_email": user_email,
        "created_at": datetime.now(timezone.utc)
    }
    result = await analysis_collection.insert_one(document)
    return str(result.inserted_id)

async def get_recent_analyses(user_email, limit=10):
    cursor = analysis_collection.find({"user_email": user_email}).sort("created_at", -1).limit(limit)
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "summary": doc["summary"],
            "created_at": doc["created_at"].isoformat()
        })
    return results


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
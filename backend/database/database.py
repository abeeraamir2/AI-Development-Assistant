import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

mongo_client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = mongo_client["requirement_analyzer"]
analysis_collection = db["analysis"]
users_collection = db["users"]

async def save_analysis(filename, extracted_text, analysis_result):
    document = {
        "filename": filename,
        "extracted_text": extracted_text,
        "summary": analysis_result["summary"],
        "criteria": analysis_result["criteria"],
        "apis": analysis_result["apis"],
        "dbTables": analysis_result["dbTables"],
        "tasks": analysis_result["tasks"],
        "edgeCases": analysis_result["edgeCases"],
        "created_at": datetime.now(timezone.utc)
    }
    result = await analysis_collection.insert_one(document)
    return str(result.inserted_id)

async def get_recent_analyses(limit=10):
    cursor = analysis_collection.find().sort("created_at", -1).limit(limit)
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "summary": doc["summary"],
            "created_at": doc["created_at"].isoformat()
        })
    return results
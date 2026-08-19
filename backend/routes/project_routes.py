from fastapi import APIRouter, Depends
from pydantic import BaseModel
from database.database import projects_collection, create_project
from services.auth_service import get_current_user,require_role
from models.project_models import ProjectCreateRequest

router = APIRouter()

@router.get("/projects")
async def list_projects(current_user: dict = Depends(get_current_user)):

    cursor = projects_collection.find({
        "$or": [
            {"owner_email": current_user["email"]},
            {"visibility": "public"},
        ]
    })
    results = []
    async for doc in cursor:
        results.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "description": doc.get("description", ""),
            "visibility": doc.get("visibility", "private"),
            "owner_email": doc.get("owner_email"),
        })
    return results


@router.post("/projects")
async def create_new_project(
    payload: ProjectCreateRequest,
    current_user: dict = Depends(require_role(["Developer"])),
):

    project_id = await create_project(
        payload.name,
        current_user["email"],
        payload.description,
        payload.visibility,
    )
    return {
        "id": project_id,
        "name": payload.name,
        "description": payload.description,
        "visibility": payload.visibility,
        "owner_email": current_user["email"],
    }
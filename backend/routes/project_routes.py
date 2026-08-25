from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from database.database import (
    projects_collection,
    teams_collection,
    analysis_collection,
    users_collection,
    add_team_member,
    create_project,
    update_project,
    delete_project,
)
from services.auth_service import require_role
from models.project_models import ProjectCreateRequest, ProjectUpdateRequest

router = APIRouter()


@router.get("/projects")
async def list_projects(current_user: dict = Depends(require_role(["Admin", "Developer", "QA"]))):
    # All authenticated personas can view all projects in the system.
    # Access gating for private projects is handled dynamically via access-status.
    cursor = projects_collection.find({})
    project_docs = await cursor.to_list(length=500)

    # Batch-fetch owner user documents to resolve owner_email/owner_name dynamically
    owner_ids = [
        ObjectId(doc["owner_id"])
        for doc in project_docs
        if doc.get("owner_id") and ObjectId.is_valid(doc["owner_id"])
    ]
    owner_users = {}
    if owner_ids:
        user_cursor = users_collection.find({"_id": {"$in": owner_ids}})
        async for u in user_cursor:
            owner_users[str(u["_id"])] = u

    results = []
    for doc in project_docs:
        owner_id_str = str(doc.get("owner_id", ""))
        owner_doc = owner_users.get(owner_id_str)
        resolved_owner_email = (
            owner_doc.get("email")
            if owner_doc
            else doc.get("owner_email")
        )
        resolved_owner_name = (
            owner_doc.get("name")
            if owner_doc
            else doc.get("owner_name", "Project Owner")
        )

        results.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "description": doc.get("description", ""),
            "visibility": doc.get("visibility", "private"),
            "owner_id": owner_id_str,
            "owner_email": resolved_owner_email,
            "owner_name": resolved_owner_name,
        })
    return results


@router.post("/projects")
async def create_new_project(
    payload: ProjectCreateRequest,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    user_id = current_user.get("id") or current_user.get("user_id")
    if not user_id and current_user.get("email"):
        user_doc = await users_collection.find_one({"email": current_user["email"].strip().lower()})
        if user_doc:
            user_id = str(user_doc["_id"])

    project_id = await create_project(
        payload.name,
        user_id or current_user["email"],
        payload.description,
        payload.visibility,
    )
    return {
        "id": project_id,
        "name": payload.name,
        "description": payload.description,
        "visibility": payload.visibility,
        "owner_id": str(user_id) if user_id else "",
        "owner_email": current_user.get("email"),
    }


@router.put("/projects/{project_id}")
async def update_project_endpoint(
    project_id: str,
    payload: ProjectUpdateRequest,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    user_id = current_user.get("id") or current_user.get("user_id")
    user_email = current_user.get("email") or current_user.get("user_email")
    user_role = current_user.get("role", "")

    updates = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else payload.dict(exclude_unset=True)
    success, error, updated_doc = await update_project(project_id, updates, str(user_id) if user_id else "", user_email, user_role)
    if not success:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Project not found"
            else status.HTTP_403_FORBIDDEN
        )
        raise HTTPException(status_code=status_code, detail=error)

    owner_id_str = str(updated_doc.get("owner_id", ""))
    return {
        "id": str(updated_doc["_id"]),
        "name": updated_doc["name"],
        "description": updated_doc.get("description", ""),
        "visibility": updated_doc.get("visibility", "private"),
        "owner_id": owner_id_str,
        "owner_email": updated_doc.get("owner_email") or user_email,
    }


@router.get("/admin/team-overview")
async def get_admin_team_overview(
    project_id: Optional[str] = None,
    current_user: dict = Depends(require_role(["Admin", "Product Manager"])),
):
    project = None
    if project_id:
        try:
            project = await projects_collection.find_one({"_id": ObjectId(project_id)})
        except Exception:
            project = None

    if not project:
        # Fallback: get the first project if available
        project = await projects_collection.find_one({})

    if not project:
        return {
            "project_id": None,
            "project_name": "No Projects Created",
            "visibility": "public",
            "owner_email": None,
            "team_members": [],
            "metrics": {
                "velocity": 0,
                "completion": 0,
                "stories_done": 0,
                "total_stories": 0,
                "time_remaining": "N/A"
            },
            "burndown_data": [],
            "ai_insights": {
                "risk_title": "No Project Data",
                "risk_desc": "No projects or team activity found yet. Create a project to view team collaboration.",
                "prediction_pct": 0,
                "prediction_desc": "Create a project and analyze requirements to see sprint forecasts.",
                "recommendation": "Assign developers and QA engineers to the project to begin collaboration."
            }
        }

    proj_id_str = str(project["_id"])
    owner_id = project.get("owner_id")
    owner_email = project.get("owner_email")

    if owner_id and not owner_email:
        try:
            owner_user = await users_collection.find_one({"_id": ObjectId(str(owner_id))})
            if owner_user:
                owner_email = owner_user.get("email")
        except Exception:
            pass

    project_name = project.get("name", "Unnamed Project")
    visibility = project.get("visibility", "public")

    # Ensure the owner is present in the teams collection for this project
    if owner_email:
        owner_team_entry = await teams_collection.find_one({
            "project_id": proj_id_str,
            "user_email": owner_email
        })
        if not owner_team_entry:
            await add_team_member(
                project_id=proj_id_str,
                user_email=owner_email,
                role_in_project="Lead"
            )

    # Fetch all members for this project from the dedicated `teams` collection
    team_cursor = teams_collection.find({"project_id": proj_id_str})
    team_docs = await team_cursor.to_list(length=200)

    # Also backfill any users who analyzed requirements for this project into `teams`
    analysis_users = await analysis_collection.distinct("user_email", {"project_id": proj_id_str})
    existing_team_emails = {doc.get("user_email") for doc in team_docs if doc.get("user_email")}

    for anal_email in analysis_users:
        if anal_email and anal_email not in existing_team_emails:
            await add_team_member(
                project_id=proj_id_str,
                user_email=anal_email,
                role_in_project="Contributor"
            )
            existing_team_emails.add(anal_email)

    # Refresh team documents from teams collection
    team_cursor = teams_collection.find({"project_id": proj_id_str})
    team_docs = await team_cursor.to_list(length=200)

    team_members = []
    total_analyses_all = 0
    completed_analyses_all = 0

    for idx, member in enumerate(team_docs):
        email = member.get("user_email")
        if not email:
            continue

        user_doc = await users_collection.find_one({"email": email})
        is_owner = (member.get("role_in_project") == "Owner" or email == owner_email)

        name = (user_doc.get("name") if user_doc else None) or email.split("@")[0].replace(".", " ").replace("_", " ").title()
        user_system_role = (user_doc.get("role") if user_doc else None) or "Developer"

        if is_owner:
            display_role = f"Project Owner ({user_system_role})" if user_system_role != "Admin" else "Project Owner"
        else:
            role_in_proj = member.get("role_in_project", "Contributor")
            display_role = f"{role_in_proj} ({user_system_role})"

        # Query activity on this project
        user_analyses_count = await analysis_collection.count_documents({
            "project_id": proj_id_str,
            "user_email": email
        })
        user_completed_count = await analysis_collection.count_documents({
            "project_id": proj_id_str,
            "user_email": email,
            "status": {"$in": ["COMPLETED", "Completed"]}
        })

        total_analyses_all += user_analyses_count
        completed_analyses_all += user_completed_count

        team_members.append({
            "id": idx + 1,
            "name": name,
            "role": display_role,
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.replace(' ', '')}",
            "email": email,
            "analyses_count": user_analyses_count,
            "completed_count": user_completed_count,
            "is_owner": is_owner
        })

    # Sort owner first, then by activity
    team_members.sort(key=lambda m: (not m["is_owner"], -m["analyses_count"]))

    # Overall project metrics
    total_team_members = len(team_members)
    completion_rate = round((completed_analyses_all / total_analyses_all) * 100) if total_analyses_all > 0 else (100 if total_team_members > 0 else 0)
    velocity = max(total_analyses_all * 8, total_team_members * 12) if total_analyses_all > 0 else (total_team_members * 10)

    # Burndown 7-day projection
    burndown_data = [
        {"day": "Mon", "ideal": 50, "actual": max(50 - int(completed_analyses_all * 0.2), 0)},
        {"day": "Tue", "ideal": 43, "actual": max(45 - int(completed_analyses_all * 0.4), 0)},
        {"day": "Wed", "ideal": 36, "actual": max(38 - int(completed_analyses_all * 0.6), 0)},
        {"day": "Thu", "ideal": 29, "actual": max(30 - int(completed_analyses_all * 0.8), 0)},
        {"day": "Fri", "ideal": 22, "actual": max(24 - completed_analyses_all, 0)},
        {"day": "Mon", "ideal": 15, "actual": max(18 - completed_analyses_all, 0)},
        {"day": "Tue", "ideal": 8, "actual": max(10 - completed_analyses_all, 0)},
        {"day": "Today", "ideal": 0, "actual": max(total_analyses_all - completed_analyses_all, 0)},
    ]

    # AI Intelligence Insights
    if total_team_members > 1:
        member_names = ", ".join([m["name"] for m in team_members[:3]])
        risk_desc = f"{total_team_members} members ({member_names}) are registered in the project team and actively collaborating on '{project_name}'."
        recommendation = f"Cross-functional team collaboration is active for '{project_name}'. Team velocity is healthy."
    elif total_team_members == 1:
        risk_desc = f"1 team member ({team_members[0]['name']}) is currently active on '{project_name}'."
        recommendation = f"Public project '{project_name}' is open for other developers and QA engineers to join and contribute."
    else:
        risk_desc = "No contributors active on this project yet."
        recommendation = "Add requirements or assign team members to begin sprint tracking."

    return {
        "project_id": proj_id_str,
        "project_name": project_name,
        "visibility": visibility,
        "owner_email": owner_email,
        "team_members": team_members,
        "metrics": {
            "velocity": velocity,
            "completion": completion_rate,
            "stories_done": completed_analyses_all,
            "total_stories": max(total_analyses_all, total_team_members * 3),
            "time_remaining": "4d"
        },
        "burndown_data": burndown_data,
        "ai_insights": {
            "risk_title": "Team Collaboration Status",
            "risk_desc": risk_desc,
            "prediction_pct": completion_rate,
            "prediction_desc": f"Expected sprint progress for '{project_name}' based on live team output.",
            "recommendation": recommendation
        }
    }


@router.delete("/projects/{project_id}")
async def delete_project_endpoint(
    project_id: str,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    user_id = current_user.get("id") or current_user.get("user_id")
    user_email = current_user.get("email") or current_user.get("user_email")
    user_role = current_user.get("role", "")

    success, error = await delete_project(project_id, str(user_id) if user_id else "", user_email, user_role)
    if not success:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Project not found"
            else status.HTTP_403_FORBIDDEN
        )
        raise HTTPException(status_code=status_code, detail=error)

    # Clean up project team memberships
    try:
        await teams_collection.delete_many({"project_id": project_id})
    except Exception:
        pass

    return {"message": "Project deleted successfully", "id": project_id}
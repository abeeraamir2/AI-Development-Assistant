# backend/routes/project_access_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from services.auth_service import get_current_user
from services.project_access_service import (
    get_project_access_status,
    request_to_join_project,
    approve_join_request,
    reject_join_request,
    remove_project_team_member,
)

router = APIRouter(tags=["Project Access & Join Requests"])


@router.get("/projects/{project_id}/access-status")
async def check_access_status_endpoint(
    project_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Get the access status of the current user for a given project.
    Uses teams_collection as single source of truth for membership.
    """
    return await get_project_access_status(project_id, current_user)


@router.post("/projects/{project_id}/join-requests")
async def request_join_endpoint(
    project_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Developer submits a request to join a private project.
    """
    return await request_to_join_project(project_id, current_user)


@router.put("/projects/join-requests/{request_id}/approve")
async def approve_join_request_endpoint(
    request_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Project Owner (or Admin) approves a join request.
    Adds the user to teams_collection as a Contributor.
    """
    return await approve_join_request(request_id, current_user)


@router.put("/projects/join-requests/{request_id}/reject")
async def reject_join_request_endpoint(
    request_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Project Owner (or Admin) rejects a join request.
    """
    return await reject_join_request(request_id, current_user)


@router.delete("/projects/{project_id}/members/{member_identifier}")
async def remove_member_endpoint(
    project_id: str,
    member_identifier: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Project Owner (or Admin) removes an approved member from teams_collection.
    """
    return await remove_project_team_member(project_id, member_identifier, current_user)

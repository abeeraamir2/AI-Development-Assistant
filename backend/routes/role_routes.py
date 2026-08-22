from fastapi import APIRouter, Depends, HTTPException, status
from services.auth_service import require_role
from models.role_models import RoleCreate, RoleUpdate
from database.database import (
    get_all_roles,
    create_role_admin,
    update_role_permissions,
    delete_role_admin,
)

router = APIRouter()


@router.get("/roles")
async def list_roles(current_user: dict = Depends(require_role(["Admin"]))):
    """
    Admin-only. Returns all system roles and their permission matrices.
    """
    return await get_all_roles()


@router.post("/roles", status_code=status.HTTP_201_CREATED)
async def create_new_role(
    payload: RoleCreate,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Creates a new custom role with a designated permission matrix.
    """
    new_role, error = await create_role_admin(
        name=payload.name,
        description=payload.description or "Custom workspace role permissions.",
        permissions=payload.permissions,
    )
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return new_role


@router.put("/roles/{role_id}")
async def update_role(
    role_id: str,
    payload: RoleUpdate,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Updates role details and permission matrix.
    """
    update_data = payload.model_dump(exclude_unset=True)
    updated_role, error = await update_role_permissions(role_id, update_data)

    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Role not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)

    return updated_role


@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: str,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Deletes a custom role (built-in roles are protected).
    """
    success, error = await delete_role_admin(role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error or "Failed to delete role",
        )

    return {"message": "Role deleted successfully", "id": role_id}


@router.get("/permissions")
async def list_permissions(current_user: dict = Depends(require_role(["Admin"]))):
    """
    Admin-only. Returns all system permissions grouped by module.
    """
    return {
        "modules": [
            {
                "category": "User Management",
                "permissions": [
                    {"key": "users.view", "label": "View Users", "description": "View team members and user profiles"},
                    {"key": "users.create", "label": "Create Users", "description": "Add new members to the workspace"},
                    {"key": "users.update", "label": "Edit Users", "description": "Modify user details, roles, and status"},
                    {"key": "users.delete", "label": "Delete Users", "description": "Remove users from the system"},
                ],
            },
            {
                "category": "Roles & Access Control",
                "permissions": [
                    {"key": "roles.manage", "label": "Manage Roles", "description": "Create, edit, and delete workspace roles"},
                    {"key": "permissions.manage", "label": "Manage Permissions", "description": "Assign and adjust role permission matrices"},
                ],
            },
            {
                "category": "Projects Workspace",
                "permissions": [
                    {"key": "projects.view", "label": "View Projects", "description": "Browse and access project workspaces"},
                    {"key": "projects.create", "label": "Create Projects", "description": "Initialize new project workspaces"},
                    {"key": "projects.update", "label": "Edit Projects", "description": "Update project settings and metadata"},
                    {"key": "projects.delete", "label": "Delete Projects", "description": "Delete projects and associated data"},
                ],
            },
            {
                "category": "Requirements Analyzer",
                "permissions": [
                    {"key": "requirements.analyze", "label": "Analyze Requirements", "description": "Run AI analysis on PRD/SRS specifications"},
                    {"key": "requirements.view", "label": "View Requirements", "description": "View requirement insights and breakdowns"},
                ],
            },
            {
                "category": "Test Generator",
                "permissions": [
                    {"key": "tests.create", "label": "Generate Tests", "description": "Generate automated test suites from codebase"},
                    {"key": "tests.view", "label": "View Test Suites", "description": "View generated test cases and verification reports"},
                ],
            },
            {
                "category": "Bug Diagnostician",
                "permissions": [
                    {"key": "bugs.analyze", "label": "Analyze Bug Logs", "description": "Run AI diagnosis on raw production logs and stack traces"},
                    {"key": "bugs.view", "label": "View Bug Reports", "description": "Review generated root cause analysis & code fixes"},
                ],
            },
        ],
        "permissions": [
            "users.view", "users.create", "users.update", "users.delete",
            "roles.manage", "permissions.manage",
            "projects.view", "projects.create", "projects.update", "projects.delete",
            "requirements.analyze", "requirements.view",
            "tests.create", "tests.view",
            "bugs.analyze", "bugs.view",
        ],
    }


from fastapi import APIRouter, Depends, HTTPException, status
from services.auth_service import require_role
from models.user_models import UserCreate, UserUpdate
from database.database import (
    get_all_users,
    get_user_by_id,
    create_user_admin,
    update_user_admin,
    delete_user_admin,
)

router = APIRouter()


@router.get("/users")
async def list_users(current_user: dict = Depends(require_role(["Admin", "Developer", "QA"]))):
    """
    Returns all registered users with formatted fields for team assignment and user management.
    """
    return await get_all_users()


@router.get("/users/{user_id}")
async def get_single_user(
    user_id: str,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Returns a single user by ID.
    """
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Creates a new user in the system with role and status.
    """
    password = payload.password or "TempPass123!"
    created_user, error = await create_user_admin(
        name=payload.name,
        email=payload.email,
        password=password,
        role=payload.role,
        status=payload.status or "Active",
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )

    return created_user


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    payload: UserUpdate,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Updates an existing user's details (name, email, role, status, password).
    """
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update fields provided"
        )

    updated_user, error = await update_user_admin(user_id, update_data)
    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "User not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)

    return updated_user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Admin-only. Deletes a user by ID. Prevents self-deletion.
    """
    target_user = await get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Safety: prevent admin from deleting own account
    if target_user["email"].strip().lower() == current_user["email"].strip().lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account"
        )

    success, error = await delete_user_admin(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error or "Failed to delete user"
        )

    return {
        "message": f"User {target_user['name']} deleted successfully",
        "id": user_id
    }
# backend/routes/auth_routes.py
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from models.user_models import UserRegister, UserLogin, ChangePasswordRequest
from services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from services.user_service import change_password_service, revoke_sessions_service
from database.database import users_collection

router = APIRouter()


@router.post("/register")
async def register(user: UserRegister):
    normalized_email = user.email.strip().lower()
    existing = await users_collection.find_one({"email": normalized_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    derived_name = (
        user.name.strip()
        if user.name and user.name.strip()
        else normalized_email.split("@")[0].replace(".", " ").replace("_", " ").title()
    )

    hashed = hash_password(user.password)
    new_user = {
        "name": derived_name,
        "email": normalized_email,
        "password": hashed,
        "role": user.role,
        "token_version": 1,
        "status": "Active",
        "created_at": datetime.now(timezone.utc),
    }

    result = await users_collection.insert_one(new_user)
    user_id_str = str(result.inserted_id)

    token = create_access_token({
        "sub": normalized_email,
        "role": user.role,
        "id": user_id_str,
        "user_id": user_id_str,
        "name": derived_name,
        "token_version": 1,
    })

    return {
        "message": "User registered successfully",
        "id": user_id_str,
        "name": derived_name,
        "email": normalized_email,
        "role": user.role,
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/login")
async def login(credentials: UserLogin):
    normalized_email = credentials.email.strip().lower()
    user = await users_collection.find_one({"email": normalized_email})

    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("status") == "Inactive":
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact an administrator.",
        )

    user_id_str = str(user["_id"])
    user_display_name = user.get("name") or user["email"].split("@")[0].replace(".", " ").replace("_", " ").title()
    token_version = user.get("token_version")
    if token_version is None:
        token_version = 1
        await users_collection.update_one({"_id": user["_id"]}, {"$set": {"token_version": 1}})

    token = create_access_token({
        "sub": user["email"],
        "role": user["role"],
        "id": user_id_str,
        "user_id": user_id_str,
        "name": user_display_name,
        "token_version": token_version,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user_display_name,
        "email": user["email"],
        "id": user_id_str,
    }


@router.post("/auth/change-password")
async def change_password_endpoint(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    """Authenticated user change-password endpoint."""
    return await change_password_service(
        user_id=current_user["id"],
        current_password=payload.current_password,
        new_password=payload.new_password,
    )


@router.post("/auth/revoke-sessions")
async def revoke_sessions_endpoint(
    current_user: dict = Depends(get_current_user),
):
    """Revokes all other active sessions and returns a fresh valid token for current session."""
    return await revoke_sessions_service(
        user_id=current_user["id"],
        user_email=current_user["email"],
        user_role=current_user["role"],
        user_name=current_user["name"],
    )
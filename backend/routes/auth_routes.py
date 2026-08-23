from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from models.user_models import UserRegister, UserLogin
from services.auth_service import hash_password, verify_password, create_access_token
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
        "created_at": datetime.now(timezone.utc),
        "status": "Active",
    }
    user_id_str = str(result.inserted_id)
    token = create_access_token({"sub": normalized_email, "role": user.role, "id": user_id_str, "user_id": user_id_str, "name": derived_name})

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
            detail="Your account has been deactivated. Please contact an administrator."
        )

    user_id_str = str(user["_id"])
    user_display_name = user.get("name") or user["email"].split("@")[0].replace(".", " ").replace("_", " ").title()
    token = create_access_token({"sub": user["email"], "role": user["role"], "id": user_id_str, "user_id": user_id_str, "name": user_display_name})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user.get("name") or user["email"].split("@")[0].title(),
        "email": user["email"],
        "id": user_id_str,
    }
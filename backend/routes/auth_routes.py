from fastapi import APIRouter, HTTPException
from models.user_models import UserRegister,UserLogin
from services.auth_service import hash_password,verify_password, create_access_token
from database.database import users_collection

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(user.password)
    new_user = {
        "email": user.email,
        "password": hashed,
        "role": user.role
    }
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})

    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["email"], "role": user["role"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
    }
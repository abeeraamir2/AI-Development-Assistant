from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password):
    return pwd_context.hash(plain_password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    user_id = payload.get("id") or payload.get("user_id")
    user_name = payload.get("name")

    # If user_id or name is not embedded in the token, resolve it from users_collection
    if (not user_id or not user_name) and email:
        try:
            from database.database import users_collection
            user_doc = await users_collection.find_one({"email": email.strip().lower()})
            if user_doc:
                user_id = user_id or str(user_doc["_id"])
                user_name = user_name or user_doc.get("name")
        except Exception:
            pass

    return {
        "id": user_id,
        "user_id": user_id,
        "name": user_name or (email.split("@")[0].replace(".", " ").replace("_", " ").title() if email else "User"),
        "email": email,
        "role": payload.get("role", "Developer"),
    }


def normalize_role(role: str) -> str:
    if not role:
        return "Developer"
    r = role.strip().lower()
    if r in ["admin", "administrator", "product owner", "product manager"]:
        return "Admin"
    if r in ["qa", "tester", "qa engineer", "qa-engineer", "test engineer", "quality assurance"]:
        return "QA"
    if r in ["developer", "dev", "software engineer"]:
        return "Developer"
    return role.strip().title()


def require_role(allowed_roles: list[str]):
    normalized_allowed = [normalize_role(r).lower() for r in allowed_roles]
    # Admin has full access across all routes
    if "admin" not in normalized_allowed:
        normalized_allowed.append("admin")

    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = normalize_role(current_user.get("role", "")).lower()
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this"
            )
        return current_user

    return role_checker
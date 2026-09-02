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


import time

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# In-memory user document cache to eliminate remote Atlas latency on every HTTP request
# Structure: { user_id_or_email: (user_doc, expire_time) }
_USER_CACHE: dict = {}
_USER_CACHE_TTL: int = 30  # 30 seconds TTL


def invalidate_user_cache(user_id: str = None, user_email: str = None):
    """Immediately invalidates a user's cached document upon revocation, role change, or password update."""
    if user_id:
        _USER_CACHE.pop(str(user_id), None)
    if user_email:
        _USER_CACHE.pop(str(user_email).strip().lower(), None)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    sub = payload.get("sub")
    user_id_candidate = payload.get("id") or payload.get("user_id") or sub
    if not user_id_candidate:
        raise HTTPException(status_code=401, detail="Token payload missing user identity")

    now = time.time()
    cache_key = str(user_id_candidate)

    # 1. Fast path: check in-memory cache
    cached_entry = _USER_CACHE.get(cache_key)
    if cached_entry and cached_entry[1] > now:
        user_doc = cached_entry[0]
    else:
        from database.database import users_collection
        from bson import ObjectId

        user_doc = None
        # Primary lookup by user_id (surrogate key)
        if ObjectId.is_valid(str(user_id_candidate)):
            user_doc = await users_collection.find_one({"_id": ObjectId(str(user_id_candidate))})

        # Legacy fallback lookup by email if sub was email string
        if not user_doc and sub and "@" in str(sub):
            user_doc = await users_collection.find_one({"email": str(sub).strip().lower()})

        if user_doc:
            # Store in cache
            uid_str = str(user_doc["_id"])
            u_email = user_doc.get("email", "").strip().lower()
            _USER_CACHE[uid_str] = (user_doc, now + _USER_CACHE_TTL)
            if u_email:
                _USER_CACHE[u_email] = (user_doc, now + _USER_CACHE_TTL)

    if not user_doc:
        raise HTTPException(status_code=401, detail="User account no longer exists")

    if user_doc.get("status") == "Inactive":
        raise HTTPException(
            status_code=403,
            detail="Your account has been deactivated. Please contact an administrator.",
        )

    # Session Revocation Check (Token Versioning)
    token_version = payload.get("token_version")
    db_token_version = user_doc.get("token_version", 1)
    if token_version is None or token_version != db_token_version:
        raise HTTPException(
            status_code=401,
            detail="Session has been revoked. Please log in again.",
        )

    user_id = str(user_doc["_id"])
    user_email = user_doc.get("email", "")
    user_name = user_doc.get("name") or user_email.split("@")[0].replace(".", " ").replace("_", " ").title()

    return {
        "id": user_id,
        "user_id": user_id,
        "name": user_name,
        "email": user_email,
        "role": user_doc.get("role") or payload.get("role", "Developer"),
        "status": user_doc.get("status", "Active"),
        "token_version": db_token_version,
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
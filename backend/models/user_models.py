from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    name: Optional[str] = None
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: Optional[str] = "TempPass123!"
    role: str
    status: Optional[str] = "Active"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class NotificationPreferencesModel(BaseModel):
    joinRequests: Optional[bool] = True
    workItemAssignments: Optional[bool] = True
    statusUpdates: Optional[bool] = True
from typing import List, Optional
from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Unique name of the role")
    description: Optional[str] = Field(None, description="Description of the role and its scope")
    permissions: List[str] = Field(default_factory=list, description="List of assigned permission keys")


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, description="Updated name of the role")
    description: Optional[str] = Field(None, description="Updated description of the role")
    permissions: Optional[List[str]] = Field(None, description="Updated list of assigned permission keys")


class RoleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[str] = []
    is_custom: Optional[bool] = True
    users_count: Optional[int] = 0

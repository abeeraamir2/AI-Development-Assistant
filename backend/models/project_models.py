from typing import Optional
from pydantic import BaseModel

class ProjectCreateRequest(BaseModel):
    name: str
    description: str = ""
    visibility: str = "private"

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None 
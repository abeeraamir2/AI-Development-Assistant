# backend/models/project_access_models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class JoinRequestResponse(BaseModel):
    id: str
    project_id: str
    project_name: str
    requester_id: str
    requester_name: str
    requester_email: str
    requester_role: str = "Developer"
    owner_id: str
    status: str  # "pending" | "approved" | "rejected"
    created_at: str
    updated_at: Optional[str] = None


class ProjectAccessStatusResponse(BaseModel):
    status: str  # "NOT_REQUESTED" | "PENDING" | "REJECTED" | "APPROVED"
    project_id: str
    project_name: str
    is_owner: bool
    is_team_member: bool
    is_public: bool
    user_role: str
    pending_request_id: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    recipient_id: str
    recipient_email: str
    type: str  # "join_request" | "join_approved" | "join_rejected" | "work_item" | "status_update"
    title: str
    message: str
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    join_request_id: Optional[str] = None
    requester_name: Optional[str] = None
    requester_email: Optional[str] = None
    requester_role: Optional[str] = None
    status: Optional[str] = None  # "pending" | "approved" | "rejected"
    read: bool = False
    created_at: str


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int

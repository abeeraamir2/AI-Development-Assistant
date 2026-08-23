# backend/models/work_item_models.py
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


WorkItemCategory = Literal["Frontend", "Backend", "DevOps", "Testing"]
WorkItemStatus = Literal["Not Started", "In Progress", "Completed"]


class UserSnapshot(BaseModel):
    user_id: Optional[str] = None
    name: str
    initial: Optional[str] = "U"
    email: str
    role: Optional[str] = "Contributor"


class AttachmentItem(BaseModel):
    name: str
    size: str
    uploaded_at: Optional[str] = None
    type: Optional[str] = "document"


class ParentReference(BaseModel):
    id: str
    title: str
    category: Optional[str] = None
    status: Optional[str] = None


class LinkedWorkItemReference(BaseModel):
    id: str
    title: str
    category: Optional[str] = None
    status: Optional[str] = None


class WorkItemCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = ""
    category: WorkItemCategory
    status: Optional[WorkItemStatus] = "Not Started"
    project_id: str = Field(..., min_length=1, description="ID of the project this work item belongs to")
    assigned_to_id: Optional[str] = None
    assigned_to_email: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    parent_id: Optional[str] = None
    linked_work_item_ids: Optional[List[str]] = []
    attachments: Optional[List[AttachmentItem]] = []


class WorkItemUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[WorkItemCategory] = None
    status: Optional[WorkItemStatus] = None
    project_id: Optional[str] = Field(None, description="Updated project ID")
    assigned_to_id: Optional[str] = None
    assigned_to_email: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    parent_id: Optional[str] = None
    linked_work_item_ids: Optional[List[str]] = None
    attachments: Optional[List[AttachmentItem]] = None
    progress: Optional[int] = Field(None, ge=0, le=100)


class WorkItemResponse(BaseModel):
    id: str
    title: str
    description: str = ""
    category: str
    status: str
    projectId: Optional[str] = None
    projectName: Optional[str] = None
    assignedTo: UserSnapshot
    reporter: UserSnapshot
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    parent: Optional[ParentReference] = None
    linkedWorkItems: List[LinkedWorkItemReference] = []
    childWorkItems: List[dict] = []
    attachments: List[AttachmentItem] = []
    activity: List[dict] = []
    progress: int = 0
    createdDate: Optional[str] = None
    updatedDate: Optional[str] = None


class CategoryMetric(BaseModel):
    name: str
    percentage: int
    color: str


class WorkItemSummaryMetrics(BaseModel):
    total: int
    notStarted: int
    inProgress: int
    completed: int
    categoryDistribution: List[CategoryMetric]

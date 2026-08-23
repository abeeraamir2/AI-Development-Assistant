# backend/routes/work_item_routes.py
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query

from services.auth_service import require_role
from models.work_item_models import (
    WorkItemCreateRequest,
    WorkItemUpdateRequest,
    WorkItemResponse,
    WorkItemSummaryMetrics,
)
from services.work_item_service import (
    get_all_work_items_service,
    get_work_item_by_code_or_id,
    create_work_item_service,
    update_work_item_service,
    delete_work_item_service,
    get_eligible_parents_service,
    get_work_item_summary_metrics_service,
)

router = APIRouter()


@router.get("/work-items")
async def list_work_items(
    search: Optional[str] = Query(None, description="Search keyword matching title, ID, description, or assignee"),
    category: Optional[str] = Query(None, description="Filter by Category (Frontend, Backend, DevOps, Testing)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by Status (Not Started, In Progress, Completed)"),
    assigned_to_email: Optional[str] = Query(None, description="Filter by assigned user email"),
    project_id: Optional[str] = Query(None, description="Filter by Project ID"),
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Retrieves all work items across the workspace with optional search and filtering.
    Shared across Admin, Developer, and QA Engineer roles.
    """
    return await get_all_work_items_service(
        search=search,
        category=category,
        status=status_filter,
        assigned_to_email=assigned_to_email,
        project_id=project_id,
    )


@router.get("/work-items/summary")
async def get_work_items_summary(
    project_id: Optional[str] = Query(None, description="Filter summary metrics by Project ID"),
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Returns aggregated KPI metrics: total count, status breakdown, and category distribution percentages.
    """
    return await get_work_item_summary_metrics_service(project_id=project_id)


@router.get("/work-items/eligible-parents")
async def get_all_eligible_parents(
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Returns eligible parent options when creating a new work item.
    """
    return await get_eligible_parents_service()


@router.get("/work-items/eligible-parents/{work_item_id}")
async def get_eligible_parents_for_item(
    work_item_id: str,
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA"])),
):
    """
    Returns eligible parent options when editing a work item, strictly excluding the item itself
    and all its descendants to prevent circular hierarchy loops.
    """
    return await get_eligible_parents_service(raw_id=work_item_id)


@router.get("/work-items/{work_item_id}")
async def get_single_work_item(
    work_item_id: str,
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Returns full details for a single work item including resolved parent, derived child items,
    and bidirectional linked work items.
    """
    item = await get_work_item_by_code_or_id(work_item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work item '{work_item_id}' not found",
        )
    return item


@router.post("/work-items", status_code=status.HTTP_201_CREATED)
async def create_work_item(
    payload: WorkItemCreateRequest,
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Creates a new work item in the system. Generates an atomic sequential code (#WI-xxx),
    records the reporter from the authenticated user, and establishes bidirectional links.
    """
    created_item = await create_work_item_service(
        payload=payload,
        current_user=current_user,
    )
    return created_item


@router.put("/work-items/{work_item_id}")
async def update_work_item(
    work_item_id: str,
    payload: WorkItemUpdateRequest,
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Updates an existing work item. Preserves unmodified fields, checks for circular parent hierarchies,
    and synchronizes reciprocal links across all linked work items.
    """
    updated_item, error = await update_work_item_service(
        raw_id=work_item_id,
        payload=payload,
        current_user=current_user,
    )

    if error:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error in ["Work item not found", "Project not found"]
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)

    return updated_item


@router.delete("/work-items/{work_item_id}")
async def delete_work_item(
    work_item_id: str,
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA Engineer"])),
):
    """
    Safely deletes a work item. Blocks deletion if active child items exist,
    and removes reciprocal links across other work items.
    """
    success, error = await delete_work_item_service(raw_id=work_item_id)
    if not success:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Work item not found"
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=error)

    return {
        "message": f"Work item '{work_item_id}' deleted successfully",
        "id": work_item_id,
    }

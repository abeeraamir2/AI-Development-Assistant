# backend/routes/notification_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from services.auth_service import get_current_user
from services.project_access_service import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_read,
    delete_notification,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications_endpoint(
    current_user: dict = Depends(get_current_user),
):
    """List all notifications and unread count for the current user."""
    return await get_user_notifications(current_user)


@router.put("/{notification_id}/read")
async def mark_read_endpoint(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a single notification as read."""
    return await mark_notification_as_read(notification_id, current_user)


@router.put("/mark-all-read")
async def mark_all_read_endpoint(
    current_user: dict = Depends(get_current_user),
):
    """Mark all notifications as read for current user."""
    return await mark_all_notifications_read(current_user)


@router.delete("/{notification_id}")
async def delete_notification_endpoint(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Dismiss / delete a notification."""
    return await delete_notification(notification_id, current_user)

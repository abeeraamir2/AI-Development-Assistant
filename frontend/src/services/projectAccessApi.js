// src/services/projectAccessApi.js
const BASE_URL = "http://localhost:8000";

function getAuthHeaders() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Fetch the current user's access status for a given project.
 */
export async function getProjectAccessStatusApi(projectId) {
  if (!projectId) return null;
  const res = await fetch(`${BASE_URL}/projects/${projectId}/access-status`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to check project access status.");
  }
  return await res.json();
}

/**
 * Developer submits a join request for a private project.
 */
export async function requestProjectAccessApi(projectId) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/projects/${projectId}/join-requests`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to submit join request.");
  }
  return await res.json();
}

/**
 * Project Owner (or Admin) approves a join request.
 */
export async function approveJoinRequestApi(requestId) {
  if (!requestId) throw new Error("Request ID is required.");
  const res = await fetch(`${BASE_URL}/projects/join-requests/${requestId}/approve`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to approve join request.");
  }
  return await res.json();
}

/**
 * Project Owner (or Admin) rejects a join request.
 */
export async function rejectJoinRequestApi(requestId) {
  if (!requestId) throw new Error("Request ID is required.");
  const res = await fetch(`${BASE_URL}/projects/join-requests/${requestId}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to reject join request.");
  }
  return await res.json();
}

/**
 * Fetch all notifications for the current user.
 */
export async function getNotificationsApi() {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch notifications.");
  }
  return await res.json();
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationReadApi(notificationId) {
  if (!notificationId) return;
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to mark notification as read.");
  }
  return await res.json();
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsReadApi() {
  const res = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to mark all notifications as read.");
  }
  return await res.json();
}

/**
 * Dismiss / delete a notification.
 */
export async function deleteNotificationApi(notificationId) {
  if (!notificationId) return;
  const res = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete notification.");
  }
  return await res.json();
}

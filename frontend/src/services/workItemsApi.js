// src/services/workItemsApi.js

const API_BASE_URL = "http://localhost:8000";

function getAuthHeaders() {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response, defaultError = "Request failed") {
  if (!response.ok) {
    let errorMsg = defaultError;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || defaultError;
    } catch (_) { }
    throw new Error(errorMsg);
  }
  return await response.json();
}

/**
 * Fetch all work items with optional query filters.
 */
export async function getWorkItemsApi(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.category && filters.category !== "All")
    params.append("category", filters.category);
  if (filters.status && filters.status !== "All")
    params.append("status", filters.status);
  if (filters.assigned_to_email)
    params.append("assigned_to_email", filters.assigned_to_email);
  if (filters.project_id && filters.project_id !== "all" && filters.project_id !== "All")
    params.append("project_id", filters.project_id);

  const url = `${API_BASE_URL}/work-items${params.toString() ? `?${params.toString()}` : ""
    }`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Failed to load work items");
}

/**
 * Fetch KPI metrics summary, optionally filtered by project.
 */
export async function getWorkItemsSummaryApi(projectId = null) {
  const params = new URLSearchParams();
  if (projectId && projectId !== "all" && projectId !== "All") {
    params.append("project_id", projectId);
  }
  const url = `${API_BASE_URL}/work-items/summary${params.toString() ? `?${params.toString()}` : ""
    }`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Failed to load summary metrics");
}

/**
 * Fetch all projects for selection dropdowns.
 */
export async function getProjectsApi() {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Failed to load projects");
}

/**
 * Fetch all users from database for assignment dropdowns.
 */
export async function getUsersApi() {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Failed to load users");
}

/**
 * Fetch single work item by ID or code.
 */
export async function getWorkItemByIdApi(id) {
  if (!id) return null;
  const encodedId = encodeURIComponent(id.startsWith("#") ? id : `#${id}`);
  const response = await fetch(`${API_BASE_URL}/work-items/${encodedId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, `Failed to load work item ${id}`);
}

/**
 * Fetch eligible parent work items.
 */
export async function getEligibleParentsApi(excludeId = null) {
  const endpoint = excludeId
    ? `${API_BASE_URL}/work-items/eligible-parents/${encodeURIComponent(
      excludeId.startsWith("#") ? excludeId : `#${excludeId}`
    )}`
    : `${API_BASE_URL}/work-items/eligible-parents`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Failed to load eligible parent options");
}

/**
 * Create a new work item.
 */
export async function createWorkItemApi(data) {
  const response = await fetch(`${API_BASE_URL}/work-items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response, "Failed to create work item");
}

/**
 * Update an existing work item.
 */
export async function updateWorkItemApi(id, updates) {
  const encodedId = encodeURIComponent(id.startsWith("#") ? id : `#${id}`);
  const response = await fetch(`${API_BASE_URL}/work-items/${encodedId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  return handleResponse(response, `Failed to update work item ${id}`);
}

/**
 * Delete a work item.
 */
export async function deleteWorkItemApi(id) {
  const encodedId = encodeURIComponent(id.startsWith("#") ? id : `#${id}`);
  const response = await fetch(`${API_BASE_URL}/work-items/${encodedId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response, `Failed to delete work item ${id}`);
}

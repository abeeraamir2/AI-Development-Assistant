// src/utils/authUtils.js
const AUTH_TOAST_KEY = "authToastMessage";

/**
 * Call this whenever a request comes back unauthenticated (401).
 * Clears stored auth, queues a toast message for the login page to show,
 * and redirects the user to /login.
 */
export function handleUnauthorized(
  message = "Your session has expired or you are unauthenticated. Please log in again."
) {
  try {
    sessionStorage.setItem(AUTH_TOAST_KEY, message);
  } catch (e) {
    // sessionStorage may be unavailable in some private browsing contexts
  }

  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userEmail");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

/**
 * Call this on LoginPage mount to display and clear any queued session message.
 */
export function consumeAuthToastMessage() {
  try {
    const message = sessionStorage.getItem(AUTH_TOAST_KEY);
    if (message) {
      sessionStorage.removeItem(AUTH_TOAST_KEY);
    }
    return message;
  } catch (e) {
    return null;
  }
}

/**
 * Installs a global fetch interceptor that automatically detects 401 Unauthorized
 * responses across all requests from anywhere in the frontend application and
 * redirects the user to the login page.
 */
export function setupFetchInterceptor() {
  if (window.__fetchInterceptorInstalled) return;
  window.__fetchInterceptorInstalled = true;

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [resource] = args;
    const urlString =
      typeof resource === "string"
        ? resource
        : resource?.url || "";

    // Do not intercept 401 on login/register endpoints (so invalid credentials error can be displayed on form)
    const isAuthEndpoint =
      urlString.includes("/login") ||
      urlString.includes("/register");

    const response = await originalFetch.apply(this, args);

    if (response.status === 401 && !isAuthEndpoint) {
      handleUnauthorized();
    }

    return response;
  };
}

/**
 * Convenience wrapper around fetch if explicitly imported.
 */
export async function authFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    handleUnauthorized();
    return null;
  }
  return res;
}

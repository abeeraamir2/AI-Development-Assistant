// src/utils/roleUtils.js

/**
 * Normalizes any role string representation to one of the 3 core frontend roles:
 * - "Admin"
 * - "QA"
 * - "Developer"
 */
export function normalizeRole(role) {
  if (!role) return "Developer";
  const r = role.toString().trim().toLowerCase();

  // Admin & Product Owner / Manager
  if (
    r === "admin" ||
    r.includes("administrator") ||
    r.includes("product owner") ||
    r.includes("product manager")
  ) {
    return "Admin";
  }

  // QA, QA Engineer, Tester, Test Engineer, Quality Assurance
  if (
    r === "qa" ||
    r.includes("qa") ||
    r.includes("test") ||
    r.includes("quality")
  ) {
    return "QA";
  }

  // Developer & default
  return "Developer";
}

/**
 * Predicates for clean role checking in components
 */
export const isAdminRole = (role) => normalizeRole(role) === "Admin";
export const isQARole = (role) => normalizeRole(role) === "QA";
export const isDeveloperRole = (role) => normalizeRole(role) === "Developer";

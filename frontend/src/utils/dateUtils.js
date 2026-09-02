// src/utils/dateUtils.js

/**
 * Safely parses any date string (ISO, timestamp, UTC string) into a Date object.
 * If timezone is missing from ISO string, treats it as UTC.
 */
export function parseDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  let str = String(dateInput).trim();
  if (!str) return null;

  // If ISO string without timezone or 'Z' suffix, append 'Z' so JS treats it as UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(str)) {
    str += "Z";
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a date into a human-friendly relative time (e.g. "Just now", "5 mins ago", "2 hours ago", "Yesterday", "3 days ago")
 * or formatted date for older items.
 */
export function formatRelativeTime(dateInput) {
  const date = parseDate(dateInput);
  if (!date) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Guard against minor forward clock skew (within 1 min)
  if (diffMs < 0 && diffMs > -60000) return "Just now";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 45) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Formats a date into localized date + time string (e.g. "Aug 31, 11:05 AM")
 */
export function formatLocalizedDateTime(dateInput) {
  const date = parseDate(dateInput);
  if (!date) return "Recently";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats date into HTML5 date input format "YYYY-MM-DD"
 */
export function toInputDateFormat(dateStr) {
  if (!dateStr) return "";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // fallback
  }
  return "";
}


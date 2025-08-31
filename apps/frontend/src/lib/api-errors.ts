// Utility types and functions for handling API errors from the backend

// A single field-level issue (legacy shape you already used)
export type BackendIssue = { path?: Array<string | number>; message: string; code?: string };

// Unified error body the frontend expects from the backend errorHandler
export type ApiErrorBody = {
  // One of these identifiers may be present depending on backend:
  error?: string;   // e.g. 'UNAUTHORIZED', 'VALIDATION_ERROR'
  code?: string;    // alternative error identifier

  // Human-friendly error message
  message?: string;

  // Legacy field issues (your original shape)
  issues?: BackendIssue[];

  // Generic container for extra info — e.g. Zod issues array
  // Backend errorHandler currently uses `details` for Zod issues.
  details?: unknown;
};

/**
 * Normalize issues from either `issues` (legacy) or `details` (Zod issues).
 * Returns a unified array of { path, message, code? } or null if none.
 */
export function extractIssues(body?: ApiErrorBody): BackendIssue[] | null {
  if (!body) return null;

  if (Array.isArray(body.issues) && body.issues.length) {
    return body.issues;
  }

  if (Array.isArray(body.details) && body.details.length) {
    // Try to coerce Zod-like issues into BackendIssue
    return (body.details as any[]).map((d) => ({
      path: Array.isArray(d?.path) ? d.path : undefined,
      message:
        typeof d?.message === "string"
          ? d.message
          : String(d?.message ?? "Invalid value"),
      code: typeof d?.code === "string" ? d.code : undefined,
    }));
  }

  return null;
}

/**
 * Apply backend issues to react-hook-form fields if they match the whitelist.
 * (New convenience variant taking the *whole* error body.)
 * Returns true if at least one issue was applied.
 */
export function applyIssuesFromBody(
  body: ApiErrorBody | undefined,
  setError: (name: any, error: { type: string; message?: string }) => void,
  fieldWhitelist: string[],
): boolean {
  const issues = extractIssues(body);
  if (!issues?.length) return false;

  let hit = false;
  for (const iss of issues) {
    const key = String(iss.path?.[0] ?? "");
    if (key && fieldWhitelist.includes(key)) {
      setError(key as any, { type: "server", message: iss.message });
      hit = true;
    }
  }
  return hit;
}

/**
 * Original API kept for backward compatibility.
 * Apply an `issues` array directly (legacy usage).
 */
export function applyIssuesToFields(
  issues: ApiErrorBody["issues"],
  setError: (name: any, error: { type: string; message?: string }) => void,
  fieldWhitelist: string[],
): boolean {
  if (!issues?.length) return false;
  let hit = false;
  for (const iss of issues) {
    const key = String(iss.path?.[0] ?? "");
    if (fieldWhitelist.includes(key)) {
      setError(key as any, { type: "server", message: iss.message });
      hit = true;
    }
  }
  return hit;
}

/**
 * Small helper to pick the best user-facing message from an ApiErrorBody.
 */
export function messageFromApiError(
  body?: ApiErrorBody,
  fallback = "Request failed",
): string {
  if (!body) return fallback;
  // Prefer explicit message; some backends may use `detail`
  const detail = (body as any)?.detail;
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof detail === "string" && detail) return detail;
  return fallback;
}


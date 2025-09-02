// lib/api-errors.ts — clean version (no legacy `issues` support)

export type ApiErrorIssue = {
  path?: Array<string | number>;
  message: string;
  code?: string;
};

export type ApiErrorBody = {
  error?: string; // e.g. 'UNAUTHORIZED', 'VALIDATION_ERROR'
  code?: string; // optional error identifier
  message?: string; // user-facing text
  details?: ApiErrorIssue[]; // field-level issues (e.g. from Zod)
};

/** Pick a good user-facing message with fallback. */
export function messageFromApiError(body?: ApiErrorBody, fallback = "Request failed"): string {
  if (typeof body?.message === "string" && body.message) return body.message;
  const detail = (body as any)?.detail; // some backends use "detail"
  if (typeof detail === "string" && detail) return detail;
  return fallback;
}

/** Always return an array to keep call sites simple. */
export function extractIssues(body?: ApiErrorBody): ApiErrorIssue[] {
  const arr = body?.details;
  return Array.isArray(arr) ? arr : [];
}

/** Map issues to react-hook-form fields (whitelist) and set messages. */
export function applyIssues(
  body: ApiErrorBody | undefined,
  setError: (name: any, error: { type: string; message?: string }) => void,
  fieldWhitelist: string[],
): boolean {
  const issues = extractIssues(body); // guaranteed: ApiErrorIssue[]
  if (issues.length === 0) return false;

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

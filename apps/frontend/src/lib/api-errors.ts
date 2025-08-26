// Utility types and functions for handling API errors from the backend
export type BackendIssue = { path?: Array<string | number>; message: string };
export type ApiErrorBody = { message?: string; issues?: BackendIssue[] };

// Apply backend issues to react-hook-form fields if they match the whitelist.
// Returns true if at least one issue was applied.
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

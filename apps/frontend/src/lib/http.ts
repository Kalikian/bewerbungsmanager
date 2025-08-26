const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ?? // e.g. http://localhost:3000/api
  '';
// Robust JSON parsing for fetch responses.
export async function parseJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
// Simple token management in localStorage.
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
export function setToken(t: string) {
  localStorage.setItem("token", t);
}
export function clearToken() {
  localStorage.removeItem("token");
}

// A fetch wrapper that adds base URL, headers, auth token, and error handling.
export async function http<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const base =  API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(init.headers);

  // Add JSON content type if body is present and no content type is set
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${base}${path}`, { ...init, headers, credentials: "include" });
  const isJson = res.headers.get("content-type")?.includes("application/json");

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => ({})) : {};
    if (res.status === 401) clearToken();
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return isJson ? await res.json() : (undefined as T);
}

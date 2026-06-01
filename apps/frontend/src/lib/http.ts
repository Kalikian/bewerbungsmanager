export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ?? // e.g. http://localhost:3000/api
  "";
// Robust JSON parsing for fetch responses.
export async function parseJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
// Simple token management in localStorage.
type JwtPayload = {
  exp?: number;
};

function notifyAuthChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event("auth:changed"));
}

function isTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return true;
    }

    // JWT uses base64url, so we normalize it to regular base64
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const payload = JSON.parse(window.atob(paddedBase64)) as JwtPayload;

    if (!payload.exp) {
      return true;
    }

    // JWT exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    notifyAuthChanged();

    return null;
  }

  return token;
}

export function setToken(t: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem("token", t);
  notifyAuthChanged();
}

export function clearToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  notifyAuthChanged();
}

/** Rich error for HTTP failures so callers can toast accurate messages. */
export class HttpError extends Error {
  status: number;
  body?: any;
  url: string;
  method?: string;

  constructor(opts: { status: number; message: string; body?: any; url: string; method?: string }) {
    super(opts.message);
    this.name = "HttpError";
    this.status = opts.status;
    this.body = opts.body;
    this.url = opts.url;
    this.method = opts.method;
  }
}

/** Type guard to check for HttpError */
export function isHttpError(e: unknown): e is HttpError {
  return (
    e instanceof Error && (e as any).name === "HttpError" && typeof (e as any).status === "number"
  );
}

// A fetch wrapper that adds base URL, headers, auth token, and error handling.
export async function http<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);

  // Add JSON content type if body is present and no content type is set
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...init, headers, credentials: "include" });
  const isJson = res.headers.get("content-type")?.includes("application/json");

  if (!res.ok) {
    // Parse error body (JSON preferred, else text)
    let body: any = undefined;
    try {
      body = isJson ? await res.json() : await res.text();
    } catch {
      /* ignore non-JSON/non-text bodies */
    }

    // If unauthorized, clear token (session is no longer valid)
    if (res.status === 401 && token && token === getToken()) {
      clearToken();
    }

    // Prefer backend message fields commonly used in APIs
    const message =
      (typeof body === "object" &&
        body &&
        (body.message || body.error || body.detail || body.title)) ||
      (typeof body === "string" && body) ||
      res.statusText ||
      `HTTP ${res.status}`;

    throw new HttpError({
      status: res.status,
      message,
      body,
      url,
      method: init.method,
    });
  }

  // No content
  if (res.status === 204) return undefined as T;

  // Success: try JSON first; fall back to text (typed as unknown)
  if (isJson) {
    return (await res.json()) as T;
  } else {
    try {
      const text = await res.text();
      return text as unknown as T;
    } catch {
      return undefined as T;
    }
  }
}

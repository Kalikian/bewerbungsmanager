// Small, focused API helpers for Applications
import { API_BASE, getToken, parseJson } from "@/lib/http";
import type { Application as AppEntity } from "@shared";
import type { ApplicationPayload } from "../applications/types";

/**
 * POST /applications
 * - Does not show UI. Returns the raw fetch result + parsed body.
 * - The caller handles toasts and error mapping.
 */
export async function createApplication(payload: ApplicationPayload) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await parseJson(res);
  return { res, body } as const;
}

export async function getApplicationById(id: number, token: string) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const body = await parseJson<AppEntity>(res);
  if (!res.ok) throw body as any;
  return body;
}

export async function patchApplication<TPayload extends object>(
  id: number,
  token: string,
  payload: TPayload,
) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return res;
}

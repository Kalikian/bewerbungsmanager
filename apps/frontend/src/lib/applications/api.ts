// Small, focused API helpers for Applications
import { API_BASE, parseJson } from "@/lib/http";
import type { Application as AppEntity } from "@shared";

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

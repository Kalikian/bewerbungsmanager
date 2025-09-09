// apps/frontend/lib/api/notes.ts
import { API_BASE, getToken, parseJson } from "@/lib/http";
import type { Note } from "@shared";

export type CreateNotePayload = { text: string; date?: string };
export type UpdateNotePayload = { id: number; text?: string; date?: string };

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  let body: unknown = null;
  try {
    body = await parseJson(res);
  } catch {}
  return { res, body };
}

export async function listNotes(appId: number) {
  const token = getToken();
  return fetchJson(`${API_BASE}/applications/${appId}/notes`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  }) as Promise<{ res: Response; body: Note[] }>;
}

export async function createNote(appId: number, payload: CreateNotePayload) {
  const token = getToken();
  return fetchJson(`${API_BASE}/applications/${appId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  }) as Promise<{ res: Response; body: Note }>;
}

export async function updateNote(
  appId: number,
  noteId: number,
  payload: Omit<UpdateNotePayload, "id">,
) {
  const token = getToken();
  const init: RequestInit = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({ id: noteId, ...payload }), // <-- id im Body (Schema!)
  };

  const primary = await fetchJson(`${API_BASE}/applications/${appId}/notes/${noteId}`, init);
  if (primary.res.ok || (primary.res.status !== 404 && primary.res.status !== 405)) {
    return primary as { res: Response; body: Note };
  }
  const fb = await fetchJson(`${API_BASE}/notes/${noteId}`, init);
  return fb as { res: Response; body: Note };
}

export async function deleteNote(appId: number, noteId: number) {
  const token = getToken();
  const init: RequestInit = {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };

  const primary = await fetchJson(`${API_BASE}/applications/${appId}/notes/${noteId}`, init);
  if (primary.res.ok || (primary.res.status !== 404 && primary.res.status !== 405)) return primary;

  const fb = await fetchJson(`${API_BASE}/notes/${noteId}`, init);
  return fb;
}

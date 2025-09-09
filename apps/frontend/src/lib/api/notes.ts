import { API_BASE, getToken, parseJson } from "@/lib/http";
import type { Note } from "@shared";

export type CreateNotePayload = { content: string };
export type UpdateNotePayload = { content?: string };

// GET /applications/:appId/notes
export async function listNotes(appId: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/${appId}/notes`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  const body = await parseJson(res);
  return { res, body: body as Note[] } as const;
}

// POST /applications/:appId/notes
export async function createNote(appId: number, payload: CreateNotePayload) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/${appId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await parseJson(res);
  return { res, body: body as Note } as const;
}

// PATCH /applications/:appId/notes/:noteId
export async function updateNote(appId: number, noteId: number, payload: UpdateNotePayload) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/${appId}/notes/${noteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = await parseJson(res);
  return { res, body: body as Note } as const;
}

// DELETE /applications/:appId/notes/:noteId
export async function deleteNote(appId: number, noteId: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/${appId}/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  // 204 → no Body
  return { res } as const;
}

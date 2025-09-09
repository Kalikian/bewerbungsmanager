// apps/frontend/lib/api/attachment.ts
import { API_BASE, getToken, parseJson } from "@/lib/http";
import type { AttachmentRow } from "@shared";

export type UploadAttachmentInput = {
  file: File;
  note?: string;
  filenameOverride?: string;
};

/** GET /applications/:applicationId/attachments */
export async function listAttachments(applicationId: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/${applicationId}/attachments`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  const body = await parseJson<AttachmentRow[]>(res);
  return { res, body } as const;
}

/** POST /applications/:applicationId/attachments (multipart/form-data) */
export async function uploadAttachment(applicationId: number, payload: UploadAttachmentInput) {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", payload.file);
  if (payload.note) fd.append("note", payload.note);
  if (payload.filenameOverride) fd.append("filename", payload.filenameOverride);

  const res = await fetch(`${API_BASE}/applications/${applicationId}/attachments`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
    body: fd,
  });
  const body = await parseJson<AttachmentRow>(res);
  return { res, body } as const;
}

/** GET /applications/attachments/:attachmentId */
export async function getAttachment(attachmentId: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/attachments/${attachmentId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  const body = await parseJson<AttachmentRow>(res);
  return { res, body } as const;
}

/** DELETE /applications/attachments/:attachmentId */
export async function deleteAttachment(attachmentId: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  const body = await parseJson<{ success: boolean } | { message?: string }>(res);
  return { res, body } as const;
}

/** GET /applications/attachments/:attachmentId/download -> Blob + Dateiname */
export async function downloadAttachment(attachmentId: number) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/applications/attachments/${attachmentId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const cd = res.headers.get("content-disposition");
  const filename = parseFilenameFromContentDisposition(cd) ?? `attachment-${attachmentId}`;

  return { res, blob, url, filename } as const;
}

function parseFilenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;

  // RFC 5987: filename*=UTF-8''...
  const utf8 = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8);
    } catch {
      return utf8;
    }
  }

  // Fallback: filename="..."
  const simple =
    cd.match(/filename\s*=\s*"([^"]+)"/i)?.[1] ?? cd.match(/filename\s*=\s*([^;]+)/i)?.[1];
  return simple ? simple.trim() : null;
}

export function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

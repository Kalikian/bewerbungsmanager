// Frontend helpers for attachment UI (icons, formatting, preview/download)

import type { LucideIcon } from "lucide-react";
import {
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileAudio,
  FileVideo,
} from "lucide-react";
import type { AttachmentRow } from "@shared";

// Prefer a human-readable name if backend provided one
export function displayNameFromAttachment(att: Partial<AttachmentRow> & Record<string, any>) {
  return (
    att.original_name ??
    att.originalFilename ??
    att.client_filename ??
    (att as any).filename ??
    `attachment-${att.id}`
  );
}

export function mimeFromAttachment(att: Partial<AttachmentRow> & Record<string, any>) {
  return att.mime_type ?? att.mimetype ?? "";
}

export function sizeFromAttachment(att: Partial<AttachmentRow> & Record<string, any>) {
  return (att as any).size as number | undefined;
}

export function fileExtFromName(name?: string) {
  const m = /\.(\w+)$/.exec(name ?? "");
  return m ? m[1].toLowerCase() : "";
}

// Decide if the browser can render it inline
export function isViewable(mime: string, ext: string) {
  if (/^image\//i.test(mime)) return true;
  if (/^audio\//i.test(mime)) return true;
  if (/^video\//i.test(mime)) return true;
  if (/pdf$/i.test(mime)) return true;
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "pdf", "mp3", "wav", "mp4", "webm"].includes(
    ext.toLowerCase(),
  );
}

// Pick an icon for the file type
export function pickFileIcon(mime: string, ext: string): LucideIcon {
  if (/^image\//i.test(mime) || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return ImageIcon;
  if (/pdf$/i.test(mime) || ext === "pdf") return FileText;
  if (/^audio\//i.test(mime) || ["mp3", "wav"].includes(ext)) return FileAudio;
  if (/^video\//i.test(mime) || ["mp4", "webm", "mov"].includes(ext)) return FileVideo;
  if (/zip|rar|7z|tar|gz/i.test(mime) || ["zip", "rar", "7z", "tar", "gz", "tgz"].includes(ext))
    return FileArchive;
  if (/spreadsheet|excel|csv/i.test(mime) || ["xls", "xlsx", "csv", "ods"].includes(ext))
    return FileSpreadsheet;
  if (/json|javascript|typescript|xml|html|css|text\/x-|application\/x-/i.test(mime))
    return FileCode;
  return FileIcon;
}

// Lightweight formatters
export function formatBytes(n?: number) {
  if (n === undefined || n === null) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

export function formatDate(d: string | Date) {
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString();
  } catch {
    return "";
  }
}

// Programmatic download (client-only)
export function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function uploadedAtFromAttachment(att: any) {
  return att?.uploaded_at ?? att?.uploadedAt ?? null;
}
export function sizeBytesFromAttachment(att: any) {
  return att?.size_bytes ?? att?.sizeBytes ?? undefined;
}


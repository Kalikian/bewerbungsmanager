"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, ExternalLink, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { AttachmentRow } from "@shared";
import { downloadAttachment, deleteAttachment } from "@/lib/api/attachments";

// UI helpers extracted to a shared frontend lib
import {
  pickFileIcon,
  isViewable,
  fileExtFromName,
  formatBytes,
  formatDate,
  triggerDownload,
  displayNameFromAttachment,
  mimeFromAttachment,
} from "@/lib/attachments";

/**
 * Renders a list of attachments with:
 * - Type icon
 * - Clickable name (opens preview for viewable types or triggers download)
 * - Description, size, created date
 * - Actions: Open, Download, Delete
 */
export function AttachmentList({
  items,
  onDeletedAction,
}: {
  items: AttachmentRow[];
  /** Optional callback to refresh the list after a delete */
  onDeletedAction?: () => void;
}) {
  if (!items?.length) {
    return <div className="text-sm text-muted-foreground">No attachments yet.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((att) => (
        <AttachmentItem key={att.id} att={att} onDeleted={onDeletedAction} />
      ))}
    </div>
  );
}

/** Single attachment row */
function AttachmentItem({ att, onDeleted }: { att: AttachmentRow; onDeleted?: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Resolve display properties using tolerant helpers (supports various backends)
  const displayName = displayNameFromAttachment(att as any);
  const mime = mimeFromAttachment(att as any);
  const ext = fileExtFromName(displayName);
  const Icon = pickFileIcon(mime, ext);

  /** Open in a new tab if browser can preview; otherwise download */
  async function handleOpen() {
    try {
      setDownloading(true);
      const { res, url, filename } = await downloadAttachment(att.id);
      if (!res.ok) throw new Error("Download failed");
      if (isViewable(mime, ext)) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        triggerDownload(url, filename);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to open attachment");
    } finally {
      setDownloading(false);
    }
  }

  /** Always trigger a download (no preview) */
  async function handleDownload() {
    try {
      setDownloading(true);
      const { res, url, filename } = await downloadAttachment(att.id);
      if (!res.ok) throw new Error("Download failed");
      triggerDownload(url, filename);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download");
    } finally {
      setDownloading(false);
    }
  }

  /** Delete attachment, then inform parent to reload */
  async function handleDelete() {
    try {
      setRemoving(true);
      const { res, body } = await deleteAttachment(att.id);
      if (!res.ok) throw body as any;
      toast.success("Attachment deleted");
      onDeleted?.();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete attachment");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card className="border-muted-foreground/20">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div className="mt-0.5 rounded-md border p-2">
            <Icon className="h-5 w-5" />
          </div>

          {/* Text & actions */}
          <div className="min-w-0 flex-1">
            {/* Clickable name -> preview or download */}
            <button
              type="button"
              onClick={handleOpen}
              className="text-left font-medium underline-offset-2 hover:underline break-all"
              title="Open attachment"
              disabled={downloading}
            >
              {displayName}
            </button>

            {/* Meta: size • date */}
            <div className="mt-1 text-xs text-muted-foreground">
              {/* Size may live under different keys; helpers keep it simple */}
              {att && (att as any).size !== undefined && (
                <span className="mr-2">{formatBytes((att as any).size)}</span>
              )}
              {(att as any).created_at && <span>• {formatDate((att as any).created_at)}</span>}
            </div>

            {/* Optional description */}
            {(att as any).description && (
              <p className="mt-2 text-sm text-muted-foreground">{(att as any).description}</p>
            )}

            {/* Action buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={handleOpen} disabled={downloading}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </Button>

              <Button variant="ghost" size="sm" onClick={handleDownload} disabled={downloading}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={removing}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AttachmentList;

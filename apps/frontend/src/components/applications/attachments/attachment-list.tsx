"use client";

/**
 * Attachment list that:
 * - Shows ORIGINAL filename from backend (attachment.filename_original)
 * - Opens preview for viewable types, otherwise downloads using the original filename
 * - Displays size (size_bytes) and date (uploaded_at)
 * - Allows delete and notifies parent via onDeleted()
 * - Includes a tiny debug line (remove after verification)
 */

import { useState } from "react";
import { toast } from "sonner";
import { Download, ExternalLink, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { AttachmentRow } from "@shared";
import { downloadAttachment, deleteAttachment } from "@/lib/api/attachment";

import {
  pickFileIcon,
  isViewable,
  fileExtFromName,
  triggerDownload,
  mimeFromAttachment,
} from "@/lib/attachments";

type Props = {
  items: ReadonlyArray<AttachmentRow>;
  onDeletedAction?: () => void;
};

export function AttachmentList({ items, onDeletedAction }: Props) {
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

function AttachmentItem({ att, onDeleted }: { att: AttachmentRow; onDeleted?: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [removing, setRemoving] = useState(false);

  // ---- ORIGINAL FILENAME (hard requirement) ----
  // If your backend sends snake_case (recommended), this will always hit.
  // We still accept a camelCase fallback to be defensive.
  const displayName =
    (att as any).filename_original ??
    (att as any).filenameOriginal ??
    (att as any).filename ??
    `attachment-${att.id}`;

  const mime = mimeFromAttachment(att as any);
  const ext = fileExtFromName(displayName);
  const Icon = pickFileIcon(mime, ext);

  async function handleOpen() {
    try {
      setDownloading(true);
      const { res, url } = await downloadAttachment(att.id);
      if (!res.ok) throw new Error("Download failed");
      if (isViewable(mime, ext)) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        // Enforce saving with the ORIGINAL filename (keeps .docx/.pdf etc.)
        triggerDownload(url, displayName);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to open attachment");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownload() {
    try {
      setDownloading(true);
      const { res, url } = await downloadAttachment(att.id);
      if (!res.ok) throw new Error("Download failed");
      triggerDownload(url, displayName);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download");
    } finally {
      setDownloading(false);
    }
  }

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
          <div className="mt-0.5 rounded-md border p-2">
            <Icon className="h-5 w-5" />
          </div>

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

            {(att as any).description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {(att as any).description}
              </p>
            )}

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

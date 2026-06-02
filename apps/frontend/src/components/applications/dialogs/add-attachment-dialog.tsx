"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Application } from "@shared";
import { uploadAttachment } from "@/lib/api/attachment";
import { FileUp, Paperclip, X } from "lucide-react";

export default function AddAttachmentDialog({
  app,
  onAddedAction,
  open: controlledOpen,
  onOpenChangeAction,
}: {
  app: Application;
  onAddedAction: () => void;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChangeAction ?? setUncontrolledOpen;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // Generate a preview URL for the selected file so the name is clickable
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const inputId = useMemo(() => `file-input-${app.id}`, [app.id]);

  function clearSelection() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = ""; // reset native input
  }

  async function submit() {
    if (!file) return;

    try {
      setBusy(true);

      // Use centralized API helper
      const { res, body } = await uploadAttachment(app.id, {
        file,
      });

      if (!res.ok) {
        toast.error((body as any)?.message ?? "Failed to upload attachment");
        return;
      }

      toast.success("Attachment uploaded");

      // Close & reset
      setOpen(false);
      clearSelection();
      onAddedAction();
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        // Prevent closing while uploading
        if (!busy) setOpen(o);
      }}
    >
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-10 whitespace-normal break-words leading-snug">
            Add attachment · {app.job_title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a file to attach to this application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hidden native file input to avoid browser default UI text */}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            // add accept="image/*,.pdf" if you want to restrict types
          />

          {/* Custom, clear, clickable trigger */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit shrink-0"
              onClick={() => inputRef.current?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Add attachment
            </Button>

            {file && (
              <div className="flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-sm">
                <Paperclip className="mt-0.5 h-4 w-4 shrink-0" />

                <div className="min-w-0 flex-1">
                  {previewUrl ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all underline underline-offset-2 hover:no-underline"
                      title={file.name}
                    >
                      {file.name}
                    </a>
                  ) : (
                    <span className="block break-all" title={file.name}>
                      {file.name}
                    </span>
                  )}

                  <span className="mt-1 block text-xs opacity-70">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="shrink-0 rounded p-1 hover:bg-muted"
                  aria-label="Remove selected file"
                  title="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!file || busy}>
            {busy ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

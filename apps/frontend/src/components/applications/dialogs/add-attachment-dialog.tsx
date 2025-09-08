"use client";

import { useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Application } from "@shared";

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

  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) return;
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    if (desc.trim()) fd.append("description", desc.trim());

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/applications/${app.id}/attachments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: fd,
      });
      const body = await parseJson<any>(res);
      if (!res.ok) {
        toast.error(body?.message ?? "Failed to upload attachment");
        return;
      }
      toast.success("Attachment uploaded");
      setOpen(false); // close dialog
      setFile(null);
      setDesc("");
      onAddedAction();
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!busy) setOpen(o);
      }}
    >
      {/* IMPORTANT: no default trigger when controlled from outside */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add attachment · {app.job_title}</DialogTitle>
          <DialogDescription className="sr-only">
            Choose a file and optionally add a description. The file will be attached to this
            application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Textarea
            rows={4}
            placeholder="Optional description…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
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

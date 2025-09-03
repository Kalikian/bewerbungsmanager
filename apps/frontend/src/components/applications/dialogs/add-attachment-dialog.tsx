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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Application } from "@shared";

export default function AddAttachmentDialog({
  app,
  onAddedAction,
}: {
  app: Application;
  onAddedAction: () => void;
}) {
  const [open, setOpen] = useState(false);
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
        headers: { Authorization: `Bearer ${token}` }, // no manual Content-Type for FormData
        credentials: "include",
        body: fd,
      });
      const body = await parseJson<any>(res);
      if (!res.ok) {
        toast.error(body?.message ?? "Failed to upload attachment");
        return;
      }
      toast.success("Attachment uploaded");
      setOpen(false);
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
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add attachment
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!busy) setOpen(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add attachment · {app.job_title}</DialogTitle>
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
    </>
  );
}

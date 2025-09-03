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

export default function AddNoteDialog({
  app,
  onAddedAction,
}: {
  app: Application;
  onAddedAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const disabled = !text.trim();

  async function submit() {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/applications/${app.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      const body = await parseJson<any>(res);
      if (!res.ok) {
        toast.error(body?.message ?? "Failed to add note");
        return;
      }
      toast.success("Note added");
      setOpen(false);
      setText("");
      onAddedAction();
    } catch {
      toast.error("Network error");
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add note
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note · {app.job_title}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={6}
            placeholder="Write your note…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={disabled}>
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

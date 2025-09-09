"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createNote } from "@/lib/api/notes";
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

export default function AddNoteDialog({
  app,
  onAddedAction,
  // make dialog controllable from outside
  open: controlledOpen,
  onOpenChangeAction,
}: {
  app: Application;
  onAddedAction: () => void;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
}) {
  // keep internal state, but only use it when uncontrolled
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChangeAction ?? setUncontrolledOpen;

  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const disabled = !text.trim() || saving;

  async function submit() {
    try {
      setSaving(true);
      const { res, body } = await createNote(app.id, { text: text.trim() });
      if (!res.ok) {
        toast.error((body as any)?.message ?? "Failed to add note");
        return;
      }
      toast.success("Note added");
      setOpen(false); // close dialog
      setText("");
      onAddedAction();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setText(""); // clear text on close
      }}
    >
      {/* IMPORTANT: no default trigger when controlled from outside */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add note · {app.job_title}</DialogTitle>
          <DialogDescription className="sr-only">
            Write a short note for this application. The note will be saved and shown in the Notes
            tab.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          rows={6}
          placeholder="Write your note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={disabled}>
            Save note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

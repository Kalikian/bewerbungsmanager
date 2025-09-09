// apps/frontend/components/applications/dialogs/add-note-dialog.tsx
"use client";

import { useEffect, useState } from "react";
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
  // reuse as Edit dialog
  initialText,
  titleOverride,
  ctaLabelOverride,
  onSubmitOverrideAction,
}: {
  app: Application;
  onAddedAction: () => void;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  initialText?: string;
  titleOverride?: string;
  ctaLabelOverride?: string;
  onSubmitOverrideAction?: (text: string) => Promise<boolean>;
}) {
  // keep internal state, but only use it when uncontrolled
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChangeAction ?? setUncontrolledOpen;

  const [text, setText] = useState(initialText ?? "");
  const [saving, setSaving] = useState(false);
  const disabled = !text.trim() || saving;

  // keep text in sync when dialog opens or initialText changes
  useEffect(() => {
    if (open) setText(initialText ?? "");
  }, [initialText, open]);

  async function submit() {
    const payload = text.trim();
    if (!payload) return;

    try {
      setSaving(true);

      // If override is provided → EDIT flow
      if (onSubmitOverrideAction) {
        const ok = await onSubmitOverrideAction(payload);
        if (!ok) {
          toast.error("Failed to save note");
          return;
        }
        toast.success("Note updated");
      } else {
        // Default → CREATE flow
        const { res, body } = await createNote(app.id, { text: payload });
        if (!res.ok) {
          toast.error((body as any)?.message ?? "Failed to add note");
          return;
        }
        toast.success("Note added");
      }

      setOpen(false); // close dialog
      setText("");
      onAddedAction();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  const title = titleOverride ?? `Add note · ${app.job_title}`;
  const cta = ctaLabelOverride ?? "Save note";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setText(""); // clear on close
      }}
    >
      {/* IMPORTANT: no default trigger when controlled from outside */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
            {cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

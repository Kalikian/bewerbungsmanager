"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { API_BASE, getToken, parseJson } from "@/lib/http";
import { messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";
import ApplicationRowOverflow from "./application-row-overflow";

type Props = {
  id: number;
  title?: string;
  onDeletedAction?: () => void; // callback um Liste neu zu laden
};

export default function ApplicationRowActions({ id, title, onDeletedAction }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const onConfirmDelete = async () => {
    setBusy(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        credentials: "include",
      });

      const body = await parseJson<ApiErrorBody>(res);
      if (!res.ok) {
        throw new Error(messageFromApiError(body, "Delete failed"));
      }

      toast.success("Application deleted");
      onDeletedAction?.(); // Table reload
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <ApplicationRowOverflow onDeleteAction={() => setOpen(true)} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete application?</AlertDialogTitle>
          <AlertDialogDescription>
            {title
              ? `„${title}“ will be permanently removed.`
              : "This entry will be permanently removed."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Delete…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

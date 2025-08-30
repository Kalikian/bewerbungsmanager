"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * Reusable confirmation dialog (e.g., for "Delete profile").
 *
 * Props:
 * - children: Trigger element (e.g., <Button variant="destructive">Delete</Button>)
 * - title: Dialog title
 * - description?: Optional description (a11y)
 * - confirmText?: Text for the confirm button (default: "Confirm")
 * - cancelText?: Text for the cancel button (default: "Cancel")
 * - onConfirmAction: async/void callback; called when the action is confirmed
 * - variant?: "default" | "destructive" (styles the action button)
 * - requireText?: Optional confirmation text the user must type (e.g., "DELETE" or email)
 * - open?/onOpenChangeAction?: optionally controlled from the parent
 */

export function ConfirmDialog({
  children,
  title,
  description,
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  onConfirmAction,
  variant = "default",
  requireText,
  open: controlledOpen,
  onOpenChangeAction,
}: {
  children: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirmAction: () => Promise<void> | void;
  variant?: "default" | "destructive";
  requireText?: string;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChangeAction?.(v);
    else setUncontrolledOpen(v);
  };

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [typed, setTyped] = React.useState("");

  const mustType = typeof requireText === "string" && requireText.length > 0;
  const confirmDisabled =
    busy || (mustType && typed.trim() !== requireText);

  async function handleConfirm() {
    setError(null);
    try {
      setBusy(true);
      await onConfirmAction();
      setOpen(false);
      setTyped("");
    } catch (e: any) {
      setError(e?.message ?? "Aktion fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setTyped(""); }}}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {mustType && (
          <div className="mt-2 grid gap-2">
            <p className="text-sm text-muted-foreground">
              Bitte tippe <span className="font-medium">{requireText}</span> zur Bestätigung.
            </p>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={busy}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {busy ? "Bitte warten…" : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { CheckCircle2 } from "lucide-react";

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
 * - requireText?: Optional confirmation text to type (e.g., "DELETE")
 *
 * - showInlineSuccess?: Show a success phase *inside* the dialog (default: false)
 *   NOTE: When false (default), prefer showing success via a global toast at the call site.
 * - successText?: Message shown after success (green, only if showInlineSuccess === true)
 * - successDelayMs?: Delay before auto-close on inline success (default 1000)
 *
 * - onSuccessAction?: callback fired after the dialog closes on success
 * - open?/onOpenChangeAction?: optionally controlled from the parent
 */
export function ConfirmDialog({
  children,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirmAction,
  variant = "default",
  requireText,
  showInlineSuccess = false,
  successText = "Action completed successfully",
  successDelayMs = 1000,
  onSuccessAction,
  open: controlledOpen,
  onOpenChangeAction,
}: {
  children: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirmAction: () => Promise<void> | void; // not "onConfirm" to avoid Next 15 warning
  variant?: "default" | "destructive";
  requireText?: string;

  // toast-based success; inline phase opt-in only
  showInlineSuccess?: boolean;
  successText?: string; // only used if showInlineSuccess === true
  successDelayMs?: number;

  onSuccessAction?: () => void;
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
  const [success, setSuccess] = React.useState(false); // used only for optional inline success

  const mustType = typeof requireText === "string" && requireText.length > 0;
  const confirmDisabled = busy || success || (mustType && typed.trim() !== requireText);

  async function handleConfirm() {
    setError(null);
    try {
      setBusy(true);
      await onConfirmAction(); // perform action (e.g., DELETE)

      if (showInlineSuccess && successText) {
        setSuccess(true);
        window.setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setTyped("");
          onSuccessAction?.(); // caller can show a toast here if desired
        }, Math.max(0, successDelayMs));
      } else {
        setOpen(false);
        setSuccess(false);
        setTyped("");
        onSuccessAction?.();
      }
    } catch (e: any) {
      setError(e?.message ?? "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setError(null);
          setTyped("");
          setSuccess(false);
          setBusy(false);
        }
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>

        {mustType && !success && (
          <div className="mt-2 grid gap-2">
            <p className="text-sm text-muted-foreground">
              Please type <span className="font-medium">{requireText}</span> to confirm.
            </p>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              disabled={busy}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        {showInlineSuccess && success && (
          <p
            className="text-sm text-emerald-600 mt-2 flex items-center gap-2"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4" />
            {successText}
          </p>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={busy || success}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={confirmDisabled}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {busy ? "Please wait…" : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

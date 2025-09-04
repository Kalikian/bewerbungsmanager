"use client";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";

type Props = {
  onResetAction: () => Promise<void>;
  isResetting: boolean;
  mode: "create" | "edit";
};
export default function FormActions({ onResetAction, isResetting, mode }: Props) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  // Derive submit button labels from mode
  const submitIdleLabel = mode === "create" ? "Create application" : "Save changes";
  const submitBusyLabel = mode === "create" ? "Creating…" : "Saving…";

  return (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onResetAction}
        disabled={isSubmitting || isResetting}
      >
        {isResetting ? "Resetting…" : "Reset"}
      </Button>
      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? submitBusyLabel : submitIdleLabel}
      </Button>
    </div>
  );
}

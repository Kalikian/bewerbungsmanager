"use client";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";

type Props = {
  onResetAction: () => Promise<void>;
  isResetting: boolean;
};
export default function FormActions({ onResetAction, isResetting }: Props) {
  const { formState: { isSubmitting }, handleSubmit } = useFormContext();
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onResetAction} disabled={isSubmitting || isResetting}>
        {isResetting ? "Resetting…" : "Reset"}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

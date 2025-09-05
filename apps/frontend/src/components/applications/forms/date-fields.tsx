// DateFields.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormValues } from "@/lib/applications/types";

export default function DateFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Applied date */}
      <div className="grid gap-2">
        <Label htmlFor="applied_date">Applied date</Label>
        <Input
          id="applied_date"
          type="date"
          {...register("applied_date", {
            setValueAs: (v) => (typeof v === "string" && v.trim() === "" ? "" : v),
          })}
          aria-invalid={!!errors.applied_date}
        />
        {errors.applied_date && (
          <p className="text-sm text-red-600">{errors.applied_date.message as any}</p>
        )}
      </div>

      {/* Start date */}
      <div className="grid gap-2">
        <Label htmlFor="start_date">Start date</Label>
        <Input
          id="start_date"
          type="date"
          {...register("start_date", {
            setValueAs: (v) => (typeof v === "string" && v.trim() === "" ? "" : v),
          })}
          aria-invalid={!!errors.start_date}
        />
        {errors.start_date && (
          <p className="text-sm text-red-600">{errors.start_date.message as any}</p>
        )}
      </div>

      {/* Application deadline */}
      <div className="grid gap-2">
        <Label htmlFor="application_deadline">Application deadline</Label>
        <Input
          id="application_deadline"
          type="date"
          {...register("application_deadline", {
            setValueAs: (v) => (typeof v === "string" && v.trim() === "" ? "" : v),
          })}
          aria-invalid={!!errors.application_deadline}
        />
        {errors.application_deadline && (
          <p className="text-sm text-red-600">{errors.application_deadline.message as any}</p>
        )}
      </div>
    </div>
  );
}

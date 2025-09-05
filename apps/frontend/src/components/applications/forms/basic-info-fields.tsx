"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, type FormValues } from "@/lib/applications/types";

export default function BasicInfoFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormValues>();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="job_title">Job title *</Label>
        <Input id="job_title" {...register("job_title")} aria-invalid={!!errors.job_title} />
        {errors.job_title && <p className="text-sm text-red-600">{errors.job_title.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="company">Company *</Label>
        <Input id="company" {...register("company")} aria-invalid={!!errors.company} />
        {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value ?? "open"} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && <p className="text-sm text-red-600">{errors.status.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="job_source">Job source</Label>
        <Input id="job_source" {...register("job_source")} aria-invalid={!!errors.job_source} />
        {errors.job_source && <p className="text-sm text-red-600">{errors.job_source.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="job_url">Job URL</Label>
        <Input
          id="job_url"
          type="url"
          placeholder="https://…"
          {...register("job_url")}
          aria-invalid={!!errors.job_url}
        />
        {errors.job_url && <p className="text-sm text-red-600">{errors.job_url.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="salary">Salary</Label>
        <Input
          id="salary"
          type="number"
          step="1"
          min="0"
          placeholder="e.g. 5000"
          inputMode="numeric"
          {...register("salary", {
            // Keep empty string as "";
            setValueAs: (v: unknown) =>
              v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? "" : v,
          })}
          aria-invalid={!!errors.salary}
        />
        {errors.salary && <p className="text-sm text-red-600">{errors.salary.message as any}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="work_model">Work model</Label>
        <Input
          id="work_model"
          placeholder="onsite / hybrid / remote"
          {...register("work_model")}
          aria-invalid={!!errors.work_model}
        />
        {errors.work_model && <p className="text-sm text-red-600">{errors.work_model.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
        {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
      </div>
    </div>
  );
}

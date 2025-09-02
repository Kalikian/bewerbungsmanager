"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createApplicationSchema, STATUSES } from "@shared";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { getToken, API_BASE, parseJson } from "@/lib/http";
import { applyIssues, messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

/* ───────────────────────── Types ───────────────────────── */

// Zod INPUT type (before preprocess/transform) – what RHF works with
type ZodInput = z.input<typeof createApplicationSchema>;

/**
 * RHF form values:
 * - Override fields that confuse types (e.g., status, salary) so UI components get proper types.
 *   - status: string union (Select expects string)
 *   - salary: number input may deliver string; backend coerces to number
 */
type FormValues = Omit<ZodInput, "status" | "salary"> & {
  status?: (typeof STATUSES)[number];
  salary?: string | number | undefined;
};

// Zod OUTPUT type (after preprocess/transform) – what the API should receive
type Payload = z.output<typeof createApplicationSchema>;

/* Whitelist for mapping backend issues → field errors */
const FIELD_WHITELIST = [
  "job_title",
  "company",
  "status",
  "contact_name",
  "contact_email",
  "contact_phone",
  "address",
  "job_source",
  "job_url",
  "salary",
  "work_model",
  "start_date",
  "application_deadline",
] as const;

export default function ApplicationForm() {
  const router = useRouter();

  // Important: use the INPUT type + cast resolver to the same
  const form = useForm<FormValues>({
    resolver: zodResolver(createApplicationSchema) as unknown as Resolver<FormValues>,
    mode: "onSubmit",
    defaultValues: {
      job_title: "",
      company: "",
      status: "open", // UI default; schema will also default to 'open' if empty
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      job_source: "",
      job_url: "",
      salary: undefined,
      work_model: "",
      start_date: "",
      application_deadline: "",
    },
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = form;

  // Submit handler:
  // 1) Parse RHF input through Zod → payload (strings→undefined, defaults applied)
  // 2) POST with bearer token
  async function onSubmit(values: FormValues) {
    const token = getToken();
    if (!token) {
      toast("Please log in to create an application.");
      router.push("/login");
      return;
    }

    let payload: Payload;
    try {
      payload = createApplicationSchema.parse(values);
    } catch (e) {
      // If parsing throws (should rarely happen because resolver validates already)
      toast.error("Validation failed. Please check your inputs.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body = await parseJson<ApiErrorBody & { id?: number }>(res);

      if (!res.ok) {
        if (res.status === 400) {
          // Map field-level issues from backend to RHF
          const mapped = applyIssues(body, setError, [...FIELD_WHITELIST]);
          if (!mapped) {
            toast.error(messageFromApiError(body, "Validation failed"));
          }
          return;
        }
        if (res.status === 401) {
          toast("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        toast.error(messageFromApiError(body, "Creating application failed"));
        return;
      }

      toast.success("Application created");
      reset({
        job_title: "",
        company: "",
        status: "open",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        job_source: "",
        job_url: "",
        salary: undefined,
        work_model: "",
        start_date: "",
        application_deadline: "",
      });
      // Notify lists to reload
      window.dispatchEvent(new Event("applications:changed"));
      // If we're on /applications/new -> go back to the list
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/applications/new")
      ) {
        router.replace("/applications");
      } else {
        // If the form is ever embedded on the list page itself, just refresh it
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ─────────── Basic info ─────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Job title */}
        <div className="grid gap-2">
          <Label htmlFor="job_title">Job title</Label>
          <Input id="job_title" {...register("job_title")} aria-invalid={!!errors.job_title} />
          {errors.job_title && <p className="text-sm text-red-600">{errors.job_title.message}</p>}
        </div>

        {/* Company */}
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} aria-invalid={!!errors.company} />
          {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}
        </div>

        {/* Status (use Controller for shadcn Select) */}
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

        {/* Job source */}
        <div className="grid gap-2">
          <Label htmlFor="job_source">Job source</Label>
          <Input id="job_source" {...register("job_source")} aria-invalid={!!errors.job_source} />
          {errors.job_source && <p className="text-sm text-red-600">{errors.job_source.message}</p>}
        </div>

        {/* Job URL */}
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

        {/* Salary (string/number; backend coerces to number) */}
        <div className="grid gap-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            step="1"
            min="0"
            placeholder="e.g. 55000"
            {...register("salary")}
            aria-invalid={!!errors.salary}
          />
          {errors.salary && <p className="text-sm text-red-600">{errors.salary.message as any}</p>}
        </div>

        {/* Work model */}
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

        {/* Address */}
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
          {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
        </div>
      </div>

      {/* ─────────── Contact ─────────── */}
      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="text-sm font-medium text-muted-foreground">Contact</legend>

        {/* Contact name */}
        <div className="grid gap-2 sm:col-span-1">
          <Label htmlFor="contact_name">Name</Label>
          <Input
            id="contact_name"
            {...register("contact_name")}
            aria-invalid={!!errors.contact_name}
          />
          {errors.contact_name && (
            <p className="text-sm text-red-600">{errors.contact_name.message}</p>
          )}
        </div>

        {/* Contact email */}
        <div className="grid gap-2 sm:col-span-1">
          <Label htmlFor="contact_email">Email</Label>
          <Input
            id="contact_email"
            type="email"
            {...register("contact_email")}
            aria-invalid={!!errors.contact_email}
          />
          {errors.contact_email && (
            <p className="text-sm text-red-600">{errors.contact_email.message}</p>
          )}
        </div>

        {/* Contact phone */}
        <div className="grid gap-2 sm:col-span-1">
          <Label htmlFor="contact_phone">Phone</Label>
          <Input
            id="contact_phone"
            {...register("contact_phone")}
            aria-invalid={!!errors.contact_phone}
          />
          {errors.contact_phone && (
            <p className="text-sm text-red-600">{errors.contact_phone.message}</p>
          )}
        </div>
      </fieldset>

      {/* ─────────── Dates ─────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Start date */}
        <div className="grid gap-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input
            id="start_date"
            type="date"
            {...register("start_date")}
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
            {...register("application_deadline")}
            aria-invalid={!!errors.application_deadline}
          />
          {errors.application_deadline && (
            <p className="text-sm text-red-600">{errors.application_deadline.message as any}</p>
          )}
        </div>
      </div>

      {/* ─────────── Actions ─────────── */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Create"}
        </Button>
      </div>
    </form>
  );
}

// apps/frontend/components/applications/application.edit.form.tsx
"use client";

import { useCallback, useEffect, useMemo, useState /* removed: useRef */ } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller, type Resolver, type FieldErrors } from "react-hook-form"; // NOTE: FieldErrors for onInvalid
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { STATUSES, updateApplicationSchema } from "@shared";

import { API_BASE, getToken, parseJson } from "@/lib/http";
import { applyIssues, messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ───────────────────── Types ───────────────────── */

// Backend entity shape (snake_case)
type Application = {
  id: number;
  job_title: string;
  company: string;
  status: (typeof STATUSES)[number];
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address?: string | null;
  job_source?: string | null;
  job_url?: string | null;
  salary?: number | null;
  work_model?: string | null;
  start_date?: string | null; // "YYYY-MM-DD" or null
  application_deadline?: string | null; // "YYYY-MM-DD" or null
  created_at?: string | null;
  updated_at?: string | null;
};

// Zod INPUT type for the update schema (RHF works with input type)
type ZIn = z.input<typeof updateApplicationSchema>;

/**
 * RHF form values override:
 * - status: string union (Select expects string)
 * - salary: number input may deliver string; backend coerces to number on parse
 */
type FormValues = Omit<ZIn, "status" | "salary"> & {
  status?: (typeof STATUSES)[number];
  salary?: string | number | undefined;
};

// Zod OUTPUT type (after preprocess/transform) – payload for PATCH
type Payload = z.output<typeof updateApplicationSchema>;

/* All editable fields (for field error mapping) */
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

/* Map API entity -> form defaults (ensure empty strings for inputs) */
function toFormDefaults(a: Application | null): FormValues {
  if (!a) {
    return {
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
    };
  }
  return {
    job_title: a.job_title ?? "",
    company: a.company ?? "",
    status: a.status ?? "open",
    contact_name: a.contact_name ?? "",
    contact_email: a.contact_email ?? "",
    contact_phone: a.contact_phone ?? "",
    address: a.address ?? "",
    job_source: a.job_source ?? "",
    job_url: a.job_url ?? "",
    salary: a.salary ?? undefined,
    work_model: a.work_model ?? "",
    start_date: a.start_date ?? "",
    application_deadline: a.application_deadline ?? "",
  };
}

/* NOTE: Local edit schema — enforce required fields for this form (toast-only UX) */
const editSchema = updateApplicationSchema.superRefine((val, ctx) => {
  const jt = (val as any).job_title;
  const co = (val as any).company;
  if (typeof jt !== "string" || jt.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["job_title"],
      message: "Job title is required.",
    });
  }
  if (typeof co !== "string" || co.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["company"],
      message: "Company is required.",
    });
  }
});

export default function ApplicationEditForm({ id }: { id: number }) {
  const [entity, setEntity] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false); // UI state for the Reset button
  const router = useRouter();

  // Use local edit schema so title & company are required on client
  const form = useForm<FormValues>({
    resolver: zodResolver(editSchema) as unknown as Resolver<FormValues>,
    mode: "onSubmit",
    defaultValues: toFormDefaults(null),
  });

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isSubmitting }, // NOTE: keep errors for aria-invalid but don't render inline messages
    setError,
  } = form;

  // Load the application by id and prefill the form
  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setEntity(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await parseJson<Application>(res);
      if (!res.ok) {
        toast.error(messageFromApiError(body as any, "Failed to load application"));
        setEntity(null);
      } else {
        setEntity(body);
        const defaults = toFormDefaults(body);
        reset(defaults); // prefill the form with fresh values from the server
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while loading application");
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset handler: re-fetch from the server and reset the form (like a lightweight page refresh)
  async function handleReset() {
    try {
      setIsResetting(true);
      await load();
      toast("Form reset to the original values.");
    } finally {
      setIsResetting(false);
    }
  }

  /* RHF invalid handler — show only a toast (no inline field messages) */
  function onInvalid(errs: FieldErrors<FormValues>) {
    const messages = Object.values(errs)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Please check your inputs.", {
      description: messages.slice(0, 3).join(" • "),
    });
  }

  // Submit: parse to payload and PATCH
  async function onSubmit(values: FormValues) {
    const token = getToken();
    if (!token) {
      toast("Please log in to edit an application.");
      return;
    }

    // Values validated by resolver; parse again for transforms
    let payload: Payload;
    try {
      payload = editSchema.parse(values) as Payload;
    } catch {
      toast.error("Validation failed. Please check your inputs.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const body = await parseJson<ApiErrorBody>(res);

      if (!res.ok) {
        if (res.status === 400) {
          // Map server issues into RHF (kept for aria-invalid), but don't render inline
          applyIssues(body, setError, [...FIELD_WHITELIST]);
          const details = body?.details?.map((d) => d.message).filter(Boolean) ?? [];
          toast.error(messageFromApiError(body, "Update failed (validation)"), {
            description: details.slice(0, 3).join(" • "),
          });
          return;
        }
        if (res.status === 404) {
          toast.error("Application not found");
          return;
        }
        toast.error(messageFromApiError(body, "Update failed"));
        return;
      }

      toast.success("Application updated");
      window.dispatchEvent(new Event("applications:changed"));
      router.replace("/applications");
    } catch (e) {
      console.error(e);
      toast.error("Network error while updating");
    }
  }

  const cardTitle = useMemo(
    () => (entity ? `${entity.job_title} · ${entity.company}` : "Application"),
    [entity],
  );

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>Change fields and save your updates.</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !entity ? (
          <p className="text-sm text-muted-foreground">No data.</p>
        ) : (
          // Pass onInvalid to show toast on client-side validation errors
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="job_title">Job title *</Label>
                <Input
                  id="job_title"
                  {...register("job_title")}
                  aria-invalid={!!errors.job_title} // NOTE: keep for a11y; no inline text below
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" {...register("company")} aria-invalid={!!errors.company} />
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="job_source">Job source</Label>
                <Input
                  id="job_source"
                  {...register("job_source")}
                  aria-invalid={!!errors.job_source}
                />
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
              </div>

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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="work_model">Work model</Label>
                <Input
                  id="work_model"
                  placeholder="onsite / hybrid / remote"
                  {...register("work_model")}
                  aria-invalid={!!errors.work_model}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
              </div>
            </div>

            {/* Contact */}
            <fieldset className="grid gap-4 sm:grid-cols-3">
              <legend className="text-sm font-medium text-muted-foreground">Contact</legend>

              <div className="grid gap-2 sm:col-span-1">
                <Label htmlFor="contact_name">Name</Label>
                <Input
                  id="contact_name"
                  {...register("contact_name")}
                  aria-invalid={!!errors.contact_name}
                />
              </div>

              <div className="grid gap-2 sm:col-span-1">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  aria-invalid={!!errors.contact_email}
                />
              </div>

              <div className="grid gap-2 sm:col-span-1">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  {...register("contact_phone")}
                  aria-invalid={!!errors.contact_phone}
                />
              </div>
            </fieldset>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  aria-invalid={!!errors.start_date}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="application_deadline">Application deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  {...register("application_deadline")}
                  aria-invalid={!!errors.application_deadline}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {/* Reset button: refetch & reset the form to the server state */}
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting || loading || isResetting}
              >
                {isResetting ? "Resetting…" : "Reset"}
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// apps/frontend/components/applications/application.edit.form.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { STATUSES, createApplicationSchema, updateApplicationSchema } from "@shared";
import type { Application as AppEntity, ApplicationStatus } from "@shared";

import { API_BASE, getToken, parseJson } from "@/lib/http";
import { applyIssues, messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type ZIn = z.input<typeof createApplicationSchema>;

/**
 * RHF form values override:
 * - status: string union (Select expects string)
 * - salary: number input may deliver string; backend coerces to number on parse
 */
type FormValues = Omit<ZIn, "status" | "salary"> & {
  status?: ApplicationStatus;
  salary?: string | number | undefined;
};

type Payload = z.output<typeof updateApplicationSchema>;

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

/* Map API entity -> form defaults (ensure empty strings for inputs) */
function toFormDefaults(a: AppEntity | null): FormValues {
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

export default function ApplicationEditForm({ id }: { id: number }) {
  const [entity, setEntity] = useState<AppEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(createApplicationSchema) as unknown as Resolver<FormValues>,
    mode: "onSubmit",
    defaultValues: toFormDefaults(null),
  });

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isSubmitting },
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
      const body = await parseJson<AppEntity>(res);
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

  async function handleReset() {
    try {
      setIsResetting(true);
      await load();
      toast("Form reset to the original values.");
    } finally {
      setIsResetting(false);
    }
  }

// CHANGE: build PATCH payload from RAW form values via UPDATE schema
async function onSubmit(values: FormValues) {
  const token = getToken();
  if (!token) {
    toast("Please log in to edit an application.");
    router.push("/login");
    return;
  }

  // CHANGE: get the raw UI values (call the function!)
  const raw = form.getValues(); // <— was: const raw = form.getValues

  // CHANGE: parse with UPDATE schema so '' becomes null (clear field)
  let payload: Payload;
  try {
    payload = updateApplicationSchema.parse(raw) as Payload;
  } catch {
    // RHF already shows inline errors via resolver; keep this silent
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
        const mapped = applyIssues(body, setError, [...FIELD_WHITELIST]);
        if (!mapped) toast.error(messageFromApiError(body, "Update failed (validation)"));
        return;
      }
      if (res.status === 401) {
        toast("Session expired. Please log in again.");
        router.push("/login");
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
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="job_title">Job title *</Label>
                <Input
                  id="job_title"
                  {...register("job_title")}
                  aria-invalid={!!errors.job_title}
                />
                {errors.job_title && (
                  <p className="text-sm text-red-600">{errors.job_title.message}</p>
                )}
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
                <Input
                  id="job_source"
                  {...register("job_source")}
                  aria-invalid={!!errors.job_source}
                />
                {errors.job_source && (
                  <p className="text-sm text-red-600">{errors.job_source.message}</p>
                )}
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
                  placeholder="e.g. 55000"
                  {...register("salary")}
                  aria-invalid={!!errors.salary}
                />
                {errors.salary && (
                  <p className="text-sm text-red-600">{errors.salary.message as any}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="work_model">Work model</Label>
                <Input
                  id="work_model"
                  placeholder="onsite / hybrid / remote"
                  {...register("work_model")}
                  aria-invalid={!!errors.work_model}
                />
                {errors.work_model && (
                  <p className="text-sm text-red-600">{errors.work_model.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} aria-invalid={!!errors.address} />
                {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
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
                {errors.contact_name && (
                  <p className="text-sm text-red-600">{errors.contact_name.message}</p>
                )}
              </div>

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
                {errors.start_date && (
                  <p className="text-sm text-red-600">{errors.start_date.message as any}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="application_deadline">Application deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  {...register("application_deadline")}
                  aria-invalid={!!errors.application_deadline}
                />
                {errors.application_deadline && (
                  <p className="text-sm text-red-600">
                    {errors.application_deadline.message as any}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
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

// @hooks/useEditApplicationForm.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Application } from "@shared";
import { createApplicationSchema } from "@shared";

import {
  APPLICATION_DEFAULTS,
  FIELD_WHITELIST,
  type ApplicationFormValues,
  type ApplicationPayload,
} from "@/lib/applications/types";
import { patchApplication } from "@/lib/applications/api";
import { getToken, parseJson } from "@/lib/http";
import { applyIssues, messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

/** Map backend entity -> UI form shape */
function mapEntityToForm(e: Application): ApplicationFormValues {
  return {
    ...APPLICATION_DEFAULTS,
    job_title: e.job_title ?? "",
    company: e.company ?? "",
    status: (e.status ?? "open") as ApplicationFormValues["status"],
    contact_name: e.contact_name ?? "",
    contact_email: e.contact_email ?? "",
    contact_phone: e.contact_phone ?? "",
    address: e.address ?? "",
    job_source: e.job_source ?? "",
    job_url: e.job_url ?? "",
    salary: e.salary ?? undefined, // UI allows string|number|undefined; Zod will coerce
    work_model: e.work_model ?? "",
    start_date: e.start_date ? e.start_date.slice(0, 10) : "",
    application_deadline: e.application_deadline ? e.application_deadline.slice(0, 10) : "",
    applied_date: e.applied_date ? e.applied_date.slice(0, 10) : "",
  };
}

/** Normalize UI values to API payload via Zod (coerce strings, trim empties, etc.) */
function normalize(ui: ApplicationFormValues): ApplicationPayload {
  return createApplicationSchema.parse(ui);
}

/** Build a PATCH payload containing only changed fields (vs baseline UI values) */
function buildPatchPayload(
  baseUI: ApplicationFormValues,
  nextUI: ApplicationFormValues,
): Partial<ApplicationPayload> {
  const base = normalize(baseUI);
  const next = normalize(nextUI);

  const patch: Partial<ApplicationPayload> = {};
  (FIELD_WHITELIST as readonly string[]).forEach((key) => {
    const k = key as keyof ApplicationPayload;
    const a = base[k];
    const b = next[k];
    // shallow compare is enough here (only primitives)
    const changed =
      (a ?? undefined) !== (b ?? undefined) &&
      // special case: numbers vs numeric strings already normalized by Zod,
      // so only true changes remain.
      true;
    if (changed) patch[k] = b as any;
  });

  return patch;
}

export function useEditApplicationForm(
  id: number,
  entity: Application | null | undefined,
  reload?: () => Promise<void>,
) {
  const router = useRouter();

  // RHF instance with your UI types
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(createApplicationSchema) as unknown as Resolver<ApplicationFormValues>,
    // ^ if you have an update schema, you can swap it in; not required.
    defaultValues: APPLICATION_DEFAULTS,
    mode: "onSubmit",
  });

  // Keep the last "pristine" UI snapshot for Reset & diff
  const lastSyncedRef = useRef<ApplicationFormValues>(APPLICATION_DEFAULTS);

  // Sync RHF whenever the server entity arrives/changes
  useEffect(() => {
    if (!entity) return;
    const next = mapEntityToForm(entity);
    lastSyncedRef.current = next; // update baseline
    form.reset(next); // clears dirty/touched/errors too
  }, [entity, form]);

  // Submit: compute diff -> PATCH -> map errors -> reload on success
  const onSubmit = useCallback(async () => {
    const token = getToken();
    if (!token) {
      toast("Please log in to update the application.");
      router.push("/login");
      return false;
    }

    // Build a minimal PATCH based on changes vs baseline
    let patch: Partial<ApplicationPayload>;
    try {
      patch = buildPatchPayload(lastSyncedRef.current, form.getValues());
    } catch {
      toast.error("Validation failed. Please check your inputs.");
      return false;
    }

    if (Object.keys(patch).length === 0) {
      toast.message("No changes to save.");
      return false;
    }

    try {
      const res = await patchApplication(id, token, patch);

      if (!res.ok) {
        // Try to parse JSON body for details (400 validation, etc.)
        const body = await parseJson<ApiErrorBody>(res).catch(() => undefined);

        if (res.status === 400 && body) {
          const mapped = applyIssues(body, form.setError, [...FIELD_WHITELIST]);
          if (!mapped) toast.error(messageFromApiError(body, "Validation failed"));
          return false;
        }
        if (res.status === 401) {
          toast("Session expired. Please log in again.");
          router.push("/login");
          return false;
        }

        toast.error(messageFromApiError(body, "Updating application failed"));
        return false;
      }

      await reload?.(); // fetch fresh entity; effect above will reset() to it
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
      return false;
    }
  }, [form, id, reload, router]);

  // Reset: revert to last synced baseline (server entity) + optional refetch
  const [isResetting, setIsResetting] = useState(false);
  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      form.reset(lastSyncedRef.current); // local undo
      await reload?.(); // optional: refetch from server
      toast.message("Changes discarded.");
    } finally {
      setIsResetting(false);
    }
  }, [form, reload]);

  return { form, onSubmit, handleReset, isResetting };
}

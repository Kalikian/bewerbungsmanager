"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getToken, parseJson } from "@/lib/http";
import { applyIssues, messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

import { createApplicationSchema, updateApplicationSchema } from "@shared";
import type { Application as AppEntity } from "@shared";

import { patchApplication } from "@/lib/applications/api";
import { toFormDefaults } from "@/lib/applications/transform";
import { FIELD_WHITELIST, type FormValues } from "@/lib/applications/types";

export function useEditApplicationForm(
  id: number,
  entity: AppEntity | null,
  reload: () => Promise<void>,
) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const defaultValues = useMemo(() => toFormDefaults(entity), [entity]);

  // NOTE: Resolver = CREATE schema (same UX as new-form: inline errors for required fields)
  const form = useForm<FormValues>({
    resolver: zodResolver(createApplicationSchema) as unknown as Resolver<FormValues>,
    mode: "onSubmit",
    defaultValues,
    values: defaultValues, // keep in sync when entity changes
  });

  async function handleReset() {
    setIsResetting(true);
    try {
      await reload();
      toast("Form reset to the original values.");
    } finally {
      setIsResetting(false);
    }
  }

  // NOTE: PATCH payload must come from UPDATE schema on RAW values (so '' → null can clear)
  async function onSubmit() {
    const token = getToken();
    if (!token) {
      toast("Please log in to edit an application.");
      router.push("/login");
      return;
    }

    const raw = form.getValues();

    let payload: any;
    try {
      payload = updateApplicationSchema.parse(raw);
    } catch {
      // inline errors already shown via resolver
      return;
    }

    try {
      const res = await patchApplication(id, token, payload);
      const body = await parseJson<ApiErrorBody>(res);

      if (!res.ok) {
        if (res.status === 400) {
          const mapped = applyIssues(body, form.setError, [...FIELD_WHITELIST]);
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

  return { form, onSubmit, handleReset, isResetting };
}

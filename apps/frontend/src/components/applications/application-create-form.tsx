"use client";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createApplicationSchema } from "@shared";

import ApplicationForm from "./application-form";

import {
  APPLICATION_DEFAULTS,
  FIELD_WHITELIST,
  type FormValues,
  type ApplicationPayload,
} from "@/lib/applications/types";
import { createApplication } from "@/lib/applications/api";
import { getToken } from "@/lib/http";
import { applyIssues, messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

export default function ApplicationCreateForm() {
  const router = useRouter();

  // Form state lives in the container (not in the UI component)
  const methods = useForm<FormValues>({
    resolver: zodResolver(createApplicationSchema) as unknown as Resolver<FormValues>,
    defaultValues: APPLICATION_DEFAULTS,
    mode: "onSubmit",
  });

  // Submit handler owned by the container
  const onSubmit = async (values: FormValues) => {
    const token = getToken();
    if (!token) {
      toast("Please log in to create an application.");
      router.push("/login");
      return;
    }

    let payload: ApplicationPayload;
    try {
      payload = createApplicationSchema.parse(values); // applies preprocess/defaults
    } catch {
      toast.error("Validation failed. Please check your inputs.");
      return;
    }

    try {
      const { res, body } = await createApplication(payload);

      if (!res.ok) {
        const apiBody = body as ApiErrorBody;
        if (res.status === 400) {
          // Map field-level issues to RHF errors; fall back to toast
          const mapped = applyIssues(apiBody, methods.setError, [...FIELD_WHITELIST]);
          if (!mapped) toast.error(messageFromApiError(apiBody, "Validation failed"));
          return;
        }
        if (res.status === 401) {
          toast("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        toast.error(messageFromApiError(apiBody, "Creating application failed"));
        return;
      }

      toast.success("Application created");
      methods.reset(APPLICATION_DEFAULTS);
      window.dispatchEvent(new Event("applications:changed"));
      router.replace("/applications");
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <ApplicationForm onResetAction={async () => methods.reset(APPLICATION_DEFAULTS)} />
      </form>
    </FormProvider>
  );
}

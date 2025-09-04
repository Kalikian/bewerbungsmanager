"use client";

import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { useApplication } from "@hooks/useApplication";
import { useEditApplicationForm } from "@hooks/useEditApplicationForm";
import ApplicationForm from "./application-form";

export default function ApplicationEditForm({ id }: { id: number }) {
  const router = useRouter();
  const { entity, loading, reload } = useApplication(id);
  const { form, onSubmit, handleReset, isResetting } = useEditApplicationForm(id, entity, reload);

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
          <FormProvider {...form}>
            <form
              noValidate
              className="space-y-6"
              onSubmit={form.handleSubmit(async () => {
                const ok = await onSubmit();
                if (ok) {
                  toast.success("Changes saved");
                  window.dispatchEvent(new Event("applications:changed"));
                  router.replace("/applications");
                  router.refresh();
                }
              })}
            >
              <ApplicationForm mode="edit" onResetAction={handleReset} isResetting={isResetting} />
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { useApplication } from "@hooks/useApplication";
import { useEditApplicationForm } from "@hooks/useEditApplicationForm";
import BasicInfoFields from "./sections/basic-info-fields";
import ContactFields from "./sections/contact-fields";
import DateFields from "./sections/date-fields";
import FormActions from "./sections/form-actions";

export default function ApplicationEditForm({ id }: { id: number }) {
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
            {/* NOTE: disable native validation, use Zod/RHF only */}
            <form noValidate onSubmit={form.handleSubmit(() => onSubmit())} className="space-y-6">
              <BasicInfoFields />
              <ContactFields />
              <DateFields />
              <FormActions onResetAction={handleReset} isResetting={isResetting} />
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
}

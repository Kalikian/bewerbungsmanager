// apps/frontend/app/applications/[id]/edit/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getToken } from "@/lib/http";
import PageHeader from "@/components/layout/page-header";
import ApplicationEditForm from "@/components/applications/application-edit-form";
import { Button } from "@/components/ui/button";

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // simple client-side guard
  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  const id = Number(params.id);

  return (
    <main id="main" className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Edit application"
          description="Update the details of your application."
        />
        <div className="pt-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Edit form */}
      <ApplicationEditForm id={id} />
    </main>
  );
}

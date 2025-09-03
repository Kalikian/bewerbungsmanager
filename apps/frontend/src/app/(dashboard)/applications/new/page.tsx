"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/http";
import PageHeader from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import ApplicationCreateForm from "@/components/applications/application-create-form";

export default function NewApplicationPage() {
  const router = useRouter();

  // simple client-side guard
  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  return (
    <main id="main" className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="New application" description="Add a new job application." />
        <div className="pt-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle>Create application</CardTitle>
          <CardDescription>
            Fill in the details below and submit to add a new application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationCreateForm />
        </CardContent>
      </Card>
    </main>
  );
}

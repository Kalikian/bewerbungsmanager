"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/http";
import PageHeader from "@/components/layout/page-header";
import ApplicationForm from "@/components/applications/application.form";

// shadcn/ui card
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ApplicationsPage() {
  const router = useRouter();

  // Simple client-side guard: redirect to home if not authenticated
  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  return (
    <main id="main" className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="Applications"
        description="Create and manage your job applications"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left: Create new application */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create application</CardTitle>
            <CardDescription>
              Fill in the details below and submit to add a new application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationForm />
          </CardContent>
        </Card>

        {/* Right: Placeholder for the list (future GET /applications integration) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Your applications</CardTitle>
            <CardDescription>
              Once created, your applications will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your applications will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

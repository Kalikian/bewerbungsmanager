"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/http";
import PageHeader from "@/components/layout/page-header";

export default function ApplicationsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  return (
    <main id="main" className="mx-auto max-w-7xl px-6 py-8">
      <PageHeader
        title="Applications"
        description="Create and manage your job applications"
      />

      <div className="mt-6 rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Your applications will appear here.
        </p>
      </div>
    </main>
  );
}

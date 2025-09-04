"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/http";
import PageHeader from "@/components/layout/page-header";
import ApplicationsTable from "@/components/applications/applications-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ApplicationsPage() {
  const router = useRouter();

  // simple client-side guard
  useEffect(() => {
    if (!getToken()) router.replace("/");
  }, [router]);

  return (
    <main id="main" className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Applications" description="Create and manage your job applications" />
        <div className="pt-2">
          <Button asChild>
            <Link href="/applications/new/">New application</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <ApplicationsTable />
      </div>
    </main>
  );
}

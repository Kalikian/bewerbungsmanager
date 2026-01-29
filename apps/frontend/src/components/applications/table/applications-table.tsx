"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { fmtDate } from "@/lib/applications/types";
import { useApplicationsList } from "@hooks/useApplicationsList";

import StatusCell from "./status-cell";
import ApplicationRowActions from "./application-row-actions";
import Link from "next/link";
import Pagination from "@/components/ui/pagination";

function stop(e: React.SyntheticEvent) {
  e.stopPropagation();
}

const PAGE_SIZE = 10;

export default function ApplicationsTable() {
  const { items, loading, reload, setItems } = useApplicationsList();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasData = !!items && items.length > 0;

  // Read current page from URL (?page=2)
  const currentPage = useMemo(() => {
    const raw = searchParams.get("page");
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }, [searchParams]);

  const totalPages = useMemo(() => {
    const total = items?.length ?? 0;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [items]);

  // Slice visible items for UI-only pagination
  const visibleItems = useMemo(() => {
    if (!items) return [];
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage, totalPages]);

  const table = useMemo(() => {
    if (!items) return null;

    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[1%]">#</TableHead>
            <TableHead>Job title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Work model</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleItems.map((a, idx) => (
            <TableRow
              key={a.id}
              role="link"
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => router.push(`/applications/${a.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/applications/${a.id}`);
                }
              }}
              aria-label={`Open ${a.job_title ?? "application"} at ${a.company ?? ""}`}
            >
              {/* Global index across pages (1..N), not only 1..10 */}
              <TableCell className="text-muted-foreground tabular-nums">
                {startIndex + idx + 1}
              </TableCell>

              <TableCell className="font-medium">
                <span className="block max-w-[260px] truncate" title={a.job_title ?? ""}>
                  {a.job_title ?? "—"}
                </span>
              </TableCell>

              <TableCell>
                <span className="block max-w-[240px] truncate" title={a.company ?? ""}>
                  {a.company ?? "—"}
                </span>
              </TableCell>

              <TableCell onClick={stop} onKeyDown={stop}>
                <StatusCell
                  id={a.id}
                  value={a.status}
                  onChangedAction={(next) => {
                    setItems((prev) =>
                      prev ? prev.map((x) => (x.id === a.id ? { ...x, status: next } : x)) : prev,
                    );
                  }}
                />
              </TableCell>
              <TableCell>{a.work_model ?? "—"}</TableCell>
              <TableCell>{fmtDate((a as any).applied_date)}</TableCell>
              <TableCell className="text-right" onClick={stop} onKeyDown={stop}>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label="Open details">
                    <Link href={`/applications/${a.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <ApplicationRowActions
                    id={a.id}
                    title={a.job_title ?? undefined}
                    onDeletedAction={() => {
                      setItems((prev) => (prev ? prev.filter((x) => x.id !== a.id) : prev));
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [items, visibleItems, currentPage, totalPages, router, reload, setItems]);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">No applications yet.</p>
          <div className="flex gap-2">
            <Button size="sm" asChild>
              <Link href="/applications/new/">New application</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const safePage = Math.min(currentPage, totalPages);

  return (
    <Card className="shadow-sm w-full">
      <CardContent className="p-0 overflow-x-auto">
        {table}
        <div className="p-4 border-t">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            makeHref={(p) => `/applications?page=${p}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo } from "react";
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
import type { Application } from "@shared";

import { fmtDate } from "@/lib/applications/types";
import { useApplicationsList } from "@hooks/useApplicationsList";

import StatusCell from "./status-cell";
import RowOverflow from "./application-row-overflow";
import AddNoteDialog from "./dialogs/add-note-dialog";
import AddAttachmentDialog from "./dialogs/add-attachment-dialog";
import ApplicationRowActions from "./application-row-actions";
import Link from "next/link";

export default function ApplicationsTable() {
  const { items, loading, reload, setItems } = useApplicationsList();
  const hasData = !!items && items.length > 0;

  const table = useMemo(() => {
    if (!items) return null;
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
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a, idx) => (
            <TableRow key={a.id}>
              <TableCell className="text-muted-foreground tabular-nums">{idx + 1}</TableCell>
              <TableCell className="font-medium">
                <Link href={`/applications/${a.id}`} className="hover:underline">
                  {a.job_title ?? "—"}
                </Link>
              </TableCell>
              <TableCell>{a.company ?? "—"}</TableCell>
              <TableCell>
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
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <AddNoteDialog app={a as Application} onAddedAction={reload} />
                  <AddAttachmentDialog app={a as Application} onAddedAction={reload} />
                  <ApplicationRowActions id={a.id} title={a.job_title} onDeletedAction={reload} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [items, reload, setItems]);

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
            <Button variant="outline" size="sm" onClick={reload}>
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/applications/new/">New application</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0 overflow-x-auto">{table}</CardContent>
      <CardContent className="p-4 border-t flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={reload}>
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}

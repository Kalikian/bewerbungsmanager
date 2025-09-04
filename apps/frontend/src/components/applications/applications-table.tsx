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
            <TableHead>Job title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Source</TableHead>
            <TableHead className="hidden lg:table-cell">Contact</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.job_title}</TableCell>
              <TableCell>{a.company}</TableCell>
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
              <TableCell className="hidden xl:table-cell">
                {a.job_source ? a.job_source : "—"}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {a.contact_name || a.contact_email ? (
                  <span className="text-sm text-muted-foreground">
                    {a.contact_name ?? "—"}
                    {a.contact_email ? ` · ${a.contact_email}` : ""}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{fmtDate(a.application_deadline)}</TableCell>
              <TableCell>{fmtDate(a.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" asChild>
                    <a href={`/applications/${a.id}`}>Edit</a>
                  </Button>
                  <AddNoteDialog app={a as Application} onAddedAction={reload} />
                  <AddAttachmentDialog app={a as Application} onAddedAction={reload} />
                  {/* IMPORTANT: prop name is onDeleted */}
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

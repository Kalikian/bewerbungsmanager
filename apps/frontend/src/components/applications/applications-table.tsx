"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUSES } from "@shared";

// Expected shape from backend (snake_case like your schema)
type Application = {
  id: number;
  job_title: string;
  company: string;
  status: (typeof STATUSES)[number];
  application_deadline?: string | null;
  created_at?: string | null;
};

function toTs(d?: string | null) {
  if (!d) return 0;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

function fmtDate(d?: string | null) {
  return d ? d.slice(0, 10) : "—";
}

/** Status badge variant mapping (tweak to your design) */
function StatusBadge({ status }: { status: Application["status"] }) {
  const variant =
    status === "open" || status === "applied"
      ? "secondary"
      : status === "interview"
      ? "default"
      : status === "offer" || status === "contract"
      ? "outline"
      : "destructive"; // rejected | withdrawn -> bottom anyway
  return <Badge variant={variant as any}>{status}</Badge>;
}

/** Sort rule:
 *  1) All except rejected/withdrawn at top by created_at DESC
 *  2) rejected/withdrawn at bottom by created_at DESC
 */
function sortApplications(list: Application[]): Application[] {
  const archived = new Set(["rejected", "withdrawn"]);
  const head = list
    .filter((a) => !archived.has(a.status))
    .sort((a, b) => toTs(b.created_at) - toTs(a.created_at));
  const tail = list
    .filter((a) => archived.has(a.status))
    .sort((a, b) => toTs(b.created_at) - toTs(a.created_at));
  return [...head, ...tail];
}

export default function ApplicationsTable() {
  const [items, setItems] = useState<Application[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const body = await parseJson<Application[] | { data?: Application[] }>(res);
      const raw = Array.isArray(body)
        ? body
        : Array.isArray((body as any)?.data)
        ? (body as any).data
        : [];
      setItems(sortApplications(raw));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load applications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial load
  useEffect(() => {
    load();
  }, [load]);

  // live refresh if other parts dispatch an event after create/update/delete
  useEffect(() => {
    const handler = () => load();
    window.addEventListener("applications:changed", handler);
    return () => window.removeEventListener("applications:changed", handler);
  }, [load]);

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

  if (!items || items.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            No applications yet.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              Refresh
            </Button>
            <Button size="sm" asChild>
              <a href="/applications/new">New application</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.job_title}</TableCell>
                <TableCell>{a.company}</TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell>{fmtDate(a.application_deadline)}</TableCell>
                <TableCell>{fmtDate(a.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className="p-4 border-t flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
        <Button size="sm" asChild>
          <a href="/applications/new">New application</a>
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { API_BASE, getToken, parseJson } from "@/lib/http";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES } from "@shared";

// Backend shape (snake_case)
type Application = {
  id: number;
  job_title: string;
  company: string;
  status: (typeof STATUSES)[number];
  job_source?: string | null;
  job_url?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
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

/** Inline status changer with optimistic PATCH */
function StatusCell({
  id,
  value,
  onChanged,
}: {
  id: number;
  value: Application["status"];
  onChanged: (next: Application["status"]) => void;
}) {
  const [current, setCurrent] = useState(value);
  useEffect(() => setCurrent(value), [value]);

  async function update(next: Application["status"]) {
    const prev = current;
    setCurrent(next); // optimistic
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setCurrent(prev);
        const body = await parseJson<any>(res);
        toast.error(body?.message ?? "Failed to update status");
        return;
      }
      toast.success("Status updated");
      onChanged(next);
      // optional: window.dispatchEvent(new Event("applications:changed"));
    } catch (e) {
      setCurrent(prev);
      toast.error("Network error");
    }
  }

  return (
    <Select value={current} onValueChange={(v) => update(v as any)}>
      <SelectTrigger className="h-7 w-[110px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Simple dialog to add a note to an application */
function AddNoteDialog({ app, onAdded }: { app: Application; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const disabled = !text.trim();

  async function submit() {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE}/applications/${app.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      const body = await parseJson<any>(res);
      if (!res.ok) {
        toast.error(body?.message ?? "Failed to add note");
        return;
      }
      toast.success("Note added");
      setOpen(false);
      setText("");
      onAdded();
      // optional: window.dispatchEvent(new Event("applications:changed"));
    } catch (e) {
      toast.error("Network error");
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add note
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add note · {app.job_title}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={6}
            placeholder="Write your note…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={disabled}>
              Save note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**  dialog to add an attachment (multipart/form-data) */
function AddAttachmentDialog({ app, onAdded }: { app: Application; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) return;
    const token = getToken();
    const fd = new FormData();
    fd.append("file", file);
    if (desc.trim()) fd.append("description", desc.trim());

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/applications/${app.id}/attachments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // don't set Content-Type for FormData
        },
        credentials: "include",
        body: fd,
      });
      const body = await parseJson<any>(res);
      if (!res.ok) {
        toast.error(body?.message ?? "Failed to upload attachment");
        return;
      }
      toast.success("Attachment uploaded");
      setOpen(false);
      setFile(null);
      setDesc("");
      onAdded();
      // optional: window.dispatchEvent(new Event("applications:changed"));
    } catch (e) {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Add attachment
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!busy) setOpen(o);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add attachment · {app.job_title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Textarea
              rows={4}
              placeholder="Optional description…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!file || busy}>
              {busy ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("applications:changed", handler);
    return () => window.removeEventListener("applications:changed", handler);
  }, [load]);

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
          {items.map((a, idx) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.job_title}</TableCell>
              <TableCell>{a.company}</TableCell>
              <TableCell>
                <StatusCell
                  id={a.id}
                  value={a.status}
                  onChanged={(next) => {
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
                  <AddNoteDialog app={a} onAdded={load} />
                  <AddAttachmentDialog app={a} onAdded={load} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [items, load]);

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
      <CardContent className="p-0 overflow-x-auto">{table}</CardContent>
      <CardContent className="p-4 border-t flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useApplication } from "@hooks/useApplication";
import StatusCell from "@/components/applications/status-cell";
import AddNoteDialog from "@/components/applications/dialogs/add-note-dialog";
import AddAttachmentDialog from "@/components/applications/dialogs/add-attachment-dialog";

import type { Application } from "@shared";
import { fmtDate } from "@/lib/applications/types";
import { API_BASE, getToken, parseJson } from "@/lib/http";
import { messageFromApiError, type ApiErrorBody } from "@/lib/api-errors";

function Meta({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value ?? "—"}</div>
    </div>
  );
}

export default function ApplicationShow({ id }: { id: number }) {
  const router = useRouter();
  const { entity: app, loading, reload } = useApplication(id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const title = useMemo(
    () => (app ? `${app.job_title ?? "Untitled"} · ${app.company ?? "—"}` : "Application"),
    [app],
  );

  async function onConfirmDelete() {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
      });
      const body = await parseJson<ApiErrorBody>(res);
      if (!res.ok) throw new Error(messageFromApiError(body, "Delete failed"));
      toast.success("Application deleted");
      router.push("/applications");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setConfirmOpen(false);
    }
  }

  if (loading || !app) {
    return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header (im Content-Bereich) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <StatusCell id={app.id} value={app.status} onChangedAction={reload} />
            {app.work_model && (
              <span className="rounded-full border px-2 py-0.5 text-xs">{app.work_model}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddNoteDialog app={app as Application} onAddedAction={reload} />
          <AddAttachmentDialog app={app as Application} onAddedAction={reload} />
          <Button asChild variant="secondary">
            <Link href={`/applications/${app.id}/edit`}>Edit</Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* Meta-Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Meta label="Applied" value={fmtDate((app as any).applied_date)} />
        <Meta label="Source" value={app.job_source} />
        <Meta
          label="Contact"
          value={[
            app.contact_name,
            app.contact_email,
            app.contact_phone ? `(${app.contact_phone})` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        />
        <Meta label="Salary" value={app.salary ? `${app.salary} €` : "—"} />
        <Meta
          label="Job URL"
          value={
            app.job_url ? (
              <a className="underline" href={app.job_url} target="_blank" rel="noreferrer">
                Open posting
              </a>
            ) : (
              "—"
            )
          }
        />
        <Meta label="Address" value={app.address} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Overview content (optional) – z. B. Beschreibung, interne Felder …
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="p-4 text-sm">
              {/* Hier später: Composer + NotesList */}
              Notes coming soon…
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardContent className="p-4 text-sm">
              {/* Hier später: Upload + AttachmentList */}
              Attachments coming soon…
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-4 text-sm">
              {/* Hier später: kombinierte Ereignis-Timeline */}
              Timeline coming soon…
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirm */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              {app.job_title
                ? `„${app.job_title}“ will be permanently removed.`
                : "This entry will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

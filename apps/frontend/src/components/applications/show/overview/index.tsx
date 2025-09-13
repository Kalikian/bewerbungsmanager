"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { useApplication } from "@hooks/useApplication";
import { useApplicationNotes } from "@hooks/useApplicationNotes";
import { useApplicationAttachments } from "@hooks/useApplicationAttachments";

import { relativeApplied } from "@/lib/format";

import SlimHeader from "./slim-header";
import InfoChipsWithApplied from "./info-chips-with-applied";
import SingleColumnDetails from "./single-column-details";
import NotesAndAttachmentsTabs from "./notes-and-attachments-tabs";
import type { NoteItem } from "./notes-and-attachments-tabs";

import AddNoteDialog from "@/components/applications/dialogs/add-note-dialog";
import AddAttachmentDialog from "@/components/applications/dialogs/add-attachment-dialog";
import DeleteApplicationAction from "@/components/applications/actions/delete-application-action";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// pretty, clickable list for attachments
import AttachmentList from "@/components/applications/attachments/attachment-list";
export default function ApplicationSlimOverview({ id }: { id: number }) {
  const router = useRouter();

  // hooks must be called unconditionally and before any conditional return
  const { entity, loading } = useApplication(id);

  const [noteOpen, setNoteOpen] = useState(false);
  const [attOpen, setAttOpen] = useState(false);

  // Notes hook incl. edit/remove
  const {
    items: notesRaw,
    reload: reloadNotes,
    edit: editNote,
    remove: removeNote,
  } = useApplicationNotes(id);

  // Attachments hook (returns AttachmentRow[] from backend)
  const { items: attachments, reload: reloadFiles } = useApplicationAttachments(id);

  // editing state for reusing AddNoteDialog as edit dialog
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);

  // map backend/shared models -> UI models (no hooks here)
  const toIso = (v: unknown): string => {
    if (typeof v === "string") return v;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  const notes: NoteItem[] = (notesRaw ?? []).map((n: any) => ({
    id: n.id,
    created_at: toIso(n.created_at),
    text: n.text ?? n.content ?? "",
  }));

  // after all hooks are called, you can return early
  if (loading || !entity) return null;

  const title = entity.job_title ?? "Application";
  const company = entity.company ?? undefined;
  const status = entity.status ?? undefined;

  const salary = entity.salary ?? undefined;
  const source = entity.job_source ?? undefined;
  const workModel = entity.work_model ?? undefined;

  const address = entity.address ?? undefined;
  const contactName = entity.contact_name ?? undefined;
  const contactEmail = entity.contact_email ?? undefined;
  const contactPhone = entity.contact_phone ?? undefined;

  const jobUrl = entity.job_url ?? undefined;
  const appliedDate =
    (entity as any).applied_date ??
    (typeof entity.created_at === "string" ? entity.created_at.slice(0, 10) : undefined);

  return (
    <div className="min-h-screen">
      <SlimHeader
        title={title}
        company={company}
        status={status as string}
        onEditAction={() => router.push(`/applications/${id}/edit`)}
        onAddNoteAction={() => setNoteOpen(true)}
        onAddAttachmentAction={() => setAttOpen(true)}
        deleteAction={
          <DeleteApplicationAction
            id={id}
            asChild
            onDeletedAction={() => router.push("/applications")}
            confirmTitle="Delete application?"
            confirmDescription={
              title
                ? `This action cannot be undone. „${title}“ will be permanently removed.`
                : "This entry will be permanently removed."
            }
          >
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DeleteApplicationAction>
        }
      />

      <InfoChipsWithApplied
        salary={salary}
        source={source}
        workModel={workModel}
        appliedText={relativeApplied(appliedDate)}
      />

      <SingleColumnDetails
        address={address}
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        jobUrl={jobUrl}
      />

      {/* Tabs: provide pretty AttachmentList via slot/override */}
      <NotesAndAttachmentsTabs
        notes={notes}
        filesCount={attachments?.length ?? 0} // show the count in the tab label
        attachmentsSlot={<AttachmentList items={attachments} onDeletedAction={reloadFiles} />}
        onEditNoteAction={(noteId, currentText) => {
          setEditing({ id: Number(noteId), text: currentText ?? "" });
        }}
        onDeleteNoteAction={(noteId) => {
          removeNote(Number(noteId));
        }}
      />

      {/* CREATE note dialog */}
      <AddNoteDialog
        app={entity}
        open={noteOpen}
        onOpenChangeAction={setNoteOpen}
        onAddedAction={() => {
          setNoteOpen(false);
          reloadNotes();
        }}
      />

      {/* EDIT note dialog (same component) */}
      {editing && (
        <AddNoteDialog
          app={entity}
          open={true}
          onOpenChangeAction={(o) => {
            if (!o) setEditing(null);
          }}
          initialText={editing.text}
          titleOverride={`Edit note · ${entity.job_title ?? ""}`}
          ctaLabelOverride="Save changes"
          onAddedAction={() => {
            setEditing(null);
            reloadNotes();
          }}
          onSubmitOverrideAction={async (text: string) => {
            const result = await editNote(editing.id, { text });
            return !!result;
          }}
        />
      )}

      {/* ATTACHMENT dialog – closes + reloads the list on success */}
      <AddAttachmentDialog
        app={entity}
        open={attOpen}
        onOpenChangeAction={setAttOpen}
        onAddedAction={() => {
          setAttOpen(false);
          reloadFiles();
        }}
      />
    </div>
  );
}

export { default as SlimHeader } from "./slim-header";
export { default as InfoChipsWithApplied } from "./info-chips-with-applied";
export { default as SingleColumnDetails } from "./single-column-details";
export { default as NotesAndAttachmentsTabs } from "./notes-and-attachments-tabs";

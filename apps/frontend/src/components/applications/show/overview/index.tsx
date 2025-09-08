// apps/frontend/components/applications/show/overview/index.tsx
"use client";


import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApplication } from "@hooks/useApplication";
import { relativeApplied } from "@/lib/format";


import SlimHeader from "./slim-header";
import InfoChipsWithApplied from "./info-chips-with-applied";
import SingleColumnDetails from "./single-column-details";
import NotesAndAttachmentsTabs from "./notes-and-attachments-tabs";


export default function ApplicationSlimOverview({ id }: { id: number }) {
const router = useRouter();
const { entity, loading } = useApplication(id);
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
const appliedDate = (entity as any).applied_date ?? (typeof entity.created_at === "string" ? entity.created_at.slice(0, 10) : undefined);


// TODO: replace these with real hooks
const demoNotes: { id: number; created_at: string; text: string }[] = [];
const demoFiles: { id: number; name: string; size_bytes?: number }[] = [];


return (
<div className="min-h-screen">
<SlimHeader
title={title}
company={company}
status={status as string}
onEditAction={() => router.push(`/applications/${id}/edit`)}
onAddNoteAction={() => toast.info("Open 'Add note' dialog")}
onAddAttachmentAction={() => toast.info("Open 'Add attachment' dialog")}
onDeleteAction={() => toast.error("Implement delete flow")}
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


<NotesAndAttachmentsTabs notes={demoNotes} files={demoFiles} />
</div>
);
}

export { default as SlimHeader } from "./slim-header";
export { default as InfoChipsWithApplied } from "./info-chips-with-applied";
export { default as SingleColumnDetails } from "./single-column-details";
export { default as NotesAndAttachmentsTabs } from "./notes-and-attachments-tabs";

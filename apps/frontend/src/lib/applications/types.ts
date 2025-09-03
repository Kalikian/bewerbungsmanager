import { z } from "zod";
import { createApplicationSchema, STATUSES } from "@shared";
import type { ApplicationStatus, Application } from "@shared";

// RHF input type based on CREATE (same as new-form)
type ZIn = z.input<typeof createApplicationSchema>;

export type FormValues = Omit<ZIn, "status" | "salary"> & {
  status?: ApplicationStatus;
  salary?: string | number | undefined; // UI string allowed
};

export const FIELD_WHITELIST = [
  "job_title",
  "company",
  "status",
  "contact_name",
  "contact_email",
  "contact_phone",
  "address",
  "job_source",
  "job_url",
  "salary",
  "work_model",
  "start_date",
  "application_deadline",
] as const;

export function toTs(d?: string | null) {
  if (!d) return 0;
  const t = Date.parse(d);
  return Number.isFinite(t) ? t : 0;
}

export function fmtDate(d?: string | null) {
  return d ? d.slice(0, 10) : "—";
}

export function sortApplications(list: Application[]): Application[] {
  const archived = new Set(["rejected", "withdrawn"]);
  const head = list
    .filter((a) => !archived.has(a.status))
    .sort((a, b) => toTs(b.created_at) - toTs(a.created_at));
  const tail = list
    .filter((a) => archived.has(a.status))
    .sort((a, b) => toTs(b.created_at) - toTs(a.created_at));
  return [...head, ...tail];
}

export { STATUSES };

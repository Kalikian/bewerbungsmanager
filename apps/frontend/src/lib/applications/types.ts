import { z } from "zod";
import { createApplicationSchema, STATUSES } from "@shared";
import type { ApplicationStatus, Application } from "@shared";

// RHF input type based on CREATE (same as new-form)
type ZIn = z.input<typeof createApplicationSchema>;
// Zod INPUT type (what RHF sees)
export type ApplicationZodInput = z.input<typeof createApplicationSchema>;
// Zod OUTPUT type (what API should receive)
export type ApplicationPayload = z.output<typeof createApplicationSchema>;

export type FormValues = Omit<ZIn, "status" | "salary"> & {
  status?: ApplicationStatus;
  salary?: string | number | undefined; // UI string allowed
};

// RHF form values: tweak a few fields for UI components
export type ApplicationFormValues = Omit<ApplicationZodInput, "status" | "salary"> & {
  status?: (typeof STATUSES)[number];
  salary?: string | number | undefined;
};

/** Safe defaults for a blank form */
export const APPLICATION_DEFAULTS: ApplicationFormValues = {
  job_title: "",
  company: "",
  status: "open",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  job_source: "",
  job_url: "",
  salary: undefined,
  work_model: "",
  start_date: "",
  application_deadline: "",
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

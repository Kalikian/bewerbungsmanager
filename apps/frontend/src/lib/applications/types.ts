import { z } from "zod";
import { createApplicationSchema, STATUSES } from "@shared";
import type { ApplicationStatus } from "@shared";

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

export { STATUSES };

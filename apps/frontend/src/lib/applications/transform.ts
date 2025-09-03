import type { Application as AppEntity } from "@shared";
import type { FormValues } from "./types";

// Map API entity -> form defaults (ensure empty strings for inputs)
export function toFormDefaults(a: AppEntity | null): FormValues {
  if (!a) {
    return {
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
  }
  return {
    job_title: a.job_title ?? "",
    company: a.company ?? "",
    status: a.status ?? "open",
    contact_name: a.contact_name ?? "",
    contact_email: a.contact_email ?? "",
    contact_phone: a.contact_phone ?? "",
    address: a.address ?? "",
    job_source: a.job_source ?? "",
    job_url: a.job_url ?? "",
    salary: a.salary ?? undefined,
    work_model: a.work_model ?? "",
    start_date: a.start_date ?? "",
    application_deadline: a.application_deadline ?? "",
  };
}

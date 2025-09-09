// /lib/format.ts
export function formatMoney(value?: number | string, currency = "EUR") {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") {
    try {
      return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value);
    } catch {
      return `${value} ${currency}`;
    }
  }
  return String(value);
}

export function formatDate(value?: string, locale = "de-DE") {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}

const DAY = 24 * 60 * 60 * 1000;
const startOfLocalDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export type RelativeAppliedOptions = {
  asLabel?: boolean;   // true => "Applied …"/"Applies …", false => "in 3 days"/"3 days ago"
  verbPast?: string;   // Default: "Applied"
  verbFuture?: string; // Default: "Applies"
  todayLabel?: string; // Optional: overwrites "Applied today"
  empty?: string;      // Default: "-"
  locale?: string;     // Default: "en"
};

export function relativeApplied(
  input?: string | Date | null,
  {
    asLabel = true,
    verbPast = "Applied",
    verbFuture = "Applies",
    todayLabel,
    empty = "-",
    locale = "en",
  }: RelativeAppliedOptions = {},
) {
  if (!input) return empty;
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) return empty;

  const now = startOfLocalDay(new Date());
  const then = startOfLocalDay(date);
  const diffDays = Math.round((then.getTime() - now.getTime()) / DAY);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const rel = diffDays === 0 ? "today" : rtf.format(diffDays, "day");

  if (!asLabel) return rel;                   // "in 3 days" | "3 days ago" | "today"

  if (diffDays === 0) return todayLabel ?? `${verbPast} today`;
  return diffDays > 0 ? `${verbFuture} ${rel}` : `${verbPast} ${rel}`;
}

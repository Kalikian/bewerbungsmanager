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

export function relativeApplied(dateIso?: string | null) {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Applied today";
  if (days === 1) return "Applied yesterday";
  return `Applied ${days} days ago`;
}

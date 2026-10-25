import type { AdminCellFormat } from "../model/datasets";

/** Presentation helpers for admin cells. Pure functions, locale aware. */

export function formatDate(value: unknown, locale: string): string {
  if (value === null || value === undefined || value === "") return "—";
  const ms =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : Date.parse(String(value));
  if (!Number.isFinite(ms)) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(ms);
}

export function formatNumber(value: unknown, locale: string): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? new Intl.NumberFormat(locale).format(n) : "—";
}

export function formatBytes(value: unknown, locale: string): string {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const scaled = bytes / 1024 ** exponent;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(scaled)} ${units[exponent]}`;
}

export function shortId(value: unknown): string {
  const raw = String(value ?? "");
  if (!raw) return "—";
  return raw.length > 10 ? `${raw.slice(0, 8)}…` : raw;
}

export function formatCell(
  value: unknown,
  format: AdminCellFormat | undefined,
  locale: string,
): string {
  switch (format) {
    case "date":
      return formatDate(value, locale);
    case "number":
      return formatNumber(value, locale);
    case "bytes":
      return formatBytes(value, locale);
    case "identity":
      return shortId(value);
    default: {
      const text = value === null || value === undefined || value === "" ? "—" : String(value);
      return text.length > 90 ? `${text.slice(0, 90)}…` : text;
    }
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DISPLAY_TZ = "America/Chicago";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function toDisplayDate(input: string | Date): Date {
  if (typeof input === "string" && DATE_ONLY.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    // Anchor date-only values at noon UTC so the wall date is stable in any
    // Western timezone when rendered via toLocaleDateString.
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  }
  return new Date(input);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return toDisplayDate(date).toLocaleDateString("en-US", {
    timeZone: DISPLAY_TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return toDisplayDate(date).toLocaleDateString("en-US", {
    timeZone: DISPLAY_TZ,
    month: "short",
    day: "numeric",
  });
}

export function todayISO(): string {
  // YYYY-MM-DD for today's wall date in Central Time.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

export function formatLongDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return toDisplayDate(date).toLocaleDateString("en-US", {
    timeZone: DISPLAY_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

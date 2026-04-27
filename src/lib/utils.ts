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

export function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatShortDate(date);
}

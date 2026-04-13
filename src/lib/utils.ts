import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  return format(new Date(date), "MMM d");
}

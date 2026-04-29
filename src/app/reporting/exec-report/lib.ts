import type { Milestone, Project } from "@/lib/types";

export const GANTT_YEAR = 2026;

export const HIGHLIGHT_COLOURS = ["green", "blue", "amber", "orange"] as const;

export const MILESTONE_PILL_CLASS: Record<string, string> = {
  Upcoming: "upcoming",
  Complete: "complete",
  "At Risk": "at-risk",
  Overdue: "overdue",
};

export const NAVY_STATUSES = new Set(["In Progress", "Complete"]);

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export interface MilestoneWithProject extends Milestone {
  coeo_projects?: { name: string } | null;
}

export interface GanttRow {
  project: Project;
  startMonth: number;
  endMonth: number;
  msMonth: number | null;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function currentIsoWeek(today: Date = new Date()): {
  from: string;
  to: string;
} {
  const d = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const dayOfWeek = d.getUTCDay() || 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - (dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { from: isoDate(monday), to: isoDate(sunday) };
}

export function parseUtc(date: string): Date {
  return new Date(date + "T00:00:00Z");
}

export function formatLong(date: string | null | undefined): string {
  if (!date) return "";
  const d = parseUtc(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatShort(date: string | null | undefined): string {
  if (!date) return "";
  const d = parseUtc(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatBadgeDay(date: string): string {
  return parseUtc(date).getUTCDate().toString();
}

export function formatBadgeMonth(date: string): string {
  return parseUtc(date)
    .toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
    .toUpperCase();
}

export function periodLabel(from: string, to: string): string {
  if (!from || !to) return "";
  const fromD = parseUtc(from);
  const toD = parseUtc(to);
  const sameYear = fromD.getUTCFullYear() === toD.getUTCFullYear();
  const fromStr = fromD.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
  const toStr = toD.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Week of ${fromStr} – ${toStr}`;
}

export function buildGanttRows(
  projects: Project[],
  milestones: Milestone[],
  todayIso: string
): GanttRow[] {
  const earliestUpcoming = new Map<string, string>();
  for (const m of milestones) {
    if (!m.project_id || !m.due_date) continue;
    if (m.due_date < todayIso) continue;
    if (!earliestUpcoming.has(m.project_id)) {
      earliestUpcoming.set(m.project_id, m.due_date);
    }
  }

  const rows: GanttRow[] = [];
  for (const project of projects) {
    if (!project.start_date || !project.end_date) continue;
    const start = parseUtc(project.start_date);
    const end = parseUtc(project.end_date);
    const startYear = start.getUTCFullYear();
    const endYear = end.getUTCFullYear();
    if (endYear < GANTT_YEAR || startYear > GANTT_YEAR) continue;

    const startMonth = startYear < GANTT_YEAR ? 0 : start.getUTCMonth();
    const endMonth = endYear > GANTT_YEAR ? 11 : end.getUTCMonth();
    if (endMonth < startMonth) continue;

    let msMonth: number | null = null;
    const msDate = earliestUpcoming.get(project.id);
    if (msDate) {
      const ms = parseUtc(msDate);
      if (ms.getUTCFullYear() === GANTT_YEAR) {
        const m = ms.getUTCMonth();
        if (m >= startMonth && m <= endMonth) msMonth = m;
      }
    }

    rows.push({ project, startMonth, endMonth, msMonth });
  }
  return rows;
}

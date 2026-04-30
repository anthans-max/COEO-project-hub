import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import {
  buildGanttRows,
  currentIsoWeek,
  formatLong,
  isoDate,
  periodLabel,
  type MilestoneWithProject,
} from "@/app/reporting/exec-report/lib";
import { ExecReportPDF } from "@/app/reporting/exec-report/pdf/ExecReportPDF";
import type {
  KeyHighlight,
  MeetingNote,
  ProgramTheme,
  Project,
  ReportNarrative,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const week = currentIsoWeek();
  const from = searchParams.get("from") || week.from;
  const to = searchParams.get("to") || week.to;
  const todayIso = isoDate(new Date());

  const supabase = await createClient();
  const [
    { data: highlightsRaw },
    { data: projectsRaw },
    { data: milestonesRaw },
    { data: meetingsRaw },
    { data: themesRaw },
    { data: narrativeRaw },
  ] = await Promise.all([
    supabase
      .from("coeo_key_highlights")
      .select("*")
      .order("date", { ascending: false, nullsFirst: false })
      .limit(4),
    supabase
      .from("coeo_projects")
      .select("*")
      .eq("show_on_report", true)
      .order("sort_order"),
    supabase
      .from("coeo_milestones")
      .select("*, coeo_projects(name)")
      .gte("due_date", todayIso)
      .order("due_date", { ascending: true })
      .limit(4),
    supabase
      .from("coeo_meeting_notes")
      .select("*")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false })
      .limit(4),
    supabase
      .from("coeo_program_themes")
      .select("*")
      .order("code"),
    supabase
      .from("coeo_report_narrative")
      .select("*")
      .eq("report_week_start", from)
      .maybeSingle(),
  ]);

  const highlights = (highlightsRaw ?? []) as KeyHighlight[];
  const projects = (projectsRaw ?? []) as Project[];
  const milestones = (milestonesRaw ?? []) as MilestoneWithProject[];
  const meetings = (meetingsRaw ?? []) as MeetingNote[];
  const themes = (themesRaw ?? []) as ProgramTheme[];
  const narrative = (narrativeRaw ?? null) as ReportNarrative | null;

  const ganttRows = buildGanttRows(projects, milestones, todayIso);

  const buffer = await renderToBuffer(
    <ExecReportPDF
      highlights={highlights}
      projects={projects}
      milestones={milestones}
      meetings={meetings}
      themes={themes}
      narrative={narrative}
      ganttRows={ganttRows}
      periodFrom={from}
      periodTo={to}
      reportDate={formatLong(todayIso)}
      periodLabel={periodLabel(from, to)}
    />
  );

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="coeo-exec-report-${from}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

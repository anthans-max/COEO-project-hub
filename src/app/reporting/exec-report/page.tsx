import { createClient } from "@/lib/supabase/server";
import type {
  KeyHighlight,
  MeetingNote,
  ProgramTheme,
  Project,
  ReportNarrative,
} from "@/lib/types";
import { CommentsTextEditor } from "./CommentsTextEditor";
import { ExecReportControls } from "./controls";
import { ExecReportShell } from "./ExecReportShell";
import { GanttEditor } from "./GanttEditor";
import { HighlightsEditor } from "./HighlightsEditor";
import { MeetingsEditor } from "./MeetingsEditor";
import { NarrativeEditor } from "./NarrativeEditor";
import {
  GANTT_YEAR,
  MILESTONE_PILL_CLASS,
  buildGanttRows,
  currentIsoWeek,
  formatBadgeDay,
  formatBadgeMonth,
  formatLong,
  isoDate,
  periodLabel,
  type MilestoneWithProject,
} from "./lib";

export const dynamic = "force-dynamic";

const SECTION_ICONS = {
  highlights: (
    <svg className="section-icon" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="5" fill="#0A2342" />
      <path
        d="M5.5 11h11M5.5 7.5h11M5.5 14.5h6"
        stroke="#F4821F"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  roadmap: (
    <svg className="section-icon" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="5" fill="#0A2342" />
      <rect x="4" y="7.5" width="5" height="7" rx="1.5" fill="#F4821F" />
      <rect
        x="11"
        y="5.5"
        width="7"
        height="4"
        rx="1.5"
        fill="rgba(255,255,255,0.45)"
      />
      <rect
        x="11"
        y="11.5"
        width="5"
        height="4"
        rx="1.5"
        fill="rgba(255,255,255,0.45)"
      />
    </svg>
  ),
  milestones: (
    <svg className="section-icon" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="5" fill="#0A2342" />
      <rect
        x="8"
        y="8"
        width="8"
        height="8"
        rx="1.5"
        transform="rotate(45 11 11)"
        fill="none"
        stroke="#F4821F"
        strokeWidth="1.3"
      />
      <path
        d="M11 5.5v2M11 14.5v2M5.5 11h2M14.5 11h2"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  ),
  meetings: (
    <svg className="section-icon" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="5" fill="#0A2342" />
      <rect
        x="5.5"
        y="6.5"
        width="11"
        height="10"
        rx="1.5"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.1"
        fill="none"
      />
      <path
        d="M8 6.5V5.5M14 6.5V5.5"
        stroke="#F4821F"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M5.5 9.5h11"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.1"
      />
    </svg>
  ),
  comments: (
    <svg className="section-icon" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="5" fill="#0A2342" />
      <rect
        x="5.5"
        y="6"
        width="11"
        height="9.5"
        rx="1.5"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.1"
        fill="none"
      />
      <path
        d="M8.5 17l2 2 2-2"
        stroke="#F4821F"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10h6M8 12.5h4"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function PageHeader({ period }: { period: string }) {
  return (
    <div className="page-header">
      <div>
        <div className="report-label-sm">
          Coeo Solutions — Technology Transformation
        </div>
        <div className="report-title">Executive Program Report</div>
        <div className="report-period">{period}</div>
      </div>
      <div className="bg-white rounded-xl px-4 py-2">
        <img src="/logo.png" alt="COEO" className="h-8 w-auto" />
      </div>
    </div>
  );
}

function PageFooter({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="page-footer">
      <div className="footer-left">
        <strong>Coeo Solutions — Technology Transformation Program</strong>
        <br />
        Confidential — for exec distribution only
      </div>
      <div className="footer-right">
        <span className="footer-page">Page {pageNumber} of 2</span>
        <a
          className="footer-link"
          href="https://coeo-project-hub.vercel.app"
          target="_blank"
          rel="noreferrer"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M6 2l4 4-4 4"
              stroke="#fff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          View Program Hub
        </a>
      </div>
    </div>
  );
}

interface SearchParams {
  from?: string;
  to?: string;
}

export default async function ExecReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const defaultRange = currentIsoWeek();
  const from = params.from ?? defaultRange.from;
  const to = params.to ?? defaultRange.to;
  const todayIso = isoDate(new Date());

  const supabase = await createClient();

  const [
    { data: highlightsRaw },
    { data: projectsRaw },
    { data: allProjectsRaw },
    { data: milestonesRaw },
    { data: meetingsRaw },
    { data: themesRaw },
    { data: narrativeRaw },
  ] = await Promise.all([
    supabase
      .from("coeo_key_highlights")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(4),
    supabase
      .from("coeo_projects")
      .select("*")
      .eq("show_on_report", true)
      .order("sort_order"),
    supabase
      .from("coeo_projects")
      .select("*")
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
  const allProjects = (allProjectsRaw ?? []) as Project[];
  const milestones = (milestonesRaw ?? []) as MilestoneWithProject[];
  const meetings = (meetingsRaw ?? []) as MeetingNote[];
  const themes = (themesRaw ?? []) as ProgramTheme[];
  const narrative = (narrativeRaw ?? null) as ReportNarrative | null;

  const ganttRows = buildGanttRows(projects, milestones, todayIso);
  const allGanttRows = buildGanttRows(allProjects, milestones, todayIso);
  const period = periodLabel(from, to);
  const generatedDate = formatLong(todayIso);

  return (
    <ExecReportShell>
      <style suppressHydrationWarning>{REPORT_CSS}</style>

      <ExecReportControls initialFrom={from} initialTo={to} />

      {/* PAGE 1 */}
      <div className="page">
        <PageHeader period={period} />

        <div className="meta-strip">
          <div className="meta-item">
            Report date<span>{generatedDate}</span>
          </div>
          <div className="meta-item">
            Distribution<span>Exec team</span>
          </div>
        </div>

        <div className="page-body">
          {/* KEY HIGHLIGHTS */}
          <div className="section">
            <div className="section-header">
              {SECTION_ICONS.highlights}
              <div className="section-title">Key highlights</div>
            </div>
            <HighlightsEditor highlights={highlights} />
          </div>

          {/* WORKSTREAM ROADMAP */}
          <div className="section">
            <div className="section-header">
              {SECTION_ICONS.roadmap}
              <div className="section-title">
                Workstream roadmap — {GANTT_YEAR}
              </div>
            </div>
            <GanttEditor
              allProjects={allProjects}
              ganttRows={ganttRows}
              allGanttRows={allGanttRows}
            />
          </div>

          {/* UPCOMING MILESTONES */}
          <div className="section">
            <div className="section-header">
              {SECTION_ICONS.milestones}
              <div className="section-title">Upcoming milestones</div>
            </div>
            <table className="ms-table">
              <tbody>
                {milestones.map((m) => {
                  const pillClass = m.due_date
                    ? MILESTONE_PILL_CLASS[m.status] ?? "tbc"
                    : "tbc";
                  const projectName =
                    m.coeo_projects?.name ?? m.project_name ?? "";
                  return (
                    <tr key={m.id}>
                      <td style={{ width: "64px" }}>
                        {m.due_date ? (
                          <div className="ms-date-badge">
                            <div className="d">{formatBadgeDay(m.due_date)}</div>
                            <div className="m">{formatBadgeMonth(m.due_date)}</div>
                          </div>
                        ) : (
                          <div className="ms-date-badge">
                            <div className="d">—</div>
                            <div className="m">TBC</div>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="ms-name">{m.title}</div>
                        {projectName ? (
                          <div className="ms-proj">{projectName}</div>
                        ) : null}
                      </td>
                      <td style={{ width: "80px", textAlign: "right" }}>
                        <span className={`pill ${pillClass}`}>{m.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <PageFooter pageNumber={1} />
      </div>

      {/* PAGE 2 */}
      <div className="page">
        <PageHeader period={period} />

        <div className="page-body">
          {/* PROGRAM CONTEXT */}
          <div className="section">
            <div className="section-header">
              {SECTION_ICONS.highlights}
              <div className="section-title">Program context</div>
            </div>
            <NarrativeEditor
              themes={themes}
              narrative={narrative}
              weekStart={from}
            />
          </div>

          {/* RECENT MEETINGS */}
          <div className="section">
            <div className="section-header">
              {SECTION_ICONS.meetings}
              <div className="section-title">Recent meetings</div>
            </div>
            <MeetingsEditor meetings={meetings} />
          </div>

          {/* OTHER COMMENTS */}
          <div className="section">
            <div className="section-header">
              {SECTION_ICONS.comments}
              <div className="section-title">Other comments</div>
            </div>
            <CommentsTextEditor narrative={narrative} weekStart={from} />
          </div>
        </div>

        <PageFooter pageNumber={2} />
      </div>
    </ExecReportShell>
  );
}

const REPORT_CSS = `
.exec-report-shell {
  --navy: #0A2342;
  --orange: #F4821F;
  --cream: #F5F0E8;
  --cream-dark: #E8E0D0;
  --text-body: #2C3E50;
  --text-muted: #6B7280;
  --border: #D8D0C4;
  --green: #2D7D46;
  --green-light: #EAF3DE;
  --amber: #BA7517;
  --amber-light: #FAEEDA;
  --red: #A32D2D;
  --red-light: #FCEBEB;
  --blue: #185FA5;
  --blue-light: #E6F1FB;
  --page-w: 794px;
  --page-pad-x: 44px;
  --page-pad-y: 32px;
  background: #e8e4dc;
  padding: 20px;
  min-height: 100vh;
  font-family: var(--font-dm-sans), 'DM Sans', sans-serif;
}
.exec-report-shell *, .exec-report-shell *::before, .exec-report-shell *::after {
  box-sizing: border-box;
}
.exec-report-shell .controls-bar {
  background: var(--navy);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0 auto 20px;
  border-radius: 8px;
  max-width: var(--page-w);
  position: sticky;
  top: 12px;
  z-index: 10;
}
.exec-report-shell .controls-bar label {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.exec-report-shell .controls-bar input[type="date"] {
  font-family: inherit;
  font-size: 12px;
  padding: 5px 9px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 5px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  outline: none;
}
.exec-report-shell .btn {
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.exec-report-shell .btn-update { background: rgba(255,255,255,0.15); color: #fff; }
.exec-report-shell .btn-print {
  background: var(--orange);
  color: #fff;
  margin-left: auto;
  font-size: 13px;
  padding: 7px 20px;
}
.exec-report-shell .page {
  background: #fff;
  width: var(--page-w);
  min-height: 1123px;
  margin: 0 auto 28px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
}
.exec-report-shell .page-header {
  background: var(--navy);
  padding: 22px var(--page-pad-x) 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.exec-report-shell .report-label-sm {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 4px;
}
.exec-report-shell .report-title {
  font-family: inherit;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.exec-report-shell .report-period {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-top: 3px;
}
.exec-report-shell .page-logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: #fff;
  opacity: 0.95;
}
.exec-report-shell .meta-strip {
  background: var(--cream);
  border-bottom: 1px solid var(--border);
  padding: 10px var(--page-pad-x);
  display: flex;
  gap: 28px;
}
.exec-report-shell .meta-item { font-size: 10px; color: var(--text-muted); }
.exec-report-shell .meta-item span {
  color: var(--navy);
  font-weight: 500;
  display: block;
  font-size: 11px;
  margin-top: 1px;
}
.exec-report-shell .page-body {
  padding: var(--page-pad-y) var(--page-pad-x);
  padding-top: 28px;
  padding-bottom: 28px;
  flex: 1;
}
.exec-report-shell .page-footer {
  background: var(--cream);
  border-top: 1px solid var(--border);
  padding: 10px var(--page-pad-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-top: auto;
}
.exec-report-shell .footer-left { font-size: 10px; color: var(--text-muted); line-height: 1.5; }
.exec-report-shell .footer-left strong { color: var(--navy); font-weight: 600; }
.exec-report-shell .footer-right { display: flex; align-items: center; gap: 10px; }
.exec-report-shell .footer-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  background: var(--navy);
  color: #fff;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}
.exec-report-shell .footer-page { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
.exec-report-shell .section { margin-bottom: 32px; padding-top: 28px; }
.exec-report-shell .section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--cream-dark);
}
.exec-report-shell .section-icon { width: 22px; height: 22px; flex-shrink: 0; }
.exec-report-shell .section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--navy);
}
.exec-report-shell .highlights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.exec-report-shell .highlight-card {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 11px 13px;
  position: relative;
}
.exec-report-shell .highlight-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 6px 0 0 6px;
}
.exec-report-shell .highlight-card.green::before  { background: var(--green); }
.exec-report-shell .highlight-card.amber::before  { background: var(--amber); }
.exec-report-shell .highlight-card.blue::before   { background: var(--blue); }
.exec-report-shell .highlight-card.orange::before { background: var(--orange); }
.exec-report-shell .hl-project {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.exec-report-shell .hl-text { font-size: 11px; color: var(--text-body); line-height: 1.5; }
.exec-report-shell .hl-date { font-size: 10px; color: var(--text-muted); margin-top: 5px; }
.exec-report-shell .gantt {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  table-layout: fixed;
}
.exec-report-shell .gantt th {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 4px 0;
  background: var(--cream);
  border-bottom: 1px solid var(--border);
  text-align: center;
}
.exec-report-shell .gantt th.lc { text-align: left; padding-left: 0; width: 148px; }
.exec-report-shell .gantt td {
  padding: 3px 0;
  border-bottom: 1px solid var(--cream-dark);
  vertical-align: middle;
}
.exec-report-shell .gantt tr:last-child td { border-bottom: none; }
.exec-report-shell .gantt td.lc { padding-left: 0; width: 148px; }
.exec-report-shell .g-name { font-weight: 500; color: var(--navy); font-size: 10px; }
.exec-report-shell .g-sub  { font-size: 9px; color: var(--text-muted); }
.exec-report-shell .g-legend { display: flex; gap: 16px; margin-top: 7px; }
.exec-report-shell .g-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--text-muted);
}
.exec-report-shell .l-bar { width: 16px; height: 7px; border-radius: 2px; }
.exec-report-shell .l-dia {
  width: 9px;
  height: 9px;
  transform: rotate(45deg);
  border-radius: 1px;
  flex-shrink: 0;
}
.exec-report-shell .ms-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.exec-report-shell .ms-table td {
  padding: 7px 8px;
  border-bottom: 1px solid var(--cream-dark);
  vertical-align: middle;
}
.exec-report-shell .ms-table tr:last-child td { border-bottom: none; }
.exec-report-shell .ms-date-badge {
  background: var(--cream);
  border-radius: 5px;
  padding: 4px 8px;
  text-align: center;
  white-space: nowrap;
}
.exec-report-shell .ms-date-badge .d {
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  line-height: 1;
}
.exec-report-shell .ms-date-badge .m {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}
.exec-report-shell .ms-name { font-weight: 500; color: var(--navy); font-size: 11px; }
.exec-report-shell .ms-proj { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
.exec-report-shell .pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}
.exec-report-shell .pill.upcoming { background: var(--blue-light);  color: var(--blue); }
.exec-report-shell .pill.at-risk  { background: var(--amber-light); color: var(--amber); }
.exec-report-shell .pill.complete { background: var(--green-light); color: var(--green); }
.exec-report-shell .pill.overdue  { background: var(--red-light);   color: var(--red); }
.exec-report-shell .pill.tbc {
  background: var(--cream);
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.exec-report-shell .meeting-row {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 9px 0;
  border-bottom: 1px solid var(--cream-dark);
}
.exec-report-shell .meeting-row:last-child { border-bottom: none; }
.exec-report-shell .mtg-date {
  flex-shrink: 0;
  width: 52px;
  background: var(--cream);
  border-radius: 5px;
  padding: 5px;
  text-align: center;
}
.exec-report-shell .mtg-date .d {
  font-size: 16px;
  font-weight: 600;
  color: var(--navy);
  line-height: 1;
}
.exec-report-shell .mtg-date .m {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}
.exec-report-shell .mtg-title { font-size: 11px; font-weight: 500; color: var(--navy); margin-bottom: 2px; }
.exec-report-shell .mtg-summary {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.exec-report-shell .mtg-att { font-size: 10px; color: var(--text-muted); margin-top: 3px; }
.exec-report-shell .comments-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.exec-report-shell .comment-card {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 11px 13px;
}
.exec-report-shell .cm-topic { font-size: 11px; font-weight: 600; color: var(--navy); margin-bottom: 5px; }
.exec-report-shell .cm-desc {
  font-size: 10px;
  color: var(--text-body);
  line-height: 1.55;
  margin-bottom: 8px;
}
.exec-report-shell .cm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}
.exec-report-shell .cm-tag {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 99px;
}
.exec-report-shell .cm-tag.blue   { background: var(--blue-light);  color: var(--blue); }
.exec-report-shell .cm-tag.amber  { background: var(--amber-light); color: var(--amber); }
.exec-report-shell .cm-tag.green  { background: var(--green-light); color: var(--green); }
.exec-report-shell .cm-tag.orange { background: #FEF0E4;            color: var(--orange); }
.exec-report-shell .cm-owner { font-size: 10px; color: var(--text-muted); }
.exec-report-shell .cm-owner strong { color: var(--text-body); font-weight: 500; }
@media print {
  .exec-report-shell .controls-bar { display: none !important; }
  .exec-report-shell { background: none; padding: 0; }
  .exec-report-shell .page {
    box-shadow: none;
    margin: 0;
    page-break-after: always;
    width: 100%;
    min-height: 0;
  }
  .exec-report-shell .page:last-child { page-break-after: auto; }
}

.exec-report-shell .narrative-themes-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  width: 100%;
  gap: 6px;
  margin-bottom: 18px;
  align-items: stretch;
}
.exec-report-shell .narrative-theme-pill {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  min-height: 56px;
  width: 100%;
  align-self: stretch;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  padding: 8px 10px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.1s ease, background 0.1s ease;
}
.exec-report-shell .narrative-theme-pill:hover { border-color: var(--text-muted); }
.exec-report-shell .narrative-theme-pill.focused {
  border-color: var(--orange);
  background: #FEF6EC;
}
.exec-report-shell .narrative-theme-pill .pill-code {
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}
.exec-report-shell .narrative-theme-pill.focused .pill-code { color: var(--orange); }
.exec-report-shell .narrative-theme-pill .pill-name {
  font-size: 10px;
  color: var(--navy);
  font-weight: 500;
  line-height: 1.3;
}

.exec-report-shell .narrative-commentary { margin-bottom: 10px; }
.exec-report-shell .narrative-label {
  display: block;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 4px;
}
.exec-report-shell .narrative-commentary-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 11px;
  color: var(--navy);
  font-family: inherit;
  resize: vertical;
  outline: none;
}
.exec-report-shell .narrative-commentary-input:focus { border-color: var(--orange); }

.exec-report-shell .narrative-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.exec-report-shell .narrative-save-btn {
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.exec-report-shell .narrative-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.exec-report-shell .narrative-saved-msg {
  font-size: 10px;
  color: var(--green);
  font-weight: 500;
}

.exec-report-shell:not(.editing) .edit-only { display: none; }
.exec-report-shell.editing .read-only { display: none; }

.exec-report-shell .btn-edit {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.35);
}
.exec-report-shell .btn-edit-active {
  background: var(--orange);
  color: #fff;
  border: none;
}

.exec-report-shell .highlight-card,
.exec-report-shell .comment-card { position: relative; }

.exec-report-shell.editing .card-edit {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.exec-report-shell .card-edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}
.exec-report-shell .card-delete-btn {
  position: absolute;
  top: 4px;
  right: 6px;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}
.exec-report-shell .card-delete-btn:hover { color: var(--red); }

.exec-report-shell .inline-input,
.exec-report-shell .inline-textarea {
  width: 100%;
  border: none;
  border-bottom: 1px dashed transparent;
  background: transparent;
  font-family: inherit;
  color: var(--text-body);
  padding: 2px 0;
  outline: none;
  resize: vertical;
}
.exec-report-shell .inline-input:focus,
.exec-report-shell .inline-textarea:focus { border-bottom-color: var(--orange); }

.exec-report-shell .hl-project-input {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}
.exec-report-shell .hl-headline-input {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-body);
}
.exec-report-shell .hl-body-input,
.exec-report-shell .cm-desc-input {
  font-size: 11px;
  color: var(--text-body);
  line-height: 1.5;
}
.exec-report-shell .hl-date-input {
  font-size: 10px;
  color: var(--text-muted);
  width: auto;
}

.exec-report-shell .cm-topic-input {
  font-size: 11px;
  font-weight: 600;
  color: var(--navy);
}
.exec-report-shell .cm-edit-meta {
  display: flex;
  gap: 8px;
}
.exec-report-shell .cm-tag-input,
.exec-report-shell .cm-colour-select,
.exec-report-shell .cm-owner-input {
  font-size: 10px;
  flex: 1;
  min-width: 0;
}
.exec-report-shell .cm-colour-select {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 6px;
  background: #fff;
  cursor: pointer;
}

.exec-report-shell .card-save-btn {
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.exec-report-shell .card-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.exec-report-shell .card-add-btn {
  border: 1px dashed var(--border);
  border-radius: 6px;
  padding: 11px 13px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
}
.exec-report-shell .card-add-btn:hover {
  border-color: var(--orange);
  color: var(--orange);
}

.exec-report-shell.editing .mtg-edit {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.exec-report-shell .mtg-summary-input {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 11px;
  color: var(--text-body);
  line-height: 1.5;
}

.exec-report-shell .gantt-toggle-cell {
  width: 28px;
  text-align: center;
  padding: 0;
  vertical-align: middle;
}
.exec-report-shell .gantt-toggle-checkbox {
  cursor: pointer;
  width: 14px;
  height: 14px;
  accent-color: var(--navy);
}
.exec-report-shell .gantt-toggle-checkbox:disabled {
  opacity: 0.4;
  cursor: wait;
}
.exec-report-shell .gantt-edit-hint {
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-style: italic;
}

@media print {
  .exec-report-shell .edit-only { display: none !important; }
}
`;

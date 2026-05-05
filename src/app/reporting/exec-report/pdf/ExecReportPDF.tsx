import {
  Document,
  Link,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  KeyHighlight,
  MeetingNote,
  ProgramTheme,
  Project,
  ReportNarrative,
} from "@/lib/types";
import {
  GANTT_YEAR,
  MILESTONE_PILL_CLASS,
  MONTHS,
  NAVY_STATUSES,
  formatBadgeDay,
  formatBadgeMonth,
  formatShort,
  type GanttRow,
  type MilestoneWithProject,
} from "../lib";

// TODO: embed DM Sans for full brand parity with the on-screen report.
// Attempted Font.register with both Google Fonts variable woff2 and Fontsource
// static TTFs (latin-{400,500,600}-normal.ttf); both tripped fontkit
// (@react-pdf/font 4.0.8) during glyph encoding. The PDF therefore renders
// in Helvetica — which is a built-in PDF face that needs no embedding.
// To revisit: ship DM Sans TTFs in /public/fonts/ and Font.register with
// local file paths, which avoids the network/parse path entirely.

const NAVY = "#0A2342";
const ORANGE = "#F4821F";
const CREAM = "#F5F0E8";
const BORDER = "#D8D0C4";
const TEXT_BODY = "#2C3E50";
const TEXT_MUTED = "#6B7280";
const GREEN = "#2D7D46";
const GREEN_LIGHT = "#EAF3DE";
const AMBER = "#BA7517";
const AMBER_LIGHT = "#FAEEDA";
const BLUE = "#185FA5";
const BLUE_LIGHT = "#E6F1FB";
const RED = "#A32D2D";
const RED_LIGHT = "#FCEBEB";
const GREY_BAR = "#B4B2A9";
const WHITE_70 = "rgba(255,255,255,0.7)";
const WHITE_55 = "rgba(255,255,255,0.55)";

const PILL_COLOURS: Record<string, { bg: string; fg: string }> = {
  upcoming: { bg: BLUE_LIGHT, fg: BLUE },
  "at-risk": { bg: AMBER_LIGHT, fg: AMBER },
  complete: { bg: GREEN_LIGHT, fg: GREEN },
  overdue: { bg: RED_LIGHT, fg: RED },
  tbc: { bg: CREAM, fg: TEXT_MUTED },
};

const MEETING_TRUNCATE_CHARS = 300;

function truncateForPdf(s: string): string {
  return s.length > MEETING_TRUNCATE_CHARS
    ? s.slice(0, MEETING_TRUNCATE_CHARS) + "…"
    : s;
}

const styles = StyleSheet.create({
  page: {
    fontSize: 9,
    color: TEXT_BODY,
    backgroundColor: "#ffffff",
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  header: {
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabelSm: {
    fontSize: 7,
    color: WHITE_55,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: 500,
  },
  headerTitle: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: 600,
    marginBottom: 3,
  },
  headerPeriod: {
    fontSize: 8,
    color: WHITE_70,
  },
  headerLogo: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: 600,
    letterSpacing: 1,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 12,
    paddingBottom: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  sectionIcon: {
    width: 14,
    height: 14,
    marginRight: 7,
  },
  sectionTitle: {
    fontSize: 11,
    color: NAVY,
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  highlightCard: {
    width: "48.5%",
    flexDirection: "row",
    backgroundColor: CREAM,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    marginBottom: 7,
  },
  hlAccent: {
    width: 3,
    backgroundColor: ORANGE,
  },
  hlBody: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  hlProject: {
    fontSize: 7,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 3,
  },
  hlBulletList: {
    flexDirection: "column",
    gap: 3,
  },
  hlBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  hlBulletDot: {
    fontSize: 9,
    color: ORANGE,
    lineHeight: 1.4,
  },
  hlBulletText: {
    flex: 1,
    fontSize: 9,
    color: TEXT_BODY,
    lineHeight: 1.4,
  },
  hlDate: {
    fontSize: 7,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  ganttHeaderRow: {
    flexDirection: "row",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  ganttRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFEAE0",
  },
  ganttLabelCol: {
    width: 130,
    paddingRight: 6,
  },
  ganttMonthHead: {
    flex: 1,
    fontSize: 7,
    color: TEXT_MUTED,
    textAlign: "center",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  ganttCell: {
    flex: 1,
    height: 16,
    position: "relative",
    paddingHorizontal: 0,
  },
  ganttBar: {
    height: 8,
    marginTop: 4,
    width: "100%",
  },
  ganttDiamond: {
    position: "absolute",
    top: 3,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    backgroundColor: ORANGE,
  },
  gName: {
    fontSize: 9,
    color: NAVY,
    fontWeight: 500,
  },
  gSub: {
    fontSize: 7,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendBar: {
    width: 16,
    height: 6,
  },
  legendDiamond: {
    width: 7,
    height: 7,
    backgroundColor: ORANGE,
  },
  legendText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  msRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFEAE0",
  },
  dateBadge: {
    width: 44,
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: CREAM,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  dateBadgeDay: {
    fontSize: 13,
    color: NAVY,
    fontWeight: 600,
    lineHeight: 1.1,
  },
  dateBadgeMonth: {
    fontSize: 6.5,
    color: TEXT_MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 1,
  },
  msName: {
    fontSize: 9.5,
    color: NAVY,
    fontWeight: 500,
  },
  msProj: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 1.5,
  },
  msFlex: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  meetingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EFEAE0",
  },
  mtgTitle: {
    fontSize: 10,
    color: NAVY,
    fontWeight: 500,
    marginBottom: 2,
  },
  mtgSummary: {
    fontSize: 9,
    color: TEXT_MUTED,
    lineHeight: 1.4,
  },
  mtgAtt: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 3,
  },
  footer: {
    backgroundColor: CREAM,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 9,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  footerLeftStrong: {
    fontSize: 8,
    color: NAVY,
    fontWeight: 600,
    marginBottom: 2,
  },
  footerLeftSub: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerPage: {
    fontSize: 7,
    color: TEXT_MUTED,
  },
  footerLink: {
    fontSize: 7,
    color: ORANGE,
    fontWeight: 600,
    textDecoration: "none",
  },
  pcGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    marginBottom: 14,
  },
  pcPill: {
    width: "32%",
    marginRight: "2%",
    marginBottom: 5,
    minHeight: 42,
    backgroundColor: CREAM,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
  },
  pcPillFocused: {
    borderLeftWidth: 2,
    borderLeftColor: ORANGE,
  },
  pcPillCode: {
    fontSize: 7,
    color: TEXT_MUTED,
    fontWeight: 600,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  pcPillName: {
    fontSize: 8,
    color: NAVY,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  pcCommentary: {
    fontSize: 9,
    color: TEXT_BODY,
    lineHeight: 1.5,
    marginTop: 2,
  },
  pcCommentsLabel: {
    fontSize: 7,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: TEXT_MUTED,
    fontWeight: 600,
    marginBottom: 2,
  },
});

interface SectionIconProps {
  variant: "highlights" | "roadmap" | "milestones" | "meetings";
}

function SectionIcon({ variant }: SectionIconProps) {
  return (
    <Svg style={styles.sectionIcon} viewBox="0 0 22 22">
      <Rect width="22" height="22" rx="5" fill={NAVY} />
      {variant === "highlights" && (
        <Path
          d="M5.5 7.5h11M5.5 11h11M5.5 14.5h6"
          stroke={ORANGE}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      )}
      {variant === "roadmap" && (
        <>
          <Rect x="4" y="7.5" width="5" height="7" rx="1.5" fill={ORANGE} />
          <Rect
            x="11"
            y="5.5"
            width="7"
            height="4"
            rx="1.5"
            fill="rgba(255,255,255,0.45)"
          />
          <Rect
            x="11"
            y="11.5"
            width="5"
            height="4"
            rx="1.5"
            fill="rgba(255,255,255,0.45)"
          />
        </>
      )}
      {variant === "milestones" && (
        <Path
          d="M11 4l5 5-5 5-5-5z"
          stroke={ORANGE}
          strokeWidth={1.3}
          fill="none"
        />
      )}
      {variant === "meetings" && (
        <>
          <Rect
            x="5.5"
            y="6.5"
            width="11"
            height="10"
            rx="1.5"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1.1}
            fill="none"
          />
          <Path
            d="M8 6.5V5M14 6.5V5"
            stroke={ORANGE}
            strokeWidth={1.1}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

interface HeaderProps {
  periodLabel: string;
}

function PdfHeader({ periodLabel }: HeaderProps) {
  // TODO: replace with embedded white-on-transparent logo asset.
  // public/logo.png is navy and @react-pdf/renderer does not support CSS
  // filter, so a separate white variant (e.g. public/logo-white.png) is
  // required before this can become an <Image>.
  return (
    <View style={styles.header} fixed={false}>
      <View>
        <Text style={styles.headerLabelSm}>
          Coeo Solutions — Technology Transformation
        </Text>
        <Text style={styles.headerTitle}>Executive Program Report</Text>
        <Text style={styles.headerPeriod}>{periodLabel}</Text>
      </View>
      <Text style={styles.headerLogo}>COEO</Text>
    </View>
  );
}

interface FooterProps {
  pageNumber: number;
}

function PdfFooter({ pageNumber }: FooterProps) {
  return (
    <View style={styles.footer}>
      <View>
        <Text style={styles.footerLeftStrong}>
          Coeo Solutions — Technology Transformation Program
        </Text>
        <Text style={styles.footerLeftSub}>
          Confidential — for exec distribution only
        </Text>
      </View>
      <View style={styles.footerRight}>
        <Text style={styles.footerPage}>Page {pageNumber} of 2</Text>
        <Link
          src="https://coeo-project-hub.vercel.app"
          style={styles.footerLink}
        >
          View Program Hub →
        </Link>
      </View>
    </View>
  );
}

interface SectionTitleProps {
  icon: SectionIconProps["variant"];
  label: string;
}

function SectionTitle({ icon, label }: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <SectionIcon variant={icon} />
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

interface HighlightsGridProps {
  highlights: KeyHighlight[];
}

function HighlightsGrid({ highlights }: HighlightsGridProps) {
  const sorted = [...highlights].sort((a, b) => a.sort_order - b.sort_order);
  return (
    <View style={styles.highlightsGrid}>
      {sorted.map((h) => {
        const bullets = (h.body ?? "")
          .split("•")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s !== "…" && s !== "...");
        return (
          <View key={h.id} style={styles.highlightCard}>
            <View style={styles.hlAccent} />
            <View style={styles.hlBody}>
              <Text style={styles.hlProject}>{h.category}</Text>
              <View style={styles.hlBulletList}>
                {bullets.map((bullet, i) => (
                  <View key={i} style={styles.hlBulletRow}>
                    <Text style={styles.hlBulletDot}>•</Text>
                    <Text style={styles.hlBulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
              {h.date ? (
                <Text style={styles.hlDate}>{formatShort(h.date)}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

interface GanttSectionProps {
  rows: GanttRow[];
}

function GanttSection({ rows }: GanttSectionProps) {
  return (
    <View>
      <View style={styles.ganttHeaderRow}>
        <View style={styles.ganttLabelCol}>
          <Text style={[styles.gSub, { fontWeight: 600, color: TEXT_MUTED }]}>
            WORKSTREAM
          </Text>
        </View>
        {MONTHS.map((m) => (
          <Text key={m} style={styles.ganttMonthHead}>
            {m}
          </Text>
        ))}
      </View>
      {rows.map((row) => {
        const navy = NAVY_STATUSES.has(row.project.status);
        const barColour = navy ? NAVY : GREY_BAR;
        return (
          <View key={row.project.id} style={styles.ganttRow}>
            <View style={styles.ganttLabelCol}>
              <Text style={styles.gName}>{row.project.name}</Text>
              {row.project.vendor ? (
                <Text style={styles.gSub}>{row.project.vendor}</Text>
              ) : null}
            </View>
            {MONTHS.map((_, m) => {
              const inSpan = m >= row.startMonth && m <= row.endMonth;
              const isFirst = m === row.startMonth;
              const isLast = m === row.endMonth;
              return (
                <View key={m} style={styles.ganttCell}>
                  {inSpan ? (
                    <View
                      style={[
                        styles.ganttBar,
                        {
                          backgroundColor: barColour,
                          borderTopLeftRadius: isFirst ? 2 : 0,
                          borderBottomLeftRadius: isFirst ? 2 : 0,
                          borderTopRightRadius: isLast ? 2 : 0,
                          borderBottomRightRadius: isLast ? 2 : 0,
                        },
                      ]}
                    />
                  ) : null}
                  {row.msMonth === m ? (
                    <View
                      style={[
                        styles.ganttDiamond,
                        { transform: "rotate(45deg)" },
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        );
      })}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: NAVY }]} />
          <Text style={styles.legendText}>In progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: GREY_BAR }]} />
          <Text style={styles.legendText}>Not started / TBD</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDiamond, { transform: "rotate(45deg)" }]}
          />
          <Text style={styles.legendText}>Milestone</Text>
        </View>
      </View>
    </View>
  );
}

function DateBadge({ date }: { date: string | null | undefined }) {
  return (
    <View style={styles.dateBadge}>
      {date ? (
        <>
          <Text style={styles.dateBadgeDay}>{formatBadgeDay(date)}</Text>
          <Text style={styles.dateBadgeMonth}>{formatBadgeMonth(date)}</Text>
        </>
      ) : (
        <>
          <Text style={styles.dateBadgeDay}>—</Text>
          <Text style={styles.dateBadgeMonth}>TBC</Text>
        </>
      )}
    </View>
  );
}

interface MilestonesListProps {
  milestones: MilestoneWithProject[];
}

function MilestonesList({ milestones }: MilestonesListProps) {
  return (
    <View>
      {milestones.map((m) => {
        const pillKey = m.due_date
          ? MILESTONE_PILL_CLASS[m.status] ?? "tbc"
          : "tbc";
        const pillColour = PILL_COLOURS[pillKey] ?? PILL_COLOURS.tbc;
        const projectName = m.coeo_projects?.name ?? m.project_name ?? "";
        return (
          <View key={m.id} style={styles.msRow}>
            <DateBadge date={m.due_date} />
            <View style={styles.msFlex}>
              <Text style={styles.msName}>{m.title}</Text>
              {projectName ? (
                <Text style={styles.msProj}>{projectName}</Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.pill,
                { backgroundColor: pillColour.bg, color: pillColour.fg },
              ]}
            >
              {m.status}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

interface MeetingsListProps {
  meetings: MeetingNote[];
}

function MeetingsList({ meetings }: MeetingsListProps) {
  return (
    <View>
      {meetings.map((mtg) => {
        const summary =
          (mtg.summary?.trim() || mtg.notes?.trim() || "").length > 0
            ? truncateForPdf(mtg.summary?.trim() || mtg.notes!.trim())
            : "";
        return (
          <View key={mtg.id} style={styles.meetingRow}>
            <DateBadge date={mtg.date} />
            <View style={styles.msFlex}>
              <Text style={styles.mtgTitle}>{mtg.title}</Text>
              {summary ? (
                <Text style={styles.mtgSummary}>{summary}</Text>
              ) : null}
              {mtg.attendees ? (
                <Text style={styles.mtgAtt}>Attendees: {mtg.attendees}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export interface ExecReportPDFProps {
  highlights: KeyHighlight[];
  projects: Project[];
  milestones: MilestoneWithProject[];
  meetings: MeetingNote[];
  themes: ProgramTheme[];
  narrative: ReportNarrative | null;
  ganttRows: GanttRow[];
  periodFrom: string;
  periodTo: string;
  reportDate: string;
  periodLabel: string;
}

interface ProgramContextProps {
  themes: ProgramTheme[];
  narrative: ReportNarrative | null;
}

function ProgramContext({ themes, narrative }: ProgramContextProps) {
  const focused = narrative?.focused_theme_codes ?? [];
  const commentary = narrative?.commentary?.trim();
  const commentsText = narrative?.comments_text?.trim();

  return (
    <View>
      <View style={styles.pcGrid}>
        {themes.map((t) => {
          const isFocused = focused.includes(t.code);
          return (
            <View
              key={t.code}
              style={[styles.pcPill, isFocused ? styles.pcPillFocused : {}]}
            >
              <Text
                style={[
                  styles.pcPillCode,
                  isFocused ? { color: ORANGE } : {},
                ]}
              >
                {t.code}
              </Text>
              <Text style={styles.pcPillName}>{t.title}</Text>
            </View>
          );
        })}
      </View>

      {commentary ? (
        <Text style={styles.pcCommentary}>{commentary}</Text>
      ) : null}

      {commentsText ? (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.pcCommentsLabel}>Other comments</Text>
          <Text style={styles.pcCommentary}>{commentsText}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ExecReportPDF({
  highlights,
  milestones,
  meetings,
  themes,
  narrative,
  ganttRows,
  periodLabel,
}: ExecReportPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <PdfHeader periodLabel={periodLabel} />
        <View style={styles.body}>
          <View style={styles.section}>
            <SectionTitle icon="highlights" label="Key highlights" />
            <HighlightsGrid highlights={highlights} />
          </View>
          <View style={styles.section}>
            <SectionTitle
              icon="roadmap"
              label={`Workstream roadmap — ${GANTT_YEAR}`}
            />
            <GanttSection rows={ganttRows} />
          </View>
          <View style={styles.section} wrap={false}>
            <SectionTitle icon="milestones" label="Upcoming milestones" />
            <MilestonesList milestones={milestones} />
          </View>
        </View>
        <PdfFooter pageNumber={1} />
      </Page>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <PdfHeader periodLabel={periodLabel} />
        <View style={styles.body}>
          <View style={styles.section}>
            <SectionTitle icon="highlights" label="Program context" />
            <ProgramContext themes={themes} narrative={narrative} />
          </View>
          <View style={styles.section}>
            <SectionTitle icon="meetings" label="Recent meetings" />
            <MeetingsList meetings={meetings} />
          </View>
        </View>
        <PdfFooter pageNumber={2} />
      </Page>
    </Document>
  );
}

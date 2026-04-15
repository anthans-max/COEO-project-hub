import Link from "next/link";
import type { Project, ProjectPhase, Milestone } from "@/lib/types";

const quarters = [
  { label: "Q1 2026", start: new Date("2026-01-01"), end: new Date("2026-03-31") },
  { label: "Q2 2026", start: new Date("2026-04-01"), end: new Date("2026-06-30") },
  { label: "Q3 2026", start: new Date("2026-07-01"), end: new Date("2026-09-30") },
  { label: "Q4 2026", start: new Date("2026-10-01"), end: new Date("2026-12-31") },
];

const timelineStart = quarters[0].start.getTime();
const timelineEnd = quarters[quarters.length - 1].end.getTime();
const timelineRange = timelineEnd - timelineStart;

function dateToPercent(date: string | Date): number {
  const d = new Date(date).getTime();
  return Math.max(0, Math.min(100, ((d - timelineStart) / timelineRange) * 100));
}

interface Props {
  projects: Project[];
  phases: ProjectPhase[];
  milestones: Milestone[];
}

export function DashboardRoadmap({ projects, phases, milestones }: Props) {
  const todayPct = dateToPercent(new Date());

  return (
    <div className="border border-border rounded-[10px] overflow-hidden bg-white">
      <div className="grid grid-cols-[130px_1fr] bg-cream border-b border-border">
        <div className="px-3 py-2 text-[10px] font-medium text-text-muted uppercase tracking-[0.05em]">Project</div>
        <div className="grid grid-cols-4">
          {quarters.map((q, i) => (
            <div
              key={q.label}
              className="py-2 text-[11px] font-medium text-text-muted text-center"
              style={{ borderLeft: i === 0 ? undefined : "1px solid #E8E2D9" }}
            >
              {q.label}
            </div>
          ))}
        </div>
      </div>

      {projects.map((project) => {
        const projPhases = phases.filter((p) => p.project_id === project.id && p.start_date && p.end_date);
        const projMilestones = milestones.filter((m) => m.project_id === project.id && m.due_date);

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="grid grid-cols-[130px_1fr] border-b border-border last:border-b-0 items-center min-h-[36px] group"
          >
            <div className="px-3 py-1 text-[12px] font-medium text-primary truncate group-hover:text-accent transition-colors">
              {project.name}
            </div>
            <div className="relative h-[30px]">
              {[25, 50, 75].map((left) => (
                <div key={left} className="absolute top-0 bottom-0 w-px bg-border" style={{ left: `${left}%` }} />
              ))}

              {projPhases.map((ph) => {
                const left = dateToPercent(ph.start_date!);
                const right = dateToPercent(ph.end_date!);
                const width = right - left;
                if (width <= 0) return null;
                const isInProgress = ph.status === "in_progress";
                return (
                  <div
                    key={ph.id}
                    className="absolute h-[18px] top-[6px] rounded-[4px] text-[9px] font-medium flex items-center px-1.5 overflow-hidden whitespace-nowrap"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: isInProgress ? "#0A2342" : "#C8C3BA",
                      color: isInProgress ? "white" : "#8A7E6E",
                    }}
                  >
                    {ph.name}
                  </div>
                );
              })}

              {projMilestones.map((ms) => (
                <div
                  key={ms.id}
                  className="absolute w-[7px] h-[7px] bg-accent rotate-45 z-[2]"
                  style={{ left: `calc(${dateToPercent(ms.due_date!)}% - 3.5px)`, top: "11px" }}
                  title={ms.title}
                />
              ))}

              <div
                className="absolute top-0 bottom-0 w-[1.5px] bg-accent opacity-50 z-[1] pointer-events-none"
                style={{ left: `${todayPct}%` }}
              />
            </div>
          </Link>
        );
      })}

      <div className="flex gap-3 px-3 py-1.5 border-t border-border text-[10px] text-text-muted items-center">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-[2px] bg-primary" /> In progress
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-[2px]" style={{ background: "#C8C3BA" }} /> Upcoming
        </div>
        <div className="flex items-center gap-1">
          <span className="w-[5px] h-[5px] bg-accent rotate-45" /> Milestone
        </div>
      </div>
    </div>
  );
}

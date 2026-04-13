"use client";

import { useState } from "react";
import { GANTT_BAR_COLORS } from "@/lib/constants";
import type { Project, Milestone } from "@/lib/types";

interface Props {
  projects: Project[];
  milestones: Milestone[];
}

// Quarter boundaries for 2026
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

function todayPercent(): number {
  return dateToPercent(new Date());
}

export function GanttChart({ projects, milestones }: Props) {
  const [tooltip, setTooltip] = useState<{ project: Project; x: number; y: number } | null>(null);

  const todayPct = todayPercent();

  return (
    <div className="border border-border rounded-card overflow-hidden bg-white">
      {/* Quarter headers */}
      <div className="flex">
        <div className="w-[172px] min-w-[172px] bg-cream border-b border-border border-r border-r-border px-4 py-[7px]">
          <span className="text-[10px] font-semibold text-text-secondary tracking-[0.06em] uppercase">Project</span>
        </div>
        <div className="flex-1 flex">
          {quarters.map((q, i) => (
            <div
              key={q.label}
              className="flex-1 text-[10px] font-semibold text-text-secondary text-center border-l border-border py-[7px] tracking-[0.06em] uppercase bg-cream border-b border-b-border"
              style={{ borderLeft: i === 0 ? "none" : undefined }}
            >
              {q.label}
            </div>
          ))}
        </div>
      </div>

      {/* Project rows */}
      {projects.map((project) => {
        const barColor = GANTT_BAR_COLORS[project.status] || "#8A7E6E";
        const hasRange = project.start_date && project.end_date;
        const left = hasRange ? dateToPercent(project.start_date!) : 0;
        const right = hasRange ? dateToPercent(project.end_date!) : 0;
        const width = right - left;

        // Milestones for this project
        const projectMilestones = milestones.filter((m) => m.project_id === project.id && m.due_date);

        return (
          <div key={project.id} className="flex items-center min-h-[42px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]">
            {/* Label */}
            <div className="w-[172px] min-w-[172px] px-4 py-2 border-r border-border">
              <div className="text-[12px] font-medium text-text-primary leading-tight">{project.name}</div>
              <div className="text-[10px] text-text-muted font-normal">{project.owner}</div>
            </div>

            {/* Track */}
            <div className="flex-1 relative h-[42px] flex items-center">
              {/* Quarter dividers */}
              {quarters.map((_, i) => (
                i > 0 && <div key={i} className="absolute top-0 bottom-0 border-l border-border" style={{ left: `${(i / 4) * 100}%` }} />
              ))}

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-[1.5px] bg-accent opacity-60 pointer-events-none z-10"
                style={{ left: `${todayPct}%` }}
              />

              {/* Project bar */}
              {hasRange && width > 0 && (
                <div
                  className="absolute h-[18px] rounded flex items-center px-2 text-[10px] font-semibold text-white overflow-hidden whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: barColor,
                  }}
                  onMouseEnter={(e) => setTooltip({ project, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {width > 8 && project.name}
                </div>
              )}

              {/* Milestone diamonds */}
              {projectMilestones.map((ms) => {
                const msPct = dateToPercent(ms.due_date!);
                return (
                  <div
                    key={ms.id}
                    className="absolute flex items-center justify-center w-5 h-[42px] cursor-pointer z-20"
                    style={{ left: `calc(${msPct}% - 10px)` }}
                    title={ms.title}
                  >
                    <div className="w-[9px] h-[9px] rotate-45 bg-accent border-[1.5px] border-white" />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-primary text-white text-[10px] font-medium px-2 py-1 rounded-[5px] whitespace-nowrap z-50 pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.project.name} · {tooltip.project.owner} · {tooltip.project.status}
        </div>
      )}
    </div>
  );
}

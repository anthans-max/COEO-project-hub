"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { useEditMode } from "./ExecReportShell";
import { MONTHS, NAVY_STATUSES, type GanttRow } from "./lib";
import type { Project } from "@/lib/types";

interface GanttEditorProps {
  allProjects: Project[];
  ganttRows: GanttRow[];
  allGanttRows: GanttRow[];
}

function GanttBar({
  startMonth,
  endMonth,
  month,
  navy,
}: {
  startMonth: number;
  endMonth: number;
  month: number;
  navy: boolean;
}) {
  const inSpan = month >= startMonth && month <= endMonth;
  if (!inSpan) return null;
  const isFirst = month === startMonth;
  const isLast = month === endMonth;
  const radius =
    isFirst && isLast
      ? "3px"
      : isFirst
      ? "3px 0 0 3px"
      : isLast
      ? "0 3px 3px 0"
      : "0";
  return (
    <div
      style={{
        position: "absolute",
        top: "6px",
        height: "12px",
        background: navy ? "#0A2342" : "#B4B2A9",
        left: isFirst ? "3px" : "0",
        right: isLast ? "3px" : "0",
        borderRadius: radius,
      }}
    />
  );
}

function GanttDiamond() {
  return (
    <div
      style={{
        position: "absolute",
        top: "4px",
        left: "50%",
        marginLeft: "-7px",
        width: "14px",
        height: "14px",
        background: "#F4821F",
        transform: "rotate(45deg)",
        borderRadius: "2px",
        zIndex: 2,
      }}
    />
  );
}

function GanttMonthCells({ row }: { row: GanttRow | null }) {
  const navy = row ? NAVY_STATUSES.has(row.project.status) : false;
  return (
    <>
      {MONTHS.map((_, m) => (
        <td
          key={m}
          style={{
            padding: "2px 1px",
            position: "relative",
            height: "24px",
          }}
        >
          {row ? (
            <>
              <GanttBar
                startMonth={row.startMonth}
                endMonth={row.endMonth}
                month={m}
                navy={navy}
              />
              {row.msMonth === m ? <GanttDiamond /> : null}
            </>
          ) : null}
        </td>
      ))}
    </>
  );
}

export function GanttEditor({
  allProjects,
  ganttRows,
  allGanttRows,
}: GanttEditorProps) {
  const { isEditing } = useEditMode();
  const toast = useToast();
  const [visibleIds, setVisibleIds] = useState<Set<string>>(
    () =>
      new Set(allProjects.filter((p) => p.show_on_report).map((p) => p.id))
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setVisibleIds(
      new Set(allProjects.filter((p) => p.show_on_report).map((p) => p.id))
    );
  }, [allProjects]);

  const editRowMap = useMemo(
    () => new Map(allGanttRows.map((r) => [r.project.id, r])),
    [allGanttRows]
  );

  const toggle = async (id: string) => {
    const wasVisible = visibleIds.has(id);
    const next = !wasVisible;
    setVisibleIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
    setTogglingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_projects")
      .update({ show_on_report: next })
      .eq("id", id);
    setTogglingId(null);
    if (error) {
      setVisibleIds((prev) => {
        const s = new Set(prev);
        if (wasVisible) s.add(id);
        else s.delete(id);
        return s;
      });
      toast.error("Failed to update roadmap visibility");
    }
  };

  return (
    <div>
      <div className="gantt-edit-hint edit-only">
        Check or uncheck projects to show or hide them on the roadmap.
      </div>
      <table className="gantt">
        <thead>
          <tr>
            {isEditing ? <th className="gantt-toggle-cell" /> : null}
            <th className="lc">Workstream</th>
            {MONTHS.map((m) => (
              <th key={m}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEditing
            ? allProjects.map((project) => {
                const row = editRowMap.get(project.id) ?? null;
                const checked = visibleIds.has(project.id);
                return (
                  <tr key={project.id}>
                    <td className="gantt-toggle-cell">
                      <input
                        type="checkbox"
                        className="gantt-toggle-checkbox"
                        checked={checked}
                        disabled={togglingId === project.id}
                        onChange={() => toggle(project.id)}
                        aria-label={`Show ${project.name} on roadmap`}
                      />
                    </td>
                    <td className="lc">
                      <div className="g-name">{project.name}</div>
                      {project.vendor ? (
                        <div className="g-sub">{project.vendor}</div>
                      ) : null}
                    </td>
                    <GanttMonthCells row={row} />
                  </tr>
                );
              })
            : ganttRows.map((row) => (
                <tr key={row.project.id}>
                  <td className="lc">
                    <div className="g-name">{row.project.name}</div>
                    {row.project.vendor ? (
                      <div className="g-sub">{row.project.vendor}</div>
                    ) : null}
                  </td>
                  <GanttMonthCells row={row} />
                </tr>
              ))}
        </tbody>
      </table>
      <div className="g-legend">
        <div className="g-legend-item">
          <div className="l-bar" style={{ background: "#0A2342" }} />
          In progress
        </div>
        <div className="g-legend-item">
          <div className="l-bar" style={{ background: "#B4B2A9" }} />
          Not started / TBD
        </div>
        <div className="g-legend-item">
          <div className="l-dia" style={{ background: "#F4821F" }} />
          Milestone
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addMonths, addWeeks, format, startOfMonth, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { useProjectPhases } from "@/lib/hooks/use-project-phases";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { GanttBar } from "./gantt-bar";
import { GanttMilestone } from "./gantt-milestone";
import { AddPhaseDialog } from "./add-phase-dialog";
import type { Milestone, ProjectPhase } from "@/lib/types";

interface Props {
  projectId: string;
  initialPhases: ProjectPhase[];
  initialMilestones: Milestone[];
}

type Zoom = "quarter" | "month";

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ProjectGantt({ projectId, initialPhases, initialMilestones }: Props) {
  const [phases, setPhases] = useProjectPhases(initialPhases);
  const [milestones] = useRealtime<Milestone>("coeo_milestones", initialMilestones);
  const projectPhases = phases.filter((p) => p.project_id === projectId).sort((a, b) => a.sort_order - b.sort_order);
  const projectMilestones = milestones.filter((m) => m.project_id === projectId);

  const [zoom, setZoom] = useState<Zoom>("quarter");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ProjectPhase | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const trackRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const { rangeStart, rangeEnd, columns, groupHeaders } = useMemo(() => {
    // Use a deterministic anchor for SSR so server and client first render match.
    const today = mounted ? new Date() : new Date(2026, 3, 1);
    if (zoom === "quarter") {
      // Full calendar year of the current year: Q1–Q4, 12 month columns.
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear() + 1, 0, 1);
      const cols = Array.from({ length: 12 }, (_, i) => {
        const d = addMonths(start, i);
        return { date: d, label: format(d, "MMM") };
      });
      const groups = Array.from({ length: 4 }, (_, q) => ({
        label: `Q${q + 1} ${today.getFullYear()}`,
        span: 3,
      }));
      return { rangeStart: start, rangeEnd: end, columns: cols, groupHeaders: groups };
    } else {
      // 6 months centered around current month; week columns grouped by month.
      const monthStart = startOfMonth(addMonths(today, -2));
      const monthEnd = addMonths(monthStart, 6);
      // Generate week columns that fall within [monthStart, monthEnd).
      const firstWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
      const cols: { date: Date; label: string }[] = [];
      let cursor = firstWeek;
      while (cursor < monthEnd) {
        cols.push({ date: cursor, label: format(cursor, "MMM d") });
        cursor = addWeeks(cursor, 1);
      }
      const groups = Array.from({ length: 6 }, (_, i) => {
        const monthDate = addMonths(monthStart, i);
        const nextMonth = addMonths(monthDate, 1);
        const span = cols.filter(
          (c) => c.date >= monthDate && c.date < nextMonth
        ).length;
        return { label: format(monthDate, "MMM yyyy"), span };
      });
      // rangeStart/End drive bar positioning — use month boundaries, not week boundaries.
      return { rangeStart: monthStart, rangeEnd: monthEnd, columns: cols, groupHeaders: groups };
    }
  }, [zoom, mounted]);

  const totalMs = rangeEnd.getTime() - rangeStart.getTime();
  const dateToPct = (d: Date) => ((d.getTime() - rangeStart.getTime()) / totalMs) * 100;
  const todayPct = mounted ? dateToPct(new Date()) : -1;

  const setTrackRef = (phaseId: string) => (el: HTMLDivElement | null) => {
    if (el) trackRefs.current.set(phaseId, el);
    else trackRefs.current.delete(phaseId);
  };

  const handleDragUpdate = (id: string, start: string, end: string) => {
    setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, start_date: start, end_date: end } : p)));
  };

  const handleDragEnd = async (id: string) => {
    const phase = phases.find((p) => p.id === id);
    if (!phase) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_project_phases")
      .update({ start_date: phase.start_date, end_date: phase.end_date })
      .eq("id", id);
    if (error) toast.error("Failed to save phase dates");
  };

  const handleDeletePhase = async () => {
    if (!deleteId) return;
    const original = phases.find((p) => p.id === deleteId);
    setPhases((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    setEditing(null);
    const supabase = createClient();
    const { error } = await supabase.from("coeo_project_phases").delete().eq("id", deleteId);
    if (error) {
      if (original) setPhases((prev) => [...prev, original]);
      toast.error("Failed to delete phase");
    }
  };

  const handleAdd = (p: ProjectPhase) => setPhases((prev) => [...prev, p]);
  const handleUpdate = (p: ProjectPhase) => setPhases((prev) => prev.map((x) => (x.id === p.id ? p : x)));

  const showEmpty = projectPhases.length === 0;

  return (
    <>
      <Card className="bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="text-[12px] font-semibold text-primary tracking-[0.07em] uppercase">
            Project timeline
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <ZoomPill active={zoom === "quarter"} onClick={() => setZoom("quarter")}>
                Quarter
              </ZoomPill>
              <ZoomPill active={zoom === "month"} onClick={() => setZoom("month")}>
                Month
              </ZoomPill>
            </div>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              + Add phase
            </Button>
          </div>
        </div>

        {/* Header row — top tier (quarters / months) */}
        <div className="flex bg-cream border-b border-border">
          <div className="w-[140px] shrink-0 px-4 py-2 text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase border-r border-border flex items-end">
            Phase
          </div>
          <div
            className="flex-1 grid"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(${zoom === "month" ? 42 : 56}px, 1fr))` }}
          >
            {groupHeaders.map((g, i) => (
              <div
                key={i}
                className="px-2 py-2 text-[11px] font-semibold text-primary tracking-[0.07em] uppercase border-r border-border last:border-r-0 text-center"
                style={{ gridColumn: `span ${g.span}` }}
              >
                {g.label}
              </div>
            ))}
          </div>
        </div>
        {/* Header row — bottom tier (months / weeks) */}
        <div className="flex bg-cream border-b border-border">
          <div className="w-[140px] shrink-0 border-r border-border" />
          <div
            className="flex-1 grid"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(${zoom === "month" ? 42 : 56}px, 1fr))` }}
          >
            {columns.map((c, i) => (
              <div
                key={i}
                className="px-2 py-[6px] text-[10px] font-medium text-text-secondary tracking-[0.05em] border-r border-border last:border-r-0 text-center"
              >
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* Milestones strip */}
        {!showEmpty && projectMilestones.length > 0 && (
          <div className="flex border-b border-border">
            <div className="w-[140px] shrink-0 px-4 py-1 text-[10px] text-text-muted border-r border-border">
              Milestones
            </div>
            <div className="flex-1 relative" style={{ height: 20 }}>
              {projectMilestones.map((m) => {
                if (!m.due_date) return null;
                const pct = dateToPct(parseDate(m.due_date));
                if (pct < 0 || pct > 100) return null;
                return <GanttMilestone key={m.id} milestone={m} leftPct={pct} />;
              })}
            </div>
          </div>
        )}

        {/* Body */}
        {showEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <div className="text-[14px] font-medium text-primary">No phases yet</div>
            <div className="text-[12px] text-text-muted">
              Add a phase to start building your project timeline
            </div>
            <div className="mt-2">
              <Button size="sm" onClick={() => setShowAdd(true)}>
                + Add phase
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {projectPhases.map((phase) => (
              <div key={phase.id} className="flex border-b border-border last:border-b-0" style={{ height: 44 }}>
                <div className="w-[140px] shrink-0 px-4 py-2 border-r border-border flex flex-col justify-center">
                  <div className="text-[12px] font-medium text-primary truncate">{phase.name}</div>
                  {phase.description && (
                    <div className="text-[10px] text-text-muted truncate">{phase.description}</div>
                  )}
                </div>
                <div
                  ref={setTrackRef(phase.id)}
                  className="flex-1 relative"
                >
                  {columns.map((c, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-border"
                      style={{ left: `${dateToPct(c.date)}%` }}
                    />
                  ))}
                  <GanttBar
                    phase={phase}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    getTrackEl={() => trackRefs.current.get(phase.id) ?? null}
                    onDragUpdate={handleDragUpdate}
                    onDragEnd={handleDragEnd}
                    onClick={(p) => setEditing(p)}
                  />
                </div>
              </div>
            ))}
            {/* Today line — overlay the track-only area (after 140px label column) */}
            {todayPct >= 0 && todayPct <= 100 && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: 140, right: 0 }}
              >
                <div
                  className="absolute top-0 bottom-0"
                  style={{ left: `${todayPct}%` }}
                >
                  <div className="absolute top-0 bottom-0 w-[1.5px] bg-accent/50 -translate-x-1/2" />
                  <div className="absolute top-0 -translate-x-1/2 bg-accent text-white text-[8px] font-medium px-1.5 py-[1px] rounded-sm">
                    Today
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-2 border-t border-border text-[10px] text-text-secondary">
          <LegendSwatch color="#27AE60" label="Completed" />
          <LegendSwatch color="#0A2342" label="In progress" />
          <LegendSwatch color="#C8C3BA" label="Upcoming" />
          <div className="flex items-center gap-1.5">
            <div className="w-[10px] h-[10px] rotate-45 bg-accent" />
            <span>Milestone</span>
          </div>
          <span className="ml-auto opacity-70">Drag bar edges to adjust dates</span>
        </div>
      </Card>

      <AddPhaseDialog
        open={showAdd}
        projectId={projectId}
        onClose={() => setShowAdd(false)}
        onAdd={handleAdd}
      />

      <AddPhaseDialog
        open={!!editing}
        projectId={projectId}
        phase={editing}
        onClose={() => setEditing(null)}
        onUpdate={handleUpdate}
        onDelete={(id) => {
          setEditing(null);
          setDeleteId(id);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete phase"
        message="Are you sure you want to delete this phase?"
        onConfirm={handleDeletePhase}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function ZoomPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-[3px] text-[10px] font-medium rounded-pill border transition-colors ${
        active
          ? "bg-primary text-white border-primary"
          : "bg-white text-primary border-border hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-[10px] h-[10px] rounded-sm" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

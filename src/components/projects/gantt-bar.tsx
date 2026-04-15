"use client";

import { useRef, useState } from "react";
import { addDays, differenceInDays, format, startOfWeek } from "date-fns";
import type { ProjectPhase } from "@/lib/types";

interface Props {
  phase: ProjectPhase;
  rangeStart: Date;
  rangeEnd: Date;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onDragUpdate: (id: string, start: string, end: string) => void;
  onDragEnd: (id: string, start: string, end: string) => void;
  onClick: (phase: ProjectPhase) => void;
}

type DragMode = "move" | "left" | "right";

const statusStyles: Record<ProjectPhase["status"], { bg: string; text: string }> = {
  completed: { bg: "#27AE60", text: "#FFFFFF" },
  in_progress: { bg: "#0A2342", text: "#FFFFFF" },
  upcoming: { bg: "#C8C3BA", text: "#5A5248" },
  at_risk: { bg: "#E2A300", text: "#0A2342" },
};

function parseDate(s: string): Date {
  // Parse YYYY-MM-DD as local-date to avoid TZ drift
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function GanttBar({
  phase,
  rangeStart,
  rangeEnd,
  trackRef,
  onDragUpdate,
  onDragEnd,
  onClick,
}: Props) {
  const [hover, setHover] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startIsoStart: string;
    startIsoEnd: string;
    moved: boolean;
  } | null>(null);

  if (!phase.start_date || !phase.end_date) return null;

  const start = parseDate(phase.start_date);
  const end = parseDate(phase.end_date);
  const totalMs = rangeEnd.getTime() - rangeStart.getTime();
  const startFrac = (start.getTime() - rangeStart.getTime()) / totalMs;
  const endFrac = (end.getTime() - rangeStart.getTime()) / totalMs;
  const leftPct = Math.max(0, Math.min(1, startFrac)) * 100;
  const rightPct = Math.max(0, Math.min(1, endFrac)) * 100;
  const widthPct = Math.max(0.5, rightPct - leftPct);

  const style = statusStyles[phase.status];

  const handlePointerDown = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode,
      startX: e.clientX,
      startIsoStart: phase.start_date!,
      startIsoEnd: phase.end_date!,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || !track) return;
    const deltaPx = e.clientX - drag.startX;
    if (Math.abs(deltaPx) > 3) drag.moved = true;
    const trackWidth = track.getBoundingClientRect().width;
    if (trackWidth <= 0) return;
    const totalDays = differenceInDays(rangeEnd, rangeStart);
    const deltaDays = Math.round((deltaPx / trackWidth) * totalDays);

    let newStart = parseDate(drag.startIsoStart);
    let newEnd = parseDate(drag.startIsoEnd);

    if (drag.mode === "move") {
      newStart = addDays(newStart, deltaDays);
      newEnd = addDays(newEnd, deltaDays);
    } else if (drag.mode === "left") {
      newStart = addDays(newStart, deltaDays);
      if (newStart > newEnd) newStart = newEnd;
    } else {
      newEnd = addDays(newEnd, deltaDays);
      if (newEnd < newStart) newEnd = newStart;
    }

    newStart = startOfWeek(newStart, { weekStartsOn: 1 });
    newEnd = startOfWeek(newEnd, { weekStartsOn: 1 });

    const isoStart = toISODate(newStart);
    const isoEnd = toISODate(newEnd);
    onDragUpdate(phase.id, isoStart, isoEnd);

    const tipDate =
      drag.mode === "left" ? newStart : drag.mode === "right" ? newEnd : newStart;
    setTooltip(format(tipDate, "MMM d, yyyy"));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (drag.moved) {
      onDragEnd(phase.id, phase.start_date!, phase.end_date!);
    } else {
      onClick(phase);
    }
    dragRef.current = null;
    setTooltip(null);
  };

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 rounded-[5px] flex items-center px-2 select-none"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        height: 22,
        background: style.bg,
        color: style.text,
        outline: hover ? "2px solid #F4821F" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="absolute left-0 top-0 h-full w-[6px] cursor-ew-resize"
        onPointerDown={handlePointerDown("left")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div
        className="flex-1 h-full flex items-center text-[10px] font-medium truncate cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown("move")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span className="truncate">{phase.name}</span>
      </div>
      <div
        className="absolute right-0 top-0 h-full w-[6px] cursor-ew-resize"
        onPointerDown={handlePointerDown("right")}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {tooltip && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
}

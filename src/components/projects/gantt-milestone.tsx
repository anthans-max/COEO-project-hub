"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { Milestone } from "@/lib/types";

interface Props {
  milestone: Milestone;
  leftPct: number;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function GanttMilestone({ milestone, leftPct }: Props) {
  const [hover, setHover] = useState(false);
  if (!milestone.due_date) return null;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${leftPct}%` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="w-[10px] h-[10px] rotate-45 bg-accent -translate-x-1/2"
        style={{ border: "1.5px solid #FFFFFF" }}
      />
      {hover && (
        <div className="absolute top-4 left-0 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
          {milestone.title} · {format(parseDate(milestone.due_date), "MMM d, yyyy")}
        </div>
      )}
    </div>
  );
}

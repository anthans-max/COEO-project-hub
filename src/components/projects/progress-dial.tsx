"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function ProgressDial({ value, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circumference;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    const next = Math.round(angle / 3.6);
    onChange(Math.max(0, Math.min(100, next)));
  };

  return (
    <Card className="flex flex-col items-center justify-center py-5 px-3 bg-white">
      <svg
        ref={svgRef}
        width={110}
        height={110}
        viewBox="0 0 100 100"
        onClick={handleClick}
        className="cursor-pointer"
      >
        <circle cx={50} cy={50} r={r} fill="none" stroke="#E8E2D9" strokeWidth={8} />
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke="#0A2342"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dasharray 200ms ease" }}
        />
        <text
          x={50}
          y={49}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-primary"
          style={{ fontSize: "20px", fontWeight: 600 }}
        >
          {pct}%
        </text>
        <text
          x={50}
          y={64}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-text-muted"
          style={{ fontSize: "8px" }}
        >
          complete
        </text>
      </svg>
      <div className="mt-2 text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase">
        Progress
      </div>
      <div className="mt-1 text-[10px] text-text-muted opacity-60">Click to edit</div>
    </Card>
  );
}

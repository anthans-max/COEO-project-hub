"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { ProgramDecision, ProgramTheme } from "@/lib/types";

interface ThemeCardProps {
  theme: ProgramTheme;
  expanded: boolean;
  decisions: ProgramDecision[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ThemeCard({ theme, expanded, decisions, onToggle, onEdit, onDelete }: ThemeCardProps) {
  const color = theme.color ?? "#5a6a7e";
  const bg = theme.bg_color ?? "#f0f4fa";

  const linkedDecisions = decisions.filter((d) => d.theme_codes.includes(theme.code));

  return (
    <div
      onClick={onToggle}
      className="bg-white rounded-card cursor-pointer group relative"
      style={{
        border: `1px solid ${expanded ? color : "#e8ecf2"}`,
        padding: "20px 22px",
        transition: "all 0.2s",
        boxShadow: expanded ? `0 4px 20px ${color}20` : "0 1px 4px rgba(0,0,0,0.05)",
        gridColumn: expanded ? "1 / -1" : "auto",
      }}
    >
      <div
        className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          className="text-[10px] font-medium text-white bg-primary px-2 py-[3px] rounded-pill hover:bg-primary/90 flex items-center gap-1"
          title="Edit theme"
        >
          <Pencil size={10} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-[10px] font-medium text-white bg-destructive px-2 py-[3px] rounded-pill hover:bg-destructive/90 flex items-center gap-1"
          title="Delete theme"
        >
          <Trash2 size={10} />
          Delete
        </button>
      </div>

      <div
        className="flex items-start gap-[14px]"
        style={{ marginBottom: expanded ? 16 : 0 }}
      >
        <div
          className="rounded-[8px] flex items-center justify-center shrink-0"
          style={{
            width: 38,
            height: 38,
            background: bg,
            color,
            fontSize: 18,
          }}
        >
          {theme.icon}
        </div>
        <div className="flex-1 min-w-0 pr-[100px]">
          <div className="flex items-center gap-2 mb-[3px]">
            <span className="text-sm font-bold tracking-[0.1em]" style={{ color }}>
              {theme.code}
            </span>
          </div>
          <div className="text-lg font-bold text-primary leading-[1.3]">{theme.title}</div>
          {!expanded && theme.description && (
            <p className="text-base m-0 mt-[6px] leading-[1.5]" style={{ color: "#6a7a8e" }}>
              {theme.description.length > 100
                ? theme.description.substring(0, 100) + "…"
                : theme.description}
            </p>
          )}
        </div>
        <div className="text-[16px] mt-[2px]" style={{ color: "#aab5c5" }}>
          {expanded ? "▲" : "▼"}
        </div>
      </div>

      {expanded && (
        <div
          className="grid gap-6 pt-4"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            borderTop: `1px solid ${color}20`,
          }}
        >
          <div>
            <div
              className="text-sm font-bold tracking-[0.08em] uppercase mb-2"
              style={{ color: "#8a9ab5" }}
            >
              Description
            </div>
            <p className="text-base m-0 leading-[1.7]" style={{ color: "#3a4a5e" }}>
              {theme.description}
            </p>
          </div>
          <div>
            <div
              className="text-sm font-bold tracking-[0.08em] uppercase mb-2"
              style={{ color: "#8a9ab5" }}
            >
              Key Outcomes
            </div>
            {theme.outcomes.map((o, i) => (
              <div key={i} className="flex gap-2 mb-2 items-start">
                <span className="text-base shrink-0 mt-[2px]" style={{ color }}>
                  →
                </span>
                <span className="text-base leading-[1.5]" style={{ color: "#3a4a5e" }}>
                  {o}
                </span>
              </div>
            ))}
          </div>
          <div>
            <div
              className="text-sm font-bold tracking-[0.08em] uppercase mb-2"
              style={{ color: "#8a9ab5" }}
            >
              Contributing Workstreams
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {theme.workstreams.map((w) => (
                <span
                  key={w}
                  className="text-sm text-primary rounded-[4px] inline-block"
                  style={{
                    background: "#f4f6fa",
                    padding: "4px 8px",
                    marginBottom: 4,
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
            {linkedDecisions.length > 0 && (
              <div>
                <div
                  className="text-sm font-bold tracking-[0.08em] uppercase mb-[6px]"
                  style={{ color: "#8a9ab5" }}
                >
                  Linked Decisions
                </div>
                <div className="flex flex-wrap gap-1">
                  {linkedDecisions.map((d) => (
                    <span
                      key={d.id}
                      className="text-sm font-semibold rounded-[3px] inline-block"
                      style={{
                        color,
                        background: bg,
                        padding: "3px 7px",
                      }}
                    >
                      {d.code}: {d.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

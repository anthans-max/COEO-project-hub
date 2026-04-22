"use client";

import { Pencil, Trash2 } from "lucide-react";
import { DECISION_STATUSES, DECISION_STATUS_LABELS } from "@/lib/constants";
import { ThemeTag } from "./theme-tag";
import { SourceProjectTag } from "./source-project-tag";
import type { ProgramDecision, ProgramTheme } from "@/lib/types";

interface Props {
  decision: ProgramDecision;
  themes: ProgramTheme[];
  onStatusChange: (status: ProgramDecision["status"]) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_BG: Record<ProgramDecision["status"], { bg: string; color: string; border: string }> = {
  open: { bg: "#fef3e7", color: "#924d0a", border: "#f0d4a8" },
  in_progress: { bg: "#e6eff7", color: "#0a2342", border: "#c8d4e4" },
  resolved: { bg: "#e8f4ed", color: "#1a5c32", border: "#c8e2d0" },
};

export function DecisionCard({ decision, themes, onStatusChange, onEdit, onDelete }: Props) {
  const statusStyle = STATUS_BG[decision.status];

  return (
    <div
      className="rounded-card group relative"
      style={{
        background: "#fff",
        border: "1px solid #e8ecf2",
        padding: "18px 22px",
      }}
    >
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="text-[10px] font-medium text-white bg-primary px-2 py-[3px] rounded-pill hover:bg-primary/90 flex items-center gap-1"
          title="Edit decision"
        >
          <Pencil size={10} />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-[10px] font-medium text-white bg-destructive px-2 py-[3px] rounded-pill hover:bg-destructive/90 flex items-center gap-1"
          title="Delete decision"
        >
          <Trash2 size={10} />
          Delete
        </button>
      </div>

      <div
        className="grid gap-4 items-start"
        style={{ gridTemplateColumns: "80px 1fr 160px 110px 160px 120px" }}
      >
        <div>
          <div
            className="text-sm font-extrabold inline-block rounded-[5px] tracking-[0.04em]"
            style={{
              color: "#0f2744",
              background: "#f0f4fa",
              padding: "4px 8px",
            }}
          >
            {decision.code}
          </div>
        </div>
        <div>
          <div className="text-base font-bold text-primary mb-1 pr-[140px]">
            {decision.title}
          </div>
          {decision.detail && (
            <p className="text-base m-0 mb-2 leading-[1.6]" style={{ color: "#5a6a7e" }}>
              {decision.detail}
            </p>
          )}
          {decision.impact && (
            <div className="text-sm mb-[6px]" style={{ color: "#8a9ab5" }}>
              <strong style={{ color: "#5a6a7e" }}>Impact if unresolved: </strong>
              {decision.impact}
            </div>
          )}
          {decision.theme_codes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {decision.theme_codes.map((code) => (
                <ThemeTag key={code} code={code} themes={themes} />
              ))}
            </div>
          )}
        </div>
        <div>
          <div
            className="text-sm tracking-[0.06em] font-bold uppercase mb-[3px]"
            style={{ color: "#8a9ab5" }}
          >
            Source project
          </div>
          {decision.source_project.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {decision.source_project.map((name) => (
                <SourceProjectTag key={name} name={name} />
              ))}
            </div>
          ) : (
            <div className="text-base leading-[1.5]" style={{ color: "#3a4a5e" }}>
              —
            </div>
          )}
        </div>
        <div>
          <div
            className="text-sm tracking-[0.06em] font-bold uppercase mb-[3px]"
            style={{ color: "#8a9ab5" }}
          >
            Target month
          </div>
          <div
            className="text-sm font-bold inline-block rounded-[4px]"
            style={{
              color: "#c87d2f",
              background: "#fdf4e8",
              padding: "3px 8px",
            }}
          >
            {decision.target_month ?? "—"}
          </div>
        </div>
        <div>
          <div
            className="text-sm tracking-[0.06em] font-bold uppercase mb-[3px]"
            style={{ color: "#8a9ab5" }}
          >
            Owner
          </div>
          <div className="text-base leading-[1.5]" style={{ color: "#3a4a5e" }}>
            {decision.owner ?? "—"}
          </div>
        </div>
        <div>
          <div
            className="text-sm tracking-[0.06em] font-bold uppercase mb-[3px]"
            style={{ color: "#8a9ab5" }}
          >
            Status
          </div>
          <select
            value={decision.status}
            onChange={(e) =>
              onStatusChange(e.target.value as ProgramDecision["status"])
            }
            className="text-sm font-bold rounded-[4px] outline-none cursor-pointer"
            style={{
              background: statusStyle.bg,
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`,
              padding: "3px 8px",
            }}
          >
            {DECISION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {DECISION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

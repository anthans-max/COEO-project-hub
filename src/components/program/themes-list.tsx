"use client";

import { useMemo, useState } from "react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionHeader } from "./section-header";
import { ThemeCard } from "./theme-card";
import { ThemeDialog } from "./theme-dialog";
import type { ProgramDecision, ProgramTheme } from "@/lib/types";

interface Props {
  initialThemes: ProgramTheme[];
  initialDecisions: ProgramDecision[];
}

export function ThemesList({ initialThemes, initialDecisions }: Props) {
  const [themes, setThemes] = useRealtime<ProgramTheme>(
    "coeo_program_themes",
    initialThemes
  );
  const [decisions] = useRealtime<ProgramDecision>(
    "coeo_program_decisions",
    initialDecisions
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTheme, setEditTheme] = useState<ProgramTheme | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const sorted = useMemo(
    () => [...themes].sort((a, b) => a.sort_order - b.sort_order),
    [themes]
  );

  const openDecisionCount = decisions.filter((d) => d.status === "open").length;

  const nextSortOrder =
    themes.length === 0 ? 1 : Math.max(...themes.map((t) => t.sort_order)) + 1;

  const handleSave = (theme: ProgramTheme) => {
    setThemes((prev) => {
      const idx = prev.findIndex((t) => t.id === theme.id);
      if (idx === -1) return [...prev, theme];
      const next = [...prev];
      next[idx] = theme;
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = themes.find((t) => t.id === deleteId);
    setThemes((prev) => prev.filter((t) => t.id !== deleteId));
    if (expandedId === deleteId) setExpandedId(null);
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_program_themes")
      .delete()
      .eq("id", deleteId);
    if (error) {
      if (original) setThemes((prev) => [...prev, original]);
      toast.error("Failed to delete theme");
    }
  };

  const visionStats: [string, string][] = [
    [String(themes.length), "Strategic Themes"],
    ["3", "Core Workstreams"],
    [String(openDecisionCount), "Open Decisions"],
    ["Q3 2026", "Phase 1 Target"],
  ];

  return (
    <>
      <SectionHeader
        label="Program · Strategy"
        title="Strategic Themes"
        subtitle="The Coeo technology program is organized around seven strategic themes that cut across all workstreams. Progress is measured by outcomes, not just project milestones."
      />

      <div
        className="rounded-card mb-8 relative overflow-hidden"
        style={{ background: "#0f2744", padding: "28px 32px" }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            background: "rgba(200,125,47,0.08)",
          }}
        />
        <div
          className="text-[11px] font-bold tracking-[0.12em] uppercase mb-[10px]"
          style={{ color: "#c87d2f" }}
        >
          Program Vision
        </div>
        <p
          className="text-[16px] m-0 mb-4 leading-[1.7] max-w-[760px]"
          style={{ color: "#e8edf4", fontFamily: "'Georgia', serif" }}
        >
          To build a unified, API-first technology platform that gives Coeo customers full
          visibility and control over their services, while eliminating the fragmented internal
          tooling that increases handling time and erodes data quality.
        </p>
        <div className="flex gap-8 flex-wrap">
          {visionStats.map(([val, lbl]) => (
            <div key={lbl}>
              <div
                className="text-[22px] font-extrabold"
                style={{ color: "#c87d2f", fontFamily: "'Georgia', serif" }}
              >
                {val}
              </div>
              <div className="text-[11px] tracking-[0.06em]" style={{ color: "#8a9ab5" }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add theme</Button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {sorted.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            expanded={expandedId === theme.id}
            decisions={decisions}
            onToggle={() => setExpandedId((prev) => (prev === theme.id ? null : theme.id))}
            onEdit={() => setEditTheme(theme)}
            onDelete={() => setDeleteId(theme.id)}
          />
        ))}
      </div>

      {themes.length === 0 && (
        <div className="py-10 text-center text-[14px] text-text-muted">
          No themes yet. Click &quot;+ Add theme&quot; to create the first one.
        </div>
      )}

      <div
        className="mt-6 rounded-[8px]"
        style={{
          background: "#f8f9fc",
          border: "1px solid #e8ecf2",
          padding: "16px 20px",
        }}
      >
        <div
          className="text-[11px] font-bold tracking-[0.1em] uppercase mb-[6px]"
          style={{ color: "#8a9ab5" }}
        >
          Theme Dependency Note
        </div>
        <p className="text-[13px] m-0 leading-[1.6]" style={{ color: "#5a6a7e" }}>
          Themes T-01 and T-02 are foundational — Data Quality and System Integration must mature
          before Operational Visibility (T-03) is reliable, which in turn must exist before
          Customer Self-Service (T-04) is credible. This sequencing is reflected in the program
          timeline.
        </p>
      </div>

      <ThemeDialog
        open={showAdd}
        theme={null}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <ThemeDialog
        open={!!editTheme}
        theme={editTheme}
        onClose={() => setEditTheme(null)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete theme"
        message="Are you sure you want to delete this theme? Decisions tagged with this theme will keep their tag but will no longer render a matching color."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

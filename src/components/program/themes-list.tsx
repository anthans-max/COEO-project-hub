"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionHeader } from "./section-header";
import { ThemeCard } from "./theme-card";
import { ThemeDialog } from "./theme-dialog";
import type {
  ProgramDecision,
  ProgramSetting,
  ProgramTheme,
} from "@/lib/types";

interface Props {
  initialThemes: ProgramTheme[];
  initialDecisions: ProgramDecision[];
  initialSettings: ProgramSetting[];
}

const VISION_KEY = "program_vision";
const DEFAULT_VISION =
  "To build a unified, API-first technology platform that gives Coeo customers full visibility and control over their services, while eliminating the fragmented internal tooling that increases handling time and erodes data quality.";

export function ThemesList({
  initialThemes,
  initialDecisions,
  initialSettings,
}: Props) {
  const [themes, setThemes] = useRealtime<ProgramTheme>(
    "coeo_program_themes",
    initialThemes
  );
  const [decisions] = useRealtime<ProgramDecision>(
    "coeo_program_decisions",
    initialDecisions
  );
  const [settings, setSettings] = useRealtime<ProgramSetting>(
    "coeo_program_settings",
    initialSettings
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editTheme, setEditTheme] = useState<ProgramTheme | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingVision, setEditingVision] = useState(false);
  const [visionDraft, setVisionDraft] = useState("");
  const [savingVision, setSavingVision] = useState(false);
  const toast = useToast();

  const visionRow = settings.find((s) => s.key === VISION_KEY);
  const vision = visionRow?.value?.trim() ? visionRow.value : DEFAULT_VISION;

  const startEditVision = () => {
    setVisionDraft(vision);
    setEditingVision(true);
  };

  const cancelEditVision = () => {
    setEditingVision(false);
    setVisionDraft("");
  };

  const saveVision = async () => {
    const trimmed = visionDraft.trim();
    if (!trimmed) {
      toast.error("Vision text cannot be empty");
      return;
    }
    setSavingVision(true);

    const previous = visionRow ? { ...visionRow } : null;
    if (visionRow) {
      setSettings((prev) =>
        prev.map((s) =>
          s.id === visionRow.id ? { ...s, value: trimmed } : s
        )
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_program_settings")
      .upsert({ key: VISION_KEY, value: trimmed }, { onConflict: "key" })
      .select()
      .single();

    setSavingVision(false);

    if (error || !data) {
      if (previous) {
        setSettings((prev) =>
          prev.map((s) => (s.id === previous.id ? previous : s))
        );
      }
      toast.error("Failed to save vision");
      return;
    }

    setSettings((prev) => {
      const saved = data as ProgramSetting;
      const idx = prev.findIndex((s) => s.id === saved.id);
      if (idx === -1) return [...prev, saved];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    setEditingVision(false);
    setVisionDraft("");
  };

  const sorted = useMemo(
    () => [...themes].sort((a, b) => a.sort_order - b.sort_order),
    [themes]
  );

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
  ];

  return (
    <>
      <SectionHeader
        label="Program · Strategy"
        title="Strategic Themes"
        subtitle="The Coeo technology program is organized around seven strategic themes that cut across all workstreams. Progress is measured by outcomes, not just project milestones."
      />

      <div
        className="rounded-card mb-8 relative overflow-hidden group"
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
        {!editingVision && (
          <button
            onClick={startEditVision}
            className="absolute top-3 right-3 z-10 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white hover:bg-white/10"
            aria-label="Edit program vision"
            title="Edit vision"
          >
            <Pencil size={14} />
          </button>
        )}
        <div
          className="text-sm font-bold tracking-[0.12em] uppercase mb-[10px]"
          style={{ color: "#c87d2f" }}
        >
          Program Vision
        </div>
        {editingVision ? (
          <div className="mb-4 max-w-[760px] relative z-10">
            <textarea
              value={visionDraft}
              onChange={(e) => setVisionDraft(e.target.value)}
              rows={5}
              autoFocus
              className="w-full text-[16px] leading-[1.7] rounded-card px-3 py-2 outline-none resize-y"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#e8edf4",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelEditVision}
                disabled={savingVision}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveVision}
                disabled={savingVision || !visionDraft.trim()}
              >
                {savingVision ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p
            className="text-[16px] m-0 mb-4 leading-[1.7] max-w-[760px]"
            style={{ color: "#e8edf4" }}
          >
            {vision}
          </p>
        )}
        <div className="flex gap-8 flex-wrap">
          {visionStats.map(([val, lbl]) => (
            <div key={lbl}>
              <div
                className="text-[22px] font-extrabold"
                style={{ color: "#c87d2f" }}
              >
                {val}
              </div>
              <div className="text-sm tracking-[0.06em]" style={{ color: "#8a9ab5" }}>
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
          className="text-sm font-bold tracking-[0.1em] uppercase mb-[6px]"
          style={{ color: "#8a9ab5" }}
        >
          Theme Dependency Note
        </div>
        <p className="text-base m-0 leading-[1.6]" style={{ color: "#5a6a7e" }}>
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

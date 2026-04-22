"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SectionHeader } from "./section-header";
import { ThemeTag } from "./theme-tag";
import { LayerDialog } from "./layer-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type {
  ArchitectureLayer,
  ProgramDecision,
  ProgramTheme,
} from "@/lib/types";

interface Props {
  themes: ProgramTheme[];
  initialLayers: ArchitectureLayer[];
  initialDecisions: ProgramDecision[];
}

const DATA_SOURCES = [
  "Salesforce",
  "Rev.io",
  "RazorFlow",
  "Performio",
  "AskNicely",
  "Peerless Network",
  "Bandwidth",
  "Inteliquent",
];

const STATUS_STYLE: Record<
  ProgramDecision["status"],
  { color: string; bg: string; border: string; label: string }
> = {
  open: {
    color: "#c87d2f",
    bg: "#fdf4e8",
    border: "#f0d4a8",
    label: "Decision Required",
  },
  in_progress: {
    color: "#1e4d8c",
    bg: "#eef3fc",
    border: "#cddaee",
    label: "In Progress",
  },
  resolved: {
    color: "#5a7a6e",
    bg: "#eef3f0",
    border: "#d4dcd6",
    label: "Resolved",
  },
};

export function ArchitectureView({ themes, initialLayers, initialDecisions }: Props) {
  const [layers, setLayers] = useRealtime<ArchitectureLayer>(
    "coeo_architecture_layers",
    initialLayers
  );
  const [decisions] = useRealtime<ProgramDecision>(
    "coeo_program_decisions",
    initialDecisions
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editLayer, setEditLayer] = useState<ArchitectureLayer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const sortedLayers = useMemo(
    () => [...layers].sort((a, b) => a.sort_order - b.sort_order),
    [layers]
  );

  const nextSortOrder =
    layers.length === 0 ? 1 : Math.max(...layers.map((l) => l.sort_order)) + 1;

  const handleSave = (layer: ArchitectureLayer) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === layer.id);
      if (idx === -1) return [...prev, layer];
      const next = [...prev];
      next[idx] = layer;
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = layers.find((l) => l.id === deleteId);
    setLayers((prev) => prev.filter((l) => l.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_architecture_layers")
      .delete()
      .eq("id", deleteId);
    if (error) {
      if (original) setLayers((prev) => [...prev, original]);
      toast.error("Failed to delete layer");
    }
  };

  const workstreamMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const theme of themes) {
      for (const w of theme.workstreams) {
        if (!map[w]) map[w] = [];
        if (!map[w].includes(theme.code)) map[w].push(theme.code);
      }
    }
    for (const w of Object.keys(map)) {
      map[w].sort();
    }
    return map;
  }, [themes]);

  const workstreams = Object.keys(workstreamMap).sort();

  return (
    <>
      <SectionHeader
        label="Program · Architecture"
        title="Ecosystem Architecture"
        subtitle="A logical view of how all systems, workstreams, and integration layers connect. The middleware layer represents the most significant open architectural decision in the program."
      />

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add layer</Button>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <div className="text-center pb-1">
          <div
            className="inline-block rounded-pill text-sm font-bold"
            style={{
              background: "#0f2744",
              color: "#e8edf4",
              padding: "8px 24px",
              letterSpacing: "0.08em",
            }}
          >
            INTERNET
          </div>
          <div className="mx-auto" style={{ width: 2, height: 16, background: "#c8d4e4" }} />
        </div>

        {sortedLayers.map((layer, i) => {
          const isHover = hovered === layer.id;
          const linkedDecisions = layer.decision_codes
            .map((c) => decisions.find((d) => d.code === c))
            .filter((d): d is ProgramDecision => !!d);
          return (
            <div key={layer.id}>
              <div
                onMouseEnter={() => setHovered(layer.id)}
                onMouseLeave={() => setHovered(null)}
                className="rounded-card group relative"
                style={{
                  background: isHover ? layer.bg_color : "#fff",
                  border: `2px solid ${isHover ? layer.color : "#e8ecf2"}`,
                  padding: "18px 22px",
                  transition: "all 0.2s",
                  boxShadow: isHover ? `0 4px 16px ${layer.color}15` : "none",
                }}
              >
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => setEditLayer(layer)}
                    className="text-[10px] font-medium text-white bg-primary px-2 py-[3px] rounded-pill hover:bg-primary/90 flex items-center gap-1"
                    title="Edit layer"
                  >
                    <Pencil size={10} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(layer.id)}
                    className="text-[10px] font-medium text-white bg-destructive px-2 py-[3px] rounded-pill hover:bg-destructive/90 flex items-center gap-1"
                    title="Delete layer"
                  >
                    <Trash2 size={10} />
                    Delete
                  </button>
                </div>
                <div className="flex items-start gap-4 flex-wrap">
                  <div style={{ minWidth: 200 }}>
                    <div
                      className="text-sm font-bold tracking-[0.1em] uppercase mb-1"
                      style={{ color: layer.color }}
                    >
                      {layer.label}
                    </div>
                    {layer.note && (
                      <div className="text-base leading-[1.5]" style={{ color: "#6a7a8e" }}>
                        {layer.note}
                      </div>
                    )}
                    {linkedDecisions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {linkedDecisions.map((d) => {
                          const s = STATUS_STYLE[d.status];
                          return (
                            <span
                              key={d.code}
                              title={d.title}
                              className="text-sm font-bold inline-block rounded"
                              style={{
                                color: s.color,
                                background: s.bg,
                                border: `1px solid ${s.border}`,
                                padding: "4px 8px",
                              }}
                            >
                              {d.code} — {s.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center flex-1">
                    {layer.modules.map((m) => (
                      <div
                        key={m}
                        className="rounded-[6px] text-sm font-semibold"
                        style={{
                          color: layer.color,
                          background: layer.bg_color,
                          border: `1px solid ${layer.color}30`,
                          padding: "6px 12px",
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {i < sortedLayers.length - 1 && (
                <div className="flex justify-center" style={{ padding: "4px 0" }}>
                  <div style={{ fontSize: 16, color: "#c8d4e4" }}>↕</div>
                </div>
              )}
            </div>
          );
        })}

        {sortedLayers.length === 0 && (
          <div className="py-10 text-center text-[14px] text-text-muted">
            No layers yet. Click &quot;+ Add layer&quot; to create the first one.
          </div>
        )}
      </div>

      <div
        className="rounded-card mb-6"
        style={{
          background: "#f8f9fc",
          border: "1px solid #e8ecf2",
          padding: "20px 24px",
        }}
      >
        <div
          className="text-sm font-bold tracking-[0.1em] uppercase mb-3"
          style={{ color: "#8a9ab5" }}
        >
          Data Sources — Ingested via Data Warehouse (n8n / FTP / API)
        </div>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((s) => (
            <div
              key={s}
              className="rounded-[6px] text-sm font-semibold"
              style={{
                color: "#0f2744",
                background: "#fff",
                border: "1px solid #d8e0ec",
                padding: "6px 12px",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-card"
        style={{ background: "#fff", border: "1px solid #e8ecf2", padding: "20px 24px" }}
      >
        <div
          className="text-sm font-bold tracking-[0.1em] uppercase mb-4"
          style={{ color: "#8a9ab5" }}
        >
          Workstream Contributions to Architecture Layers
        </div>
        {workstreams.length === 0 ? (
          <div className="py-6 text-center text-base text-text-muted">
            No workstreams mapped yet — add workstreams to themes on the Strategy page to populate
            this grid.
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {workstreams.map((w) => (
              <div
                key={w}
                className="rounded-[8px]"
                style={{
                  background: "#f8f9fc",
                  border: "1px solid #e8ecf2",
                  padding: "14px 16px",
                }}
              >
                <div className="text-base font-bold text-primary mb-2">{w}</div>
                <div className="flex flex-wrap gap-1">
                  {workstreamMap[w].map((code) => (
                    <ThemeTag key={code} code={code} themes={themes} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LayerDialog
        open={showAdd}
        layer={null}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <LayerDialog
        open={!!editLayer}
        layer={editLayer}
        onClose={() => setEditLayer(null)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete layer"
        message="Are you sure you want to delete this layer? The Ecosystem Architecture page will no longer render it."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

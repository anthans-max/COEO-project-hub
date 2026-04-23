"use client";

import { useMemo, useState } from "react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionHeader } from "./section-header";
import { AiCapabilityCard } from "./ai-capability-card";
import { AiCapabilityDialog } from "./ai-capability-dialog";
import type {
  AiCapability,
  ArchitectureLayer,
  ProgramTheme,
} from "@/lib/types";

interface Props {
  initialThemes: ProgramTheme[];
  initialLayers: ArchitectureLayer[];
  initialCapabilities: AiCapability[];
}

export function AiCapabilityMap({
  initialThemes,
  initialLayers,
  initialCapabilities,
}: Props) {
  const [themes] = useRealtime<ProgramTheme>(
    "coeo_program_themes",
    initialThemes
  );
  const [layers] = useRealtime<ArchitectureLayer>(
    "coeo_architecture_layers",
    initialLayers
  );
  const [capabilities, setCapabilities] = useRealtime<AiCapability>(
    "coeo_ai_capabilities",
    initialCapabilities
  );
  const [showAdd, setShowAdd] = useState(false);
  const [editCapability, setEditCapability] = useState<AiCapability | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const sortedThemes = useMemo(
    () => [...themes].sort((a, b) => a.sort_order - b.sort_order),
    [themes]
  );

  const capabilitiesByTheme = useMemo(() => {
    const map: Record<string, AiCapability[]> = {};
    for (const cap of [...capabilities].sort(
      (a, b) => a.sort_order - b.sort_order
    )) {
      (map[cap.theme_code] ??= []).push(cap);
    }
    return map;
  }, [capabilities]);

  const nextSortOrder =
    capabilities.length === 0
      ? 1
      : Math.max(...capabilities.map((c) => c.sort_order)) + 1;

  const handleSave = (capability: AiCapability) => {
    setCapabilities((prev) => {
      const idx = prev.findIndex((c) => c.id === capability.id);
      if (idx === -1) return [...prev, capability];
      const next = [...prev];
      next[idx] = capability;
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = capabilities.find((c) => c.id === deleteId);
    setCapabilities((prev) => prev.filter((c) => c.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_ai_capabilities")
      .delete()
      .eq("id", deleteId);
    if (error) {
      if (original) setCapabilities((prev) => [...prev, original]);
      toast.error("Failed to delete capability");
    }
  };

  return (
    <>
      <SectionHeader
        label="Program · Strategy"
        title="AI Capability Map"
        subtitle="Where AI adds value against each strategic theme. Capabilities are illustrative of direction, not a committed delivery backlog — use them to frame conversations about where AI investment pays off soonest."
      />

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add capability</Button>
      </div>

      <div className="flex flex-col gap-8">
        {sortedThemes.map((theme) => {
          const color = theme.color ?? "#5a6a7e";
          const bg = theme.bg_color ?? "#f0f4fa";
          const themeCaps = capabilitiesByTheme[theme.code] ?? [];

          return (
            <section key={theme.id}>
              <div className="flex items-start gap-[14px] mb-4">
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
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-bold tracking-[0.1em]"
                    style={{ color }}
                  >
                    {theme.code}
                  </div>
                  <div className="text-lg font-bold text-primary leading-[1.3]">
                    {theme.title}
                  </div>
                </div>
              </div>

              {themeCaps.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {themeCaps.map((cap) => (
                    <AiCapabilityCard
                      key={cap.id}
                      capability={cap}
                      themes={themes}
                      layers={layers}
                      onEdit={() => setEditCapability(cap)}
                      onDelete={() => setDeleteId(cap.id)}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-card text-sm text-text-muted"
                  style={{
                    background: "#f8f9fc",
                    border: "1px dashed #e0e6ef",
                    padding: "20px 24px",
                  }}
                >
                  No AI capabilities mapped against this theme yet.
                </div>
              )}
            </section>
          );
        })}

        {sortedThemes.length === 0 && (
          <div className="py-10 text-center text-[14px] text-text-muted">
            No themes found — check the Strategy &amp; Themes page.
          </div>
        )}
      </div>

      <div
        className="mt-10 rounded-[8px]"
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
          How to read this map
        </div>
        <p className="text-base m-0 leading-[1.6]" style={{ color: "#5a6a7e" }}>
          Each capability is tagged with a maturity signal and, where relevant, the themes it
          depends on and the architecture layers it sits in. Maturity reflects where a capability
          sits today — most will remain exploratory until the data quality and integration
          foundations (T-01, T-02) mature and business sponsors for individual capabilities are
          confirmed.
        </p>
      </div>

      <AiCapabilityDialog
        open={showAdd}
        capability={null}
        themes={themes}
        layers={layers}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <AiCapabilityDialog
        open={!!editCapability}
        capability={editCapability}
        themes={themes}
        layers={layers}
        onClose={() => setEditCapability(null)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete capability"
        message="This will permanently remove it from the AI Capability Map. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

"use client";

import { useMemo } from "react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { SectionHeader } from "./section-header";
import { AiCapabilityCard } from "./ai-capability-card";
import type { AiCapability } from "@/lib/data/ai-capabilities";
import type { ArchitectureLayer, ProgramTheme } from "@/lib/types";

interface Props {
  initialThemes: ProgramTheme[];
  initialLayers: ArchitectureLayer[];
  capabilities: AiCapability[];
}

export function AiCapabilityMap({
  initialThemes,
  initialLayers,
  capabilities,
}: Props) {
  const [themes] = useRealtime<ProgramTheme>(
    "coeo_program_themes",
    initialThemes
  );
  const [layers] = useRealtime<ArchitectureLayer>(
    "coeo_architecture_layers",
    initialLayers
  );

  const sortedThemes = useMemo(
    () => [...themes].sort((a, b) => a.sort_order - b.sort_order),
    [themes]
  );

  const capabilitiesByTheme = useMemo(() => {
    const map: Record<string, AiCapability[]> = {};
    for (const cap of capabilities) {
      (map[cap.theme_code] ??= []).push(cap);
    }
    return map;
  }, [capabilities]);

  return (
    <>
      <SectionHeader
        label="Program · Strategy"
        title="AI Capability Map"
        subtitle="Where AI adds value against each strategic theme. Capabilities are illustrative of direction, not a committed delivery backlog — use them to frame conversations about where AI investment pays off soonest."
      />

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
          depends on and the architecture layers it sits in. T-03 and T-04 capabilities are the
          furthest along conceptually because the underlying workstreams are already in motion;
          most others remain exploratory until the data quality and integration foundations (T-01,
          T-02) mature.
        </p>
      </div>
    </>
  );
}

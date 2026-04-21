"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "./section-header";
import { ThemeTag } from "./theme-tag";
import type { ProgramTheme } from "@/lib/types";

interface Props {
  themes: ProgramTheme[];
}

interface Layer {
  id: string;
  label: string;
  color: string;
  bg: string;
  modules: string[];
  note: string;
  warning?: string;
}

const LAYERS: Layer[] = [
  {
    id: "portal",
    label: "Customer Portal",
    color: "#1e4d8c",
    bg: "#eef3fc",
    modules: [
      "Dashboard",
      "Billing",
      "Support",
      "Services",
      "Orders",
      "Account Mgmt",
      "Monitoring",
      "Auth/Authz",
    ],
    note: "Customer-facing self-service layer. Built by Technovate / Nextian.",
  },
  {
    id: "middleware",
    label: "Middleware / Orchestration / API",
    color: "#c87d2f",
    bg: "#fdf4e8",
    modules: ["API Gateway", "n8n Orchestration", "Integration Bus"],
    note: "⚠ Architecture approach TBD — key open decision for Enterprise Middleware workstream.",
    warning: "OI-002 / OI-005 — Decision Required",
  },
  {
    id: "coeo",
    label: "Coeo Systems",
    color: "#1a6b5c",
    bg: "#f0faf7",
    modules: [
      "Rev.io (Billing)",
      "Data Warehouse (StarRocks)",
      "CRM (Salesforce)",
      "NMS / SolarWinds / Prometheus",
      "EMS / PSX",
      "IdP (Entra ID)",
    ],
    note: "Internal systems of record. Data Warehouse acts as integration hub via AWS/n8n.",
  },
  {
    id: "client",
    label: "Client Systems",
    color: "#5c1a6b",
    bg: "#faf0fc",
    modules: ["Customer Router", "Customer IdP"],
    note: "Customer-side infrastructure — relevant for SSO federation and monitoring.",
  },
];

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

export function ArchitectureView({ themes }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Invert themes.workstreams[] into a workstream → theme_codes map
  const workstreamMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const theme of themes) {
      for (const w of theme.workstreams) {
        if (!map[w]) map[w] = [];
        if (!map[w].includes(theme.code)) map[w].push(theme.code);
      }
    }
    // Keep order deterministic: theme codes ascending within each workstream
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

      <div className="flex flex-col gap-3 mb-8">
        <div className="text-center pb-1">
          <div
            className="inline-block rounded-pill"
            style={{
              background: "#0f2744",
              color: "#e8edf4",
              fontSize: 12,
              fontWeight: 700,
              padding: "8px 24px",
              letterSpacing: "0.08em",
            }}
          >
            INTERNET
          </div>
          <div className="mx-auto" style={{ width: 2, height: 16, background: "#c8d4e4" }} />
        </div>

        {LAYERS.map((layer, i) => {
          const isHover = hovered === layer.id;
          return (
            <div key={layer.id}>
              <div
                onMouseEnter={() => setHovered(layer.id)}
                onMouseLeave={() => setHovered(null)}
                className="rounded-card"
                style={{
                  background: isHover ? layer.bg : "#fff",
                  border: `2px solid ${isHover ? layer.color : "#e8ecf2"}`,
                  padding: "18px 22px",
                  transition: "all 0.2s",
                  boxShadow: isHover ? `0 4px 16px ${layer.color}15` : "none",
                }}
              >
                <div className="flex items-start gap-4 flex-wrap">
                  <div style={{ minWidth: 200 }}>
                    <div
                      className="text-[11px] font-bold tracking-[0.1em] uppercase mb-1"
                      style={{ color: layer.color }}
                    >
                      {layer.label}
                    </div>
                    <div className="text-[12px] leading-[1.5]" style={{ color: "#6a7a8e" }}>
                      {layer.note}
                    </div>
                    {layer.warning && (
                      <div
                        className="mt-2 text-[11px] font-bold inline-block rounded"
                        style={{
                          color: "#c87d2f",
                          background: "#fdf4e8",
                          border: "1px solid #f0d4a8",
                          padding: "4px 8px",
                        }}
                      >
                        {layer.warning}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center flex-1">
                    {layer.modules.map((m) => (
                      <div
                        key={m}
                        className="rounded-[6px]"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: layer.color,
                          background: layer.bg,
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
              {i < LAYERS.length - 1 && (
                <div className="flex justify-center" style={{ padding: "4px 0" }}>
                  <div style={{ fontSize: 16, color: "#c8d4e4" }}>↕</div>
                </div>
              )}
            </div>
          );
        })}
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
          className="text-[11px] font-bold tracking-[0.1em] uppercase mb-3"
          style={{ color: "#8a9ab5" }}
        >
          Data Sources — Ingested via Data Warehouse (n8n / FTP / API)
        </div>
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCES.map((s) => (
            <div
              key={s}
              className="rounded-[6px]"
              style={{
                fontSize: 12,
                fontWeight: 600,
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
          className="text-[11px] font-bold tracking-[0.1em] uppercase mb-4"
          style={{ color: "#8a9ab5" }}
        >
          Workstream Contributions to Architecture Layers
        </div>
        {workstreams.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-text-muted">
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
                <div className="text-[13px] font-bold text-primary mb-2">{w}</div>
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
    </>
  );
}

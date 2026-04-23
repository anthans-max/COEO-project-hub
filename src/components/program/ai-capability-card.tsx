"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeTag } from "./theme-tag";
import {
  AI_MATURITY_BADGE_VARIANT,
  AI_MATURITY_LABELS,
} from "@/lib/constants";
import type { AiCapability, ArchitectureLayer, ProgramTheme } from "@/lib/types";

interface Props {
  capability: AiCapability;
  themes: ProgramTheme[];
  layers: ArchitectureLayer[];
  onEdit: () => void;
  onDelete: () => void;
}

export function AiCapabilityCard({
  capability,
  themes,
  layers,
  onEdit,
  onDelete,
}: Props) {
  const matchedLayers = capability.architecture_layers
    .map((id) => layers.find((l) => l.layer_id === id))
    .filter((l): l is ArchitectureLayer => !!l);

  return (
    <div
      className="bg-white rounded-card h-full flex flex-col group relative"
      style={{
        border: "1px solid #e8ecf2",
        padding: "18px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onEdit}
          className="text-[10px] font-medium text-white bg-primary px-2 py-[3px] rounded-pill hover:bg-primary/90 flex items-center gap-1"
          title="Edit capability"
        >
          <Pencil size={10} />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-[10px] font-medium text-white bg-destructive px-2 py-[3px] rounded-pill hover:bg-destructive/90 flex items-center gap-1"
          title="Delete capability"
        >
          <Trash2 size={10} />
          Delete
        </button>
      </div>

      <div className="flex items-start justify-between gap-3 mb-2 pr-[110px]">
        <div className="text-[15px] font-bold text-primary leading-[1.35]">
          {capability.title}
        </div>
        <Badge
          status={AI_MATURITY_LABELS[capability.maturity]}
          variant={AI_MATURITY_BADGE_VARIANT[capability.maturity]}
        />
      </div>

      {capability.description && (
        <p
          className="text-sm m-0 leading-[1.6] flex-1"
          style={{ color: "#3a4a5e" }}
        >
          {capability.description}
        </p>
      )}

      {(capability.dependencies.length > 0 || matchedLayers.length > 0) && (
        <div
          className="mt-4 pt-3 flex flex-col gap-2"
          style={{ borderTop: "1px solid #f0f2f6" }}
        >
          {capability.dependencies.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-bold tracking-[0.08em] uppercase"
                style={{ color: "#8a9ab5" }}
              >
                Requires
              </span>
              <div className="flex flex-wrap">
                {capability.dependencies.map((code) => (
                  <ThemeTag key={code} code={code} themes={themes} />
                ))}
              </div>
            </div>
          )}

          {matchedLayers.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-bold tracking-[0.08em] uppercase"
                style={{ color: "#8a9ab5" }}
              >
                Layer
              </span>
              <div className="flex flex-wrap gap-1">
                {matchedLayers.map((layer) => (
                  <span
                    key={layer.layer_id}
                    className="text-xs font-semibold rounded-[4px] inline-block"
                    style={{
                      color: layer.color,
                      background: layer.bg_color,
                      border: `1px solid ${layer.color}30`,
                      padding: "3px 8px",
                    }}
                  >
                    {layer.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

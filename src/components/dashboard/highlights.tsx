"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { EditHighlightDialog } from "./edit-highlight-dialog";
import type { KeyHighlight } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface CardStyle {
  bg: string;
  icon: React.ReactNode;
}

const CARD_STYLES: CardStyle[] = [
  {
    bg: "#E8F5E9",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <path d="M3 8.5L6.5 12L13 4" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    bg: "#E3F2FD",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <circle cx="8" cy="8" r="5" stroke="#2980B9" strokeWidth="1.5" />
        <path d="M8 5.5V8.5L10 10" stroke="#2980B9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    bg: "#F3E5F5",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <path d="M4 12L8 4L12 12" stroke="#7B68EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9.5H10.5" stroke="#7B68EE" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const FALLBACK_STYLE: CardStyle = {
  bg: "#EEEAE2",
  icon: (
    <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
      <circle cx="8" cy="8" r="4" stroke="#6B6560" strokeWidth="1.5" />
    </svg>
  ),
};

const SEP = " • ";

function buildBody(bullets: string[]): string {
  return bullets
    .slice(0, 3)
    .map((b) => b.trim())
    .filter(Boolean)
    .join(SEP);
}

function pickHeadline(currentHeadline: string, projectName: string, firstBullet: string | undefined): string {
  if (currentHeadline.trim().length > 0) return currentHeadline;
  if (projectName.trim().length > 0) return projectName;
  return firstBullet?.trim() ?? "";
}

interface Props {
  initialData: KeyHighlight[];
  projects: ProjectOption[];
}

export function Highlights({ initialData, projects }: Props) {
  const [highlights, setHighlights] = useRealtime<KeyHighlight>(
    "coeo_key_highlights",
    initialData
  );
  const [editing, setEditing] = useState<KeyHighlight | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const toast = useToast();

  const sorted = [...highlights].sort((a, b) => a.sort_order - b.sort_order);

  const handleSave = (updated: KeyHighlight) => {
    setHighlights((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleSync = async (h: KeyHighlight) => {
    if (!h.project_id || syncingId) return;
    setSyncingId(h.id);
    try {
      const supabase = createClient();

      const [{ data: ph }, { data: proj }] = await Promise.all([
        supabase
          .from("coeo_project_highlights")
          .select("bullets")
          .eq("project_id", h.project_id)
          .maybeSingle(),
        supabase
          .from("coeo_projects")
          .select("name")
          .eq("id", h.project_id)
          .maybeSingle(),
      ]);

      const bullets = (ph?.bullets ?? []) as string[];
      if (bullets.length === 0) {
        toast.error("No project highlights to sync yet.");
        return;
      }

      const body = buildBody(bullets);
      const headline = pickHeadline(h.headline, proj?.name ?? "", bullets[0]);

      const { data: updated, error } = await supabase
        .from("coeo_key_highlights")
        .update({ headline, body })
        .eq("id", h.id)
        .select()
        .single();

      if (error || !updated) {
        toast.error("Sync failed");
        return;
      }

      setHighlights((prev) => prev.map((x) => (x.id === updated.id ? (updated as KeyHighlight) : x)));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <>
      <div className="text-[13px] font-semibold text-accent tracking-[0.05em] uppercase mb-2.5">
        Key highlights
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
        {sorted.map((h, index) => {
          const style = CARD_STYLES[h.sort_order] ?? CARD_STYLES[index] ?? FALLBACK_STYLE;
          const isSyncing = syncingId === h.id;
          const bullets = h.body
            .split("•")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s !== "…" && s !== "...");
          return (
            <div
              key={h.id}
              className="p-[14px] border border-border border-l-[3px] border-l-accent rounded-[10px] bg-white group relative h-full"
            >
              {h.project_id && (
                <button
                  onClick={() => handleSync(h)}
                  disabled={isSyncing}
                  className="absolute top-2 right-[52px] opacity-0 group-hover:opacity-100 transition-opacity text-primary bg-white border border-border w-[22px] h-[22px] rounded-pill hover:bg-cream flex items-center justify-center disabled:opacity-100"
                  aria-label={`Sync ${h.category} from project`}
                  title="Sync from project"
                >
                  <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
                </button>
              )}
              <button
                onClick={() => setEditing(h)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-white bg-primary px-2 py-[2px] rounded-pill hover:bg-primary/90"
                aria-label={`Edit ${h.category}`}
              >
                Edit
              </button>
              <div className="flex items-center gap-2 mb-[10px]">
                <div
                  className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: style.bg }}
                >
                  {style.icon}
                </div>
                <div className="text-[12px] text-[#6B6560]">{h.category}</div>
              </div>
              <ul className="flex flex-col gap-[6px]">
                {bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[14px] text-text-primary leading-[1.5]"
                  >
                    <span className="text-accent leading-[1.5] shrink-0">●</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <EditHighlightDialog
        highlight={editing}
        projects={projects}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  );
}

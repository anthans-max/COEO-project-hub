"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatShort, isoDate } from "./lib";
import type { KeyHighlight } from "@/lib/types";

interface HighlightsEditorProps {
  highlights: KeyHighlight[];
}

interface Draft {
  category: string;
  headline: string;
  body: string;
  date: string;
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

function draftFor(h: KeyHighlight): Draft {
  return {
    category: h.category ?? "",
    headline: h.headline ?? "",
    body: h.body ?? "",
    date: h.date ?? "",
  };
}

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

export function HighlightsEditor({ highlights }: HighlightsEditorProps) {
  const [items, setItems] = useState<KeyHighlight[]>(highlights);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    setItems(highlights);
    setDrafts({});
  }, [highlights]);

  const setDraftField = (id: string, patch: Partial<Draft>) => {
    setDrafts((prev) => {
      const item = items.find((h) => h.id === id);
      const current = prev[id] ?? (item ? draftFor(item) : null);
      if (!current) return prev;
      return { ...prev, [id]: { ...current, ...patch } };
    });
  };

  const save = async (id: string) => {
    const item = items.find((h) => h.id === id);
    if (!item) return;
    const draft = drafts[id] ?? draftFor(item);
    setSavingId(id);
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("coeo_key_highlights")
      .update({
        category: draft.category.trim() || "Uncategorised",
        headline: draft.headline,
        body: draft.body,
        date: draft.date || null,
        updated_at: nowIso,
      })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Failed to save highlight");
      return;
    }
    setItems((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              category: draft.category.trim() || "Uncategorised",
              headline: draft.headline,
              body: draft.body,
              date: draft.date || null,
              updated_at: nowIso,
            }
          : h
      )
    );
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const del = async (id: string) => {
    if (!window.confirm("Delete this highlight?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_key_highlights")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete highlight");
      return;
    }
    setItems((prev) => prev.filter((h) => h.id !== id));
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const addNew = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_key_highlights")
      .insert({
        category: "New highlight",
        headline: "",
        body: "",
        date: isoDate(new Date()),
        sort_order: items.length,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Failed to add highlight");
      return;
    }
    setItems((prev) => [...prev, data as KeyHighlight]);
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

      setItems((prev) => prev.map((x) => (x.id === updated.id ? (updated as KeyHighlight) : x)));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <>
      <div className="text-[13px] font-semibold text-accent tracking-[0.05em] uppercase mb-2.5">
        Key highlights
      </div>
      <div className="highlights-grid">
        {items.map((h, index) => {
          const draft = drafts[h.id] ?? draftFor(h);
          const isSyncing = syncingId === h.id;
          const style = CARD_STYLES[h.sort_order] ?? CARD_STYLES[index] ?? FALLBACK_STYLE;
          const bullets = h.body
            .split("•")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s !== "…" && s !== "...");
          return (
            <div
              key={h.id}
              className="p-[14px] border border-border border-l-[3px] border-l-accent rounded-[10px] bg-white group relative h-full"
            >
              <div className="card-view read-only">
                {h.project_id && (
                  <button
                    type="button"
                    onClick={() => handleSync(h)}
                    disabled={isSyncing}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary bg-white border border-border w-[22px] h-[22px] rounded-pill hover:bg-cream flex items-center justify-center disabled:opacity-100"
                    aria-label={`Sync ${h.category} from project`}
                    title="Sync from project"
                  >
                    <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
                  </button>
                )}
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
                {h.date ? (
                  <div className="hl-date">{formatShort(h.date)}</div>
                ) : null}
              </div>

              <div className="card-edit edit-only">
                <button
                  type="button"
                  className="card-delete-btn"
                  onClick={() => del(h.id)}
                  aria-label="Delete highlight"
                >
                  ×
                </button>
                <input
                  type="text"
                  className="inline-input hl-project-input"
                  value={draft.category}
                  onChange={(e) =>
                    setDraftField(h.id, { category: e.target.value })
                  }
                  placeholder="Category"
                />
                <input
                  type="text"
                  className="inline-input hl-headline-input"
                  value={draft.headline}
                  onChange={(e) =>
                    setDraftField(h.id, { headline: e.target.value })
                  }
                  placeholder="Headline"
                />
                <textarea
                  className="inline-textarea hl-body-input"
                  rows={3}
                  value={draft.body}
                  onChange={(e) =>
                    setDraftField(h.id, { body: e.target.value })
                  }
                  placeholder="Body"
                />
                <input
                  type="date"
                  className="inline-input hl-date-input"
                  value={draft.date}
                  onChange={(e) => setDraftField(h.id, { date: e.target.value })}
                />
                <div className="card-edit-actions">
                  <button
                    type="button"
                    className="card-save-btn"
                    disabled={savingId === h.id}
                    onClick={() => save(h.id)}
                  >
                    {savingId === h.id ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="card-add-btn edit-only"
          onClick={addNew}
        >
          + Add highlight
        </button>
      </div>
    </>
  );
}

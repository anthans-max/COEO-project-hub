"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { HIGHLIGHT_COLOURS, formatShort, isoDate } from "./lib";
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

function draftFor(h: KeyHighlight): Draft {
  return {
    category: h.category ?? "",
    headline: h.headline ?? "",
    body: h.body ?? "",
    date: h.date ?? "",
  };
}

export function HighlightsEditor({ highlights }: HighlightsEditorProps) {
  const [items, setItems] = useState<KeyHighlight[]>(highlights);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
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

  return (
    <div className="highlights-grid">
      {items.map((h, i) => {
        const draft = drafts[h.id] ?? draftFor(h);
        return (
          <div
            key={h.id}
            className={`highlight-card ${HIGHLIGHT_COLOURS[i % 4]}`}
          >
            <div className="card-view read-only">
              <div className="hl-project">{h.category}</div>
              <div className="hl-text">
                {h.headline ? <strong>{h.headline}. </strong> : null}
                {h.body}
              </div>
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
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatBadgeDay, formatBadgeMonth } from "./lib";
import type { MeetingNote } from "@/lib/types";

interface MeetingsEditorProps {
  meetings: MeetingNote[];
}

export function MeetingsEditor({ meetings }: MeetingsEditorProps) {
  const [items, setItems] = useState<MeetingNote[]>(meetings);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    setItems(meetings);
    setDrafts({});
  }, [meetings]);

  const setDraft = (id: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const save = async (id: string) => {
    const item = items.find((m) => m.id === id);
    if (!item) return;
    const draft = (drafts[id] ?? item.summary ?? "").trim();
    setSavingId(id);
    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("coeo_meeting_notes")
      .update({
        summary: draft.length > 0 ? draft : null,
        updated_at: nowIso,
      })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error("Failed to save meeting summary");
      return;
    }
    setItems((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, summary: draft.length > 0 ? draft : null, updated_at: nowIso }
          : m
      )
    );
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div>
      {items.map((mtg) => {
        const draft = drafts[mtg.id] ?? mtg.summary ?? "";
        return (
          <div key={mtg.id} className="meeting-row">
            <div className="mtg-date">
              {mtg.date ? (
                <>
                  <div className="d">{formatBadgeDay(mtg.date)}</div>
                  <div className="m">{formatBadgeMonth(mtg.date)}</div>
                </>
              ) : (
                <>
                  <div className="d">—</div>
                  <div className="m">TBC</div>
                </>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="mtg-title">{mtg.title}</div>

              <div className="read-only">
                {(mtg.summary?.trim() || mtg.notes?.trim()) ? (
                  <div className="mtg-summary">
                    {mtg.summary?.trim() || mtg.notes}
                  </div>
                ) : null}
              </div>

              <div className="edit-only mtg-edit">
                <textarea
                  className="inline-textarea mtg-summary-input"
                  rows={3}
                  value={draft}
                  onChange={(e) => setDraft(mtg.id, e.target.value)}
                  placeholder="Meeting summary…"
                />
                <button
                  type="button"
                  className="card-save-btn"
                  disabled={savingId === mtg.id}
                  onClick={() => save(mtg.id)}
                >
                  {savingId === mtg.id ? "Saving…" : "Save"}
                </button>
              </div>

              {mtg.attendees ? (
                <div className="mtg-att">Attendees: {mtg.attendees}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

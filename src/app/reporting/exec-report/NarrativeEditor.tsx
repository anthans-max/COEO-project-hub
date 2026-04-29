"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { ProgramTheme, ReportNarrative } from "@/lib/types";

interface NarrativeEditorProps {
  themes: ProgramTheme[];
  narrative: ReportNarrative | null;
  weekStart: string;
}

export function NarrativeEditor({
  themes,
  narrative,
  weekStart,
}: NarrativeEditorProps) {
  const [focusedCodes, setFocusedCodes] = useState<string[]>(
    narrative?.focused_theme_codes ?? []
  );
  const [commentary, setCommentary] = useState<string>(
    narrative?.commentary ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    setFocusedCodes(narrative?.focused_theme_codes ?? []);
    setCommentary(narrative?.commentary ?? "");
    setSavedAt(null);
  }, [narrative, weekStart]);

  const toggle = (code: string) => {
    setFocusedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const trimmed = commentary.trim();
    const { error } = await supabase
      .from("coeo_report_narrative")
      .upsert(
        {
          report_week_start: weekStart,
          focused_theme_codes: focusedCodes,
          commentary: trimmed.length > 0 ? trimmed : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "report_week_start" }
      );
    setSaving(false);
    if (error) {
      toast.error("Failed to save narrative");
      return;
    }
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  return (
    <div>
      <div className="narrative-themes-grid">
        {themes.map((t) => {
          const focused = focusedCodes.includes(t.code);
          return (
            <button
              key={t.code}
              type="button"
              className={`narrative-theme-pill${focused ? " focused" : ""}`}
              onClick={() => toggle(t.code)}
            >
              <span className="pill-code">{t.code}</span>
              <span className="pill-name">{t.title}</span>
            </button>
          );
        })}
      </div>

      <div className="narrative-commentary">
        <label className="narrative-label">Commentary</label>
        <textarea
          value={commentary}
          onChange={(e) => setCommentary(e.target.value)}
          rows={4}
          className="narrative-commentary-input"
          placeholder="A short paragraph of context for the focused themes…"
        />
      </div>

      <div className="narrative-actions">
        <button
          type="button"
          className="narrative-save-btn"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {savedAt ? <span className="narrative-saved-msg">Saved</span> : null}
      </div>
    </div>
  );
}

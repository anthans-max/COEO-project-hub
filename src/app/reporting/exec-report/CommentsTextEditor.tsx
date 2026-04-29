"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { ReportNarrative } from "@/lib/types";

interface CommentsTextEditorProps {
  narrative: ReportNarrative | null;
  weekStart: string;
}

export function CommentsTextEditor({
  narrative,
  weekStart,
}: CommentsTextEditorProps) {
  const [commentsText, setCommentsText] = useState<string>(
    narrative?.comments_text ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    setCommentsText(narrative?.comments_text ?? "");
    setSavedAt(null);
  }, [narrative, weekStart]);

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const trimmed = commentsText.trim();
    const { error } = await supabase
      .from("coeo_report_narrative")
      .upsert(
        {
          report_week_start: weekStart,
          comments_text: trimmed.length > 0 ? trimmed : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "report_week_start" }
      );
    setSaving(false);
    if (error) {
      toast.error("Failed to save comments");
      return;
    }
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  return (
    <div>
      <div className="narrative-commentary">
        <textarea
          value={commentsText}
          onChange={(e) => setCommentsText(e.target.value)}
          rows={4}
          className="narrative-commentary-input"
          placeholder="Anything else worth flagging this week…"
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

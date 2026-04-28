"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/browser";
import type { ProjectHighlight } from "@/lib/types";

interface Props {
  projectId: string;
  initialHighlight: ProjectHighlight | null;
}

export function ProjectHighlights({ projectId, initialHighlight }: Props) {
  const [highlight, setHighlight] = useState<ProjectHighlight | null>(initialHighlight);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const startEdit = () => {
    setDraft((highlight?.bullets ?? []).join("\n"));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft("");
  };

  const save = async () => {
    const bullets = draft
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_project_highlights")
      .upsert(
        { project_id: projectId, bullets, updated_at: new Date().toISOString() },
        { onConflict: "project_id" }
      )
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error("Failed to save highlights");
      return;
    }

    setHighlight(data as ProjectHighlight);
    setEditing(false);
    setDraft("");
  };

  const bullets = highlight?.bullets ?? [];

  return (
    <Card className="mb-4 border-l-[3px] border-l-accent">
      <div className="flex items-start justify-between gap-4 px-5 py-[14px]">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-accent tracking-[0.07em] uppercase mb-2">
            Key highlights
          </div>
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              placeholder="One bullet per line — keep to 3–5"
              className="w-full border border-border rounded-card px-3 py-2 text-[14px] text-text-primary leading-[1.5] outline-none focus:border-accent resize-y"
              autoFocus
            />
          ) : bullets.length === 0 ? (
            <p className="text-[14px] text-text-muted leading-[1.5]">
              No highlights added yet.
            </p>
          ) : (
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
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={startEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { KeyHighlight } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  projects: ProjectOption[];
  nextSortOrder: number;
  onClose: () => void;
  onAdd: (created: KeyHighlight) => void;
}

const EMPTY_FORM = { category: "", headline: "", body: "", project_id: "" };

export function AddHighlightDialog({ open, projects, nextSortOrder, onClose, onAdd }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrorMsg(null);
    }
  }, [open]);

  if (!open) return null;

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSave =
    form.category.trim().length > 0 &&
    form.headline.trim().length > 0 &&
    form.body.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      category: form.category.trim(),
      headline: form.headline.trim(),
      body: form.body.trim(),
      project_id: form.project_id || null,
      sort_order: nextSortOrder,
    };

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_key_highlights")
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (error || !data) {
      setErrorMsg("Couldn't save. Check your connection and try again.");
      toast.error("Failed to add highlight");
      return;
    }

    onAdd(data as KeyHighlight);
    onClose();
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";
  const labelClass =
    "text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">Add highlight</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-[13px] rounded-card px-3 py-2">
              {errorMsg}
            </div>
          )}

          <div>
            <label className={labelClass}>Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Headline</label>
            <input
              type="text"
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Body</label>
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Linked project</label>
            <select
              value={form.project_id}
              onChange={(e) => set("project_id", e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !canSave}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { ProgramTheme } from "@/lib/types";

interface Props {
  open: boolean;
  theme: ProgramTheme | null;
  onClose: () => void;
  onSave: (theme: ProgramTheme) => void;
  nextSortOrder: number;
}

const blankForm = {
  code: "",
  title: "",
  icon: "",
  color: "#1a6b5c",
  bg_color: "#f0faf7",
  description: "",
  workstreams: "",
  outcomes: "",
  sort_order: 0,
};

export function ThemeDialog({ open, theme, onClose, onSave, nextSortOrder }: Props) {
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (theme) {
      setForm({
        code: theme.code,
        title: theme.title,
        icon: theme.icon ?? "",
        color: theme.color ?? "#1a6b5c",
        bg_color: theme.bg_color ?? "#f0faf7",
        description: theme.description ?? "",
        workstreams: theme.workstreams.join("\n"),
        outcomes: theme.outcomes.join("\n"),
        sort_order: theme.sort_order,
      });
    } else {
      setForm({ ...blankForm, sort_order: nextSortOrder });
    }
  }, [open, theme, nextSortOrder]);

  if (!open) return null;

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) return;
    setSaving(true);

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      icon: form.icon.trim() || null,
      color: form.color.trim() || null,
      bg_color: form.bg_color.trim() || null,
      description: form.description.trim() || null,
      workstreams: form.workstreams
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      outcomes: form.outcomes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
    };

    const supabase = createClient();
    if (theme) {
      const { data, error } = await supabase
        .from("coeo_program_themes")
        .update(payload)
        .eq("id", theme.id)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to save theme");
        return;
      }
      onSave(data as ProgramTheme);
    } else {
      const { data, error } = await supabase
        .from("coeo_program_themes")
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to add theme");
        return;
      }
      onSave(data as ProgramTheme);
    }
    onClose();
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-card border border-border w-[560px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">
            {theme ? `Edit ${theme.code}` : "Add theme"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="T-08"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-[80px_120px_120px_1fr] gap-3 items-end">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Icon
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                placeholder="⬡"
                className={inputClass}
                maxLength={4}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  className="w-8 h-8 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                BG Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.bg_color}
                  onChange={(e) => set("bg_color", e.target.value)}
                  className="w-8 h-8 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={form.bg_color}
                  onChange={(e) => set("bg_color", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Sort order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Workstreams (one per line)
            </label>
            <textarea
              value={form.workstreams}
              onChange={(e) => set("workstreams", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder={"Data Warehouse\nCustomer Portal"}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Key outcomes (one per line)
            </label>
            <textarea
              value={form.outcomes}
              onChange={(e) => set("outcomes", e.target.value)}
              rows={4}
              className={inputClass}
              placeholder={"Outcome one\nOutcome two"}
            />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.code.trim() || !form.title.trim()}>
              {saving ? "Saving..." : theme ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

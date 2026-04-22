"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { ArchitectureLayer } from "@/lib/types";

interface Props {
  open: boolean;
  layer: ArchitectureLayer | null;
  onClose: () => void;
  onSave: (layer: ArchitectureLayer) => void;
  nextSortOrder: number;
}

const blankForm = {
  layer_id: "",
  label: "",
  color: "#1e4d8c",
  bg_color: "#eef3fc",
  modules: "",
  note: "",
  decision_codes: "",
  sort_order: 0,
};

export function LayerDialog({ open, layer, onClose, onSave, nextSortOrder }: Props) {
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (layer) {
      setForm({
        layer_id: layer.layer_id,
        label: layer.label,
        color: layer.color,
        bg_color: layer.bg_color,
        modules: layer.modules.join("\n"),
        note: layer.note ?? "",
        decision_codes: layer.decision_codes.join("\n"),
        sort_order: layer.sort_order,
      });
    } else {
      setForm({ ...blankForm, sort_order: nextSortOrder });
    }
  }, [open, layer, nextSortOrder]);

  if (!open) return null;

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.layer_id.trim() || !form.label.trim()) return;
    setSaving(true);

    const payload = {
      layer_id: form.layer_id.trim(),
      label: form.label.trim(),
      color: form.color.trim(),
      bg_color: form.bg_color.trim(),
      modules: form.modules
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      note: form.note.trim() || null,
      decision_codes: form.decision_codes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
    };

    const supabase = createClient();
    if (layer) {
      const { data, error } = await supabase
        .from("coeo_architecture_layers")
        .update(payload)
        .eq("id", layer.id)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to save layer");
        return;
      }
      onSave(data as ArchitectureLayer);
    } else {
      const { data, error } = await supabase
        .from("coeo_architecture_layers")
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to add layer");
        return;
      }
      onSave(data as ArchitectureLayer);
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
            {layer ? `Edit ${layer.label}` : "Add layer"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Layer ID
              </label>
              <input
                type="text"
                value={form.layer_id}
                onChange={(e) => set("layer_id", e.target.value)}
                placeholder="middleware"
                className={inputClass}
                disabled={!!layer}
                autoFocus={!layer}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Label
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                className={inputClass}
                autoFocus={!!layer}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1fr_120px] gap-3 items-end">
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
              Modules (one per line)
            </label>
            <textarea
              value={form.modules}
              onChange={(e) => set("modules", e.target.value)}
              rows={5}
              className={inputClass}
              placeholder={"n8n Orchestration\nApp Server"}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Note
            </label>
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Decision codes (one per line)
            </label>
            <textarea
              value={form.decision_codes}
              onChange={(e) => set("decision_codes", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder={"OI-002\nOI-005"}
            />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.layer_id.trim() || !form.label.trim()}>
              {saving ? "Saving..." : layer ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

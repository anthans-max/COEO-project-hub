"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import {
  AI_MATURITIES,
  AI_MATURITY_LABELS,
  type AiMaturity,
} from "@/lib/constants";
import type { AiCapability, ArchitectureLayer, ProgramTheme } from "@/lib/types";

interface Props {
  open: boolean;
  capability: AiCapability | null;
  themes: ProgramTheme[];
  layers: ArchitectureLayer[];
  onClose: () => void;
  onSave: (capability: AiCapability) => void;
  nextSortOrder: number;
}

type FormState = {
  title: string;
  description: string;
  theme_code: string;
  maturity: AiMaturity;
  dependencies: string[];
  architecture_layers: string[];
  sort_order: number;
};

const blank: FormState = {
  title: "",
  description: "",
  theme_code: "",
  maturity: "exploratory",
  dependencies: [],
  architecture_layers: [],
  sort_order: 0,
};

export function AiCapabilityDialog({
  open,
  capability,
  themes,
  layers,
  onClose,
  onSave,
  nextSortOrder,
}: Props) {
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (capability) {
      setForm({
        title: capability.title,
        description: capability.description ?? "",
        theme_code: capability.theme_code,
        maturity: capability.maturity,
        dependencies: capability.dependencies,
        architecture_layers: capability.architecture_layers,
        sort_order: capability.sort_order,
      });
    } else {
      setForm({
        ...blank,
        theme_code: themes[0]?.code ?? "",
        sort_order: nextSortOrder,
      });
    }
  }, [open, capability, themes, nextSortOrder]);

  if (!open) return null;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDependency = (code: string) => {
    setForm((prev) => ({
      ...prev,
      dependencies: prev.dependencies.includes(code)
        ? prev.dependencies.filter((c) => c !== code)
        : [...prev.dependencies, code],
    }));
  };

  const toggleLayer = (layerId: string) => {
    setForm((prev) => ({
      ...prev,
      architecture_layers: prev.architecture_layers.includes(layerId)
        ? prev.architecture_layers.filter((l) => l !== layerId)
        : [...prev.architecture_layers, layerId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.theme_code) return;
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      theme_code: form.theme_code,
      maturity: form.maturity,
      // Defensive: if a dep was selected and then the theme was changed to
      // match that code, drop it — a capability shouldn't depend on its own theme.
      dependencies: form.dependencies.filter((c) => c !== form.theme_code),
      architecture_layers: form.architecture_layers,
      sort_order: Number(form.sort_order) || 0,
    };

    const supabase = createClient();
    if (capability) {
      const { data, error } = await supabase
        .from("coeo_ai_capabilities")
        .update(payload)
        .eq("id", capability.id)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to save capability");
        return;
      }
      onSave(data as AiCapability);
    } else {
      const { data, error } = await supabase
        .from("coeo_ai_capabilities")
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to add capability");
        return;
      }
      onSave(data as AiCapability);
    }
    onClose();
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";

  const dependencyThemes = themes.filter((t) => t.code !== form.theme_code);

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
            {capability ? `Edit ${capability.title}` : "Add capability"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass}
              autoFocus
            />
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

          <div className="grid grid-cols-[1fr_1fr_100px] gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Theme
              </label>
              <select
                value={form.theme_code}
                onChange={(e) => set("theme_code", e.target.value)}
                className={inputClass}
              >
                {themes.length === 0 && <option value="">No themes</option>}
                {themes.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.code} — {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Maturity
              </label>
              <select
                value={form.maturity}
                onChange={(e) => set("maturity", e.target.value as AiMaturity)}
                className={inputClass}
              >
                {AI_MATURITIES.map((m) => (
                  <option key={m} value={m}>
                    {AI_MATURITY_LABELS[m]}
                  </option>
                ))}
              </select>
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
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-2 block">
              Dependencies
            </label>
            <div className="flex flex-col gap-[6px] max-h-[180px] overflow-y-auto pr-2">
              {dependencyThemes.length === 0 ? (
                <div className="text-[13px] text-text-muted">
                  No other themes available.
                </div>
              ) : (
                dependencyThemes.map((t) => (
                  <label
                    key={t.code}
                    className="flex items-center gap-2 text-[14px] text-primary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.dependencies.includes(t.code)}
                      onChange={() => toggleDependency(t.code)}
                      className="accent-primary"
                    />
                    <span
                      className="font-semibold"
                      style={{ color: t.color ?? "#5a6a7e" }}
                    >
                      {t.code}
                    </span>
                    <span>{t.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-2 block">
              Architecture layers
            </label>
            <div className="flex flex-col gap-[6px] max-h-[180px] overflow-y-auto pr-2">
              {layers.length === 0 ? (
                <div className="text-[13px] text-text-muted">
                  No layers defined yet.
                </div>
              ) : (
                layers.map((l) => (
                  <label
                    key={l.layer_id}
                    className="flex items-center gap-2 text-[14px] text-primary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.architecture_layers.includes(l.layer_id)}
                      onChange={() => toggleLayer(l.layer_id)}
                      className="accent-primary"
                    />
                    <span className="font-semibold" style={{ color: l.color }}>
                      {l.label}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.title.trim() || !form.theme_code}
            >
              {saving ? "Saving..." : capability ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

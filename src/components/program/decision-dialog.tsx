"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { DECISION_STATUSES, DECISION_STATUS_LABELS } from "@/lib/constants";
import type { ProgramDecision, ProgramTheme } from "@/lib/types";

interface Props {
  open: boolean;
  decision: ProgramDecision | null;
  themes: ProgramTheme[];
  onClose: () => void;
  onSave: (decision: ProgramDecision) => void;
  nextSortOrder: number;
}

type FormState = {
  code: string;
  title: string;
  detail: string;
  impact: string;
  owner: string;
  target_quarter: string;
  theme_codes: string[];
  status: ProgramDecision["status"];
  sort_order: number;
};

const blank: FormState = {
  code: "",
  title: "",
  detail: "",
  impact: "",
  owner: "",
  target_quarter: "Q2 2026",
  theme_codes: [],
  status: "open",
  sort_order: 0,
};

export function DecisionDialog({
  open,
  decision,
  themes,
  onClose,
  onSave,
  nextSortOrder,
}: Props) {
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (decision) {
      setForm({
        code: decision.code,
        title: decision.title,
        detail: decision.detail ?? "",
        impact: decision.impact ?? "",
        owner: decision.owner ?? "",
        target_quarter: decision.target_quarter ?? "",
        theme_codes: decision.theme_codes,
        status: decision.status,
        sort_order: decision.sort_order,
      });
    } else {
      setForm({ ...blank, sort_order: nextSortOrder });
    }
  }, [open, decision, nextSortOrder]);

  if (!open) return null;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTheme = (code: string) => {
    setForm((prev) => ({
      ...prev,
      theme_codes: prev.theme_codes.includes(code)
        ? prev.theme_codes.filter((c) => c !== code)
        : [...prev.theme_codes, code],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) return;
    setSaving(true);

    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      detail: form.detail.trim() || null,
      impact: form.impact.trim() || null,
      owner: form.owner.trim() || null,
      target_quarter: form.target_quarter.trim() || null,
      theme_codes: form.theme_codes,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
    };

    const supabase = createClient();
    if (decision) {
      const { data, error } = await supabase
        .from("coeo_program_decisions")
        .update(payload)
        .eq("id", decision.id)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to save decision");
        return;
      }
      onSave(data as ProgramDecision);
    } else {
      const { data, error } = await supabase
        .from("coeo_program_decisions")
        .insert(payload)
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to add decision");
        return;
      }
      onSave(data as ProgramDecision);
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
            {decision ? `Edit ${decision.code}` : "Add decision"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="OI-010"
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

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Detail
            </label>
            <textarea
              value={form.detail}
              onChange={(e) => set("detail", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Impact if unresolved
            </label>
            <textarea
              value={form.impact}
              onChange={(e) => set("impact", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Owner
              </label>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => set("owner", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Target quarter
              </label>
              <input
                type="text"
                value={form.target_quarter}
                onChange={(e) => set("target_quarter", e.target.value)}
                placeholder="Q2 2026"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as ProgramDecision["status"])
                }
                className={inputClass}
              >
                {DECISION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DECISION_STATUS_LABELS[s]}
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
              Linked themes
            </label>
            <div className="flex flex-col gap-[6px] max-h-[180px] overflow-y-auto pr-2">
              {themes.length === 0 ? (
                <div className="text-[13px] text-text-muted">No themes defined yet.</div>
              ) : (
                themes.map((t) => (
                  <label
                    key={t.code}
                    className="flex items-center gap-2 text-[14px] text-primary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.theme_codes.includes(t.code)}
                      onChange={() => toggleTheme(t.code)}
                      className="accent-primary"
                    />
                    <span className="font-semibold" style={{ color: t.color ?? "#5a6a7e" }}>
                      {t.code}
                    </span>
                    <span>{t.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.code.trim() || !form.title.trim()}>
              {saving ? "Saving..." : decision ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { PmoTrackerRow } from "@/lib/types";

const PMO_STATUSES = ["In Process", "Done", "Hold", "Assess", "Scope"] as const;

interface Props {
  row: PmoTrackerRow | null;
  onClose: () => void;
  onSave: (updated: PmoTrackerRow) => void;
}

interface FormState {
  item_no: string;
  category: string;
  project_description: string;
  project_objectives: string;
  timing: string;
  rcg_owner: string;
  coeo_support: string;
  third_party_support: string;
  project_start: string;
  project_complete: string;
  project_status: string;
  comments_updates: string;
}

const EMPTY_FORM: FormState = {
  item_no: "",
  category: "",
  project_description: "",
  project_objectives: "",
  timing: "",
  rcg_owner: "",
  coeo_support: "",
  third_party_support: "",
  project_start: "",
  project_complete: "",
  project_status: "",
  comments_updates: "",
};

export function EditPmoTrackerDialog({ row, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (row) {
      setForm({
        item_no: row.item_no !== null ? String(row.item_no) : "",
        category: row.category ?? "",
        project_description: row.project_description ?? "",
        project_objectives: row.project_objectives ?? "",
        timing: row.timing ?? "",
        rcg_owner: row.rcg_owner ?? "",
        coeo_support: row.coeo_support ?? "",
        third_party_support: row.third_party_support ?? "",
        project_start: row.project_start ?? "",
        project_complete: row.project_complete ?? "",
        project_status: row.project_status ?? "",
        comments_updates: row.comments_updates ?? "",
      });
    }
  }, [row]);

  if (!row) return null;

  const set = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const trimmedItemNo = form.item_no.trim();
    const itemNoParsed = trimmedItemNo === "" ? null : Number(trimmedItemNo);
    const itemNoValid =
      itemNoParsed === null || (Number.isFinite(itemNoParsed) && Number.isInteger(itemNoParsed));
    if (!itemNoValid) {
      setSaving(false);
      toast.error("Item # must be a whole number");
      return;
    }

    const textOrNull = (v: string) => (v.trim().length === 0 ? null : v.trim());

    const payload = {
      item_no: itemNoParsed as number | null,
      category: textOrNull(form.category),
      project_description: textOrNull(form.project_description),
      project_objectives: textOrNull(form.project_objectives),
      timing: textOrNull(form.timing),
      rcg_owner: textOrNull(form.rcg_owner),
      coeo_support: textOrNull(form.coeo_support),
      third_party_support: textOrNull(form.third_party_support),
      project_start: textOrNull(form.project_start),
      project_complete: textOrNull(form.project_complete),
      project_status: textOrNull(form.project_status),
      comments_updates: form.comments_updates.length === 0 ? null : form.comments_updates,
    };

    const updated: PmoTrackerRow = { ...row, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_pmo_tracker")
      .update(payload)
      .eq("id", row.id);

    setSaving(false);
    if (error) {
      onSave(row);
      toast.error("Failed to save PMO tracker item");
    }
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";
  const labelClass =
    "text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-card border border-border w-[640px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">Edit PMO tracker item</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div>
              <label className={labelClass}>Item #</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.item_no}
                onChange={(e) => set("item_no", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Project Description</label>
            <textarea
              value={form.project_description}
              onChange={(e) => set("project_description", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.project_status}
                onChange={(e) => set("project_status", e.target.value)}
                className={inputClass}
              >
                <option value="">—</option>
                {PMO_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Target Complete</label>
              <input
                type="text"
                value={form.project_complete}
                onChange={(e) => set("project_complete", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>RCG Owner</label>
              <input
                type="text"
                value={form.rcg_owner}
                onChange={(e) => set("rcg_owner", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>COEO Support</label>
              <input
                type="text"
                value={form.coeo_support}
                onChange={(e) => set("coeo_support", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Comments / Updates</label>
            <textarea
              value={form.comments_updates}
              onChange={(e) => set("comments_updates", e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>

          <div className="border-t border-border mt-2 pt-3 flex flex-col gap-3">
            <div className="text-[11px] font-semibold text-text-secondary tracking-[0.1em] uppercase">
              More details
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Project Start</label>
                <input
                  type="text"
                  value={form.project_start}
                  onChange={(e) => set("project_start", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Timing</label>
                <input
                  type="text"
                  value={form.timing}
                  onChange={(e) => set("timing", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>3rd Party Support</label>
              <input
                type="text"
                value={form.third_party_support}
                onChange={(e) => set("third_party_support", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Project Objectives</label>
              <textarea
                value={form.project_objectives}
                onChange={(e) => set("project_objectives", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

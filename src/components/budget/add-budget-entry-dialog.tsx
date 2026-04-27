"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { BUDGET_ENTRY_TYPES, type BudgetEntryType } from "@/lib/constants";
import type { BudgetEntry } from "@/lib/types";

interface Props {
  open: boolean;
  projectId: string;
  defaults?: { entry_type?: BudgetEntryType; period_year?: number; period_month?: number };
  onClose: () => void;
  onAdd: (entry: BudgetEntry) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function AddBudgetEntryDialog({ open, projectId, defaults, onClose, onAdd }: Props) {
  const today = new Date();
  const [form, setForm] = useState({
    entry_type: (defaults?.entry_type ?? "actual") as BudgetEntryType,
    period_year: String(defaults?.period_year ?? today.getFullYear()),
    period_month: String(defaults?.period_month ?? today.getMonth() + 1),
    amount: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const reset = () =>
    setForm({
      entry_type: "actual",
      period_year: String(today.getFullYear()),
      period_month: String(today.getMonth() + 1),
      amount: "",
      notes: "",
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(form.period_year, 10);
    const month = parseInt(form.period_month, 10);
    const amount = parseFloat(form.amount);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(amount)) {
      toast.error("Year, month, and amount are required");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_budget_entries")
      .insert({
        project_id: projectId,
        entry_type: form.entry_type,
        period_year: year,
        period_month: month,
        amount,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("An entry already exists for that month and type — edit it instead.");
      } else {
        toast.error("Failed to add entry");
      }
      return;
    }
    onAdd(data);
    reset();
    onClose();
  };

  const input = "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";
  const tabBase = "px-3 py-1.5 text-[13px] font-medium rounded-card border transition-colors";
  const tabActive = "border-accent bg-accent/10 text-primary";
  const tabIdle = "border-border bg-white text-text-secondary hover:text-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">New budget entry</h3>
        </div>
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Type</label>
            <div className="flex gap-2">
              {BUDGET_ENTRY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${tabBase} ${form.entry_type === t ? tabActive : tabIdle}`}
                  onClick={() => set("entry_type", t)}
                >
                  {t === "actual" ? "Actual" : "Forecast"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Year</label>
              <input
                type="number"
                step="1"
                value={form.period_year}
                onChange={(e) => set("period_year", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Month</label>
              <select
                value={form.period_month}
                onChange={(e) => set("period_month", e.target.value)}
                className={input}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Amount</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              className={input}
              placeholder="0.00"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={input} />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Adding..." : "Add"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

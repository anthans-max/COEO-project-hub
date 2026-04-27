"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { BUDGET_ENTRY_TYPES, type BudgetEntryType } from "@/lib/constants";
import type { BudgetEntry } from "@/lib/types";

interface Props {
  entry: BudgetEntry | null;
  onClose: () => void;
  onSave: (updated: BudgetEntry) => void;
  onDelete?: (id: string) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function EditBudgetEntryDialog({ entry, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    entry_type: "actual" as BudgetEntryType,
    period_year: "",
    period_month: "",
    amount: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (entry) {
      setForm({
        entry_type: entry.entry_type,
        period_year: String(entry.period_year),
        period_month: String(entry.period_month),
        amount: String(entry.amount ?? ""),
        notes: entry.notes ?? "",
      });
    }
  }, [entry]);

  if (!entry) return null;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

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
    const payload = {
      entry_type: form.entry_type,
      period_year: year,
      period_month: month,
      amount,
      notes: form.notes.trim() || null,
    };
    const updated: BudgetEntry = { ...entry, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_budget_entries")
      .update(payload)
      .eq("id", entry.id);
    setSaving(false);
    if (error) {
      onSave(entry);
      if (error.code === "23505") {
        toast.error("An entry already exists for that month and type.");
      } else {
        toast.error("Failed to save entry");
      }
    }
  };

  const input = "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";
  const tabBase = "px-3 py-1.5 text-[13px] font-medium rounded-card border transition-colors";
  const tabActive = "border-accent bg-accent/10 text-primary";
  const tabIdle = "border-border bg-white text-text-secondary hover:text-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">Edit budget entry</h3>
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
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={input} />
          </div>
          <div className="flex justify-between items-center mt-3">
            <div>
              {onDelete && (
                <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(entry.id)}>Delete</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

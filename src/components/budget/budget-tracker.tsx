"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddBudgetEntryDialog } from "./add-budget-entry-dialog";
import { EditBudgetEntryDialog } from "./edit-budget-entry-dialog";
import { useBudgetEntries } from "@/lib/hooks/use-budget-entries";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { BudgetEntry } from "@/lib/types";
import type { BudgetEntryType } from "@/lib/constants";

interface Props {
  projectId: string;
  budgetAmount: number | null;
  initialEntries: BudgetEntry[];
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const moneyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatMoney = (n: number) => moneyFmt.format(n);

const ymKey = (y: number, m: number) => y * 100 + m;

export function BudgetTracker({ projectId, budgetAmount, initialEntries }: Props) {
  const [allEntries, setEntries] = useBudgetEntries(initialEntries);
  const entries = allEntries.filter((e) => e.project_id === projectId);

  const [budget, setBudget] = useState<number | null>(budgetAmount);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(budgetAmount != null ? String(budgetAmount) : "");

  const [showAdd, setShowAdd] = useState(false);
  const [addDefaults, setAddDefaults] = useState<{
    entry_type?: BudgetEntryType;
    period_year?: number;
    period_month?: number;
  }>({});
  const [editing, setEditing] = useState<BudgetEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toast = useToast();

  const today = new Date();
  const currentY = today.getFullYear();
  const currentM = today.getMonth() + 1;
  const todayKey = ymKey(currentY, currentM);

  const actualsToDate = entries
    .filter((e) => e.entry_type === "actual" && ymKey(e.period_year, e.period_month) <= todayKey)
    .reduce((s, e) => s + Number(e.amount), 0);
  const forecastRemaining = entries
    .filter((e) => e.entry_type === "forecast" && ymKey(e.period_year, e.period_month) > todayKey)
    .reduce((s, e) => s + Number(e.amount), 0);
  const variance = (budget ?? 0) - (actualsToDate + forecastRemaining);

  const years = entries.map((e) => e.period_year);
  const lookaheadEnd = new Date(currentY, today.getMonth() + 12, 1);
  const minYear = years.length ? Math.min(currentY, ...years) : currentY;
  const maxYear = years.length
    ? Math.max(lookaheadEnd.getFullYear(), ...years)
    : lookaheadEnd.getFullYear();

  const byMonth = new Map<string, { actual?: BudgetEntry; forecast?: BudgetEntry }>();
  for (const e of entries) {
    const key = `${e.period_year}-${e.period_month}`;
    const cell = byMonth.get(key) ?? {};
    cell[e.entry_type] = e;
    byMonth.set(key, cell);
  }

  const rows: { year: number; month: number; actual?: BudgetEntry; forecast?: BudgetEntry }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const cell = byMonth.get(`${y}-${m}`) ?? {};
      rows.push({ year: y, month: m, actual: cell.actual, forecast: cell.forecast });
    }
  }

  const startBudgetEdit = () => {
    setBudgetDraft(budget != null ? String(budget) : "");
    setEditingBudget(true);
  };

  const saveBudget = async () => {
    const trimmed = budgetDraft.trim();
    let value: number | null = null;
    if (trimmed) {
      const parsed = parseFloat(trimmed);
      if (!Number.isFinite(parsed)) {
        toast.error("Invalid amount");
        return;
      }
      value = parsed;
    }
    const previous = budget;
    setBudget(value);
    setEditingBudget(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_projects")
      .update({ budget_amount: value })
      .eq("id", projectId);
    if (error) {
      setBudget(previous);
      toast.error("Failed to update budget");
    }
  };

  const cancelBudgetEdit = () => {
    setEditingBudget(false);
    setBudgetDraft(budget != null ? String(budget) : "");
  };

  const openAdd = (entry_type?: BudgetEntryType, year?: number, month?: number) => {
    setAddDefaults({ entry_type, period_year: year, period_month: month });
    setShowAdd(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = allEntries.find((e) => e.id === deleteId);
    setEntries((prev) => prev.filter((e) => e.id !== deleteId));
    setDeleteId(null);
    const supabase = createClient();
    const { error } = await supabase.from("coeo_budget_entries").delete().eq("id", deleteId);
    if (error) {
      if (original) setEntries((prev) => [...prev, original]);
      toast.error("Failed to delete entry");
    }
  };

  return (
    <>
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-1">Budget</div>
            {editingBudget ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveBudget();
                    if (e.key === "Escape") cancelBudgetEdit();
                  }}
                  className="border border-border rounded-card px-2 py-1 text-[15px] outline-none focus:border-accent w-28"
                />
                <Button size="sm" onClick={saveBudget}>Save</Button>
                <Button size="sm" variant="ghost" onClick={cancelBudgetEdit}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-[20px] font-semibold text-text-primary">
                  {budget != null ? formatMoney(budget) : "—"}
                </div>
                <button
                  type="button"
                  onClick={startBudgetEdit}
                  aria-label="Edit budget"
                  className="text-text-muted hover:text-primary text-[12px]"
                >
                  ✎
                </button>
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-1">Actuals to date</div>
            <div className="text-[20px] font-semibold text-text-primary">{formatMoney(actualsToDate)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-1">Forecast remaining</div>
            <div className="text-[20px] font-semibold text-text-primary">{formatMoney(forecastRemaining)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-1">Variance</div>
            <div
              className={`text-[20px] font-semibold ${
                variance >= 0 ? "text-badge-green-text" : "text-badge-red-text"
              }`}
            >
              {formatMoney(variance)}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end mb-4">
        <Button onClick={() => openAdd()}>+ Add entry</Button>
      </div>

      <Card>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-cream text-text-secondary border-b border-border">
              <th className="px-4 py-2 text-left font-semibold tracking-[0.07em] uppercase text-[10px]">Month</th>
              <th className="px-4 py-2 text-right font-semibold tracking-[0.07em] uppercase text-[10px]">Actual</th>
              <th className="px-4 py-2 text-right font-semibold tracking-[0.07em] uppercase text-[10px]">Forecast</th>
              <th className="px-4 py-2 text-right font-semibold tracking-[0.07em] uppercase text-[10px]">Variance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const actualAmt = row.actual ? Number(row.actual.amount) : null;
              const forecastAmt = row.forecast ? Number(row.forecast.amount) : null;
              const rowVariance =
                actualAmt != null || forecastAmt != null
                  ? (actualAmt ?? 0) - (forecastAmt ?? 0)
                  : null;
              return (
                <tr key={`${row.year}-${row.month}`} className="border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]">
                  <td className="px-4 py-2 text-text-primary">
                    {MONTHS[row.month - 1]} {row.year}
                  </td>
                  <td
                    className="px-4 py-2 text-right cursor-pointer text-text-primary"
                    onClick={() =>
                      row.actual
                        ? setEditing(row.actual)
                        : openAdd("actual", row.year, row.month)
                    }
                  >
                    {actualAmt != null ? formatMoney(actualAmt) : "—"}
                  </td>
                  <td
                    className="px-4 py-2 text-right cursor-pointer text-text-primary"
                    onClick={() =>
                      row.forecast
                        ? setEditing(row.forecast)
                        : openAdd("forecast", row.year, row.month)
                    }
                  >
                    {forecastAmt != null ? formatMoney(forecastAmt) : "—"}
                  </td>
                  <td
                    className={`px-4 py-2 text-right ${
                      rowVariance == null
                        ? "text-text-muted"
                        : rowVariance >= 0
                        ? "text-badge-green-text"
                        : "text-badge-red-text"
                    }`}
                  >
                    {rowVariance != null ? formatMoney(rowVariance) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <AddBudgetEntryDialog
        open={showAdd}
        projectId={projectId}
        defaults={addDefaults}
        onClose={() => setShowAdd(false)}
        onAdd={(entry) => setEntries((prev) => [...prev, entry])}
      />

      <EditBudgetEntryDialog
        entry={editing}
        onClose={() => setEditing(null)}
        onSave={(u) =>
          setEntries((prev) => prev.map((e) => (e.id === u.id ? u : e)))
        }
        onDelete={(id) => {
          setEditing(null);
          setDeleteId(id);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete entry"
        message="Are you sure you want to delete this budget entry?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

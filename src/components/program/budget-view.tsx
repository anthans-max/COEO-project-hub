"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InlineEdit } from "@/components/ui/inline-edit";
import { SectionHeader } from "./section-header";
import type { ProgramBudgetRow } from "@/lib/types";

interface Props {
  initialRows: ProgramBudgetRow[];
}

export function BudgetView({ initialRows }: Props) {
  const [rows, setRows] = useRealtime<ProgramBudgetRow>(
    "coeo_program_budget",
    initialRows
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const phases = useMemo(
    () =>
      rows
        .filter((r) => r.category === "phase")
        .sort((a, b) => a.sort_order - b.sort_order),
    [rows]
  );
  const workstreams = useMemo(
    () =>
      rows
        .filter((r) => r.category === "workstream")
        .sort((a, b) => a.sort_order - b.sort_order),
    [rows]
  );

  const updateField = async <K extends keyof ProgramBudgetRow>(
    row: ProgramBudgetRow,
    field: K,
    value: ProgramBudgetRow[K]
  ) => {
    const previousValue = row[field];
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, [field]: value } : r))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_program_budget")
      .update({ [field]: value })
      .eq("id", row.id);
    if (error) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, [field]: previousValue } : r))
      );
      toast.error("Failed to save change");
    }
  };

  const addPhase = async () => {
    const nextOrder =
      phases.length === 0
        ? 1
        : Math.max(...phases.map((p) => p.sort_order)) + 1;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_program_budget")
      .insert({
        category: "phase",
        name: "New phase",
        target_dates: "",
        estimated_cost: "TBC",
        notes: "",
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Failed to add phase");
      return;
    }
    setRows((prev) => [...prev, data as ProgramBudgetRow]);
  };

  const addWorkstream = async () => {
    const nextOrder =
      workstreams.length === 0
        ? 1
        : Math.max(...workstreams.map((w) => w.sort_order)) + 1;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_program_budget")
      .insert({
        category: "workstream",
        name: "New workstream",
        vendor: "",
        phase: "",
        estimated_cost: "TBC",
        notes: "",
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Failed to add workstream");
      return;
    }
    setRows((prev) => [...prev, data as ProgramBudgetRow]);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = rows.find((r) => r.id === deleteId);
    setRows((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_program_budget")
      .delete()
      .eq("id", deleteId);
    if (error) {
      if (original) setRows((prev) => [...prev, original]);
      toast.error("Failed to delete row");
    }
  };

  return (
    <>
      <SectionHeader
        label="Program · Finance"
        title="Budget & Investment"
        subtitle="Phase allocations and workstream cost estimates. To be completed with Finance and IT leadership sign-off."
      />

      <div
        className="rounded-card mb-7 flex gap-[14px] items-start"
        style={{
          background: "#fdf4e8",
          border: "1px solid #f0d4a8",
          padding: "20px 24px",
        }}
      >
        <div className="text-[20px] mt-[2px]" style={{ color: "#c87d2f" }}>
          ◈
        </div>
        <div>
          <div
            className="text-[13px] font-bold mb-1"
            style={{ color: "#7c4d1e" }}
          >
            Budget framework in preparation
          </div>
          <p
            className="text-[12px] m-0 leading-[1.6]"
            style={{ color: "#7c4d1e" }}
          >
            This section will capture phase-level investment allocations, vendor cost estimates,
            and workstream budgets once Finance and IT leadership have confirmed the program
            scope. The structure below represents the intended framework.
          </p>
        </div>
      </div>

      <div
        className="rounded-card mb-5"
        style={{ background: "#fff", border: "1px solid #e8ecf2", padding: "20px 24px" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-[12px] font-bold tracking-[0.1em] uppercase"
            style={{ color: "#8a9ab5" }}
          >
            Phase Allocation Framework
          </div>
          <Button size="sm" onClick={addPhase}>
            + Add phase
          </Button>
        </div>
        {phases.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-text-muted">
            No phases yet. Click &quot;+ Add phase&quot; to create one.
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {phases.map((p) => {
              const items = (p.notes ?? "")
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              return (
                <div
                  key={p.id}
                  className="rounded-[8px] group relative"
                  style={{
                    background: "#f8f9fc",
                    border: "1px solid #e8ecf2",
                    padding: "16px 18px",
                  }}
                >
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/70"
                    title="Delete phase"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="text-[13px] font-bold text-primary mb-1">
                    <InlineEdit
                      value={p.name}
                      onSave={(v) => updateField(p, "name", v)}
                      placeholder="Phase name"
                    />
                  </div>
                  <div
                    className="text-[11px] font-bold mb-[10px]"
                    style={{ color: "#c87d2f" }}
                  >
                    <InlineEdit
                      value={p.target_dates ?? ""}
                      onSave={(v) => updateField(p, "target_dates", v || null)}
                      placeholder="Target dates"
                    />
                  </div>
                  <div className="mb-3">
                    {items.length > 0 && (
                      <div className="flex flex-col gap-[6px] mb-2">
                        {items.map((item, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <span
                              className="text-[10px] mt-[3px] shrink-0"
                              style={{ color: "#c8d4e4" }}
                            >
                              —
                            </span>
                            <span className="text-[12px]" style={{ color: "#5a6a7e" }}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className="text-[10px] font-semibold tracking-[0.08em] uppercase mb-1"
                      style={{ color: "#8a9ab5" }}
                    >
                      Line items (one per line)
                    </div>
                    <InlineEdit
                      value={p.notes ?? ""}
                      onSave={(v) => updateField(p, "notes", v || null)}
                      placeholder="One item per line"
                      multiline
                      className="text-[12px]"
                    />
                  </div>
                  <div
                    className="rounded-[6px] text-center"
                    style={{
                      background: "#fff",
                      border: "1px dashed #d8e0ec",
                      padding: "8px 12px",
                    }}
                  >
                    <div className="text-[11px]" style={{ color: "#aab5c5" }}>
                      <InlineEdit
                        value={p.estimated_cost ? `Budget ${p.estimated_cost}` : "Budget TBC"}
                        onSave={(v) => {
                          const stripped = v.replace(/^Budget\s*/i, "").trim();
                          updateField(p, "estimated_cost", stripped || null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="rounded-card"
        style={{ background: "#fff", border: "1px solid #e8ecf2", padding: "20px 24px" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-[12px] font-bold tracking-[0.1em] uppercase"
            style={{ color: "#8a9ab5" }}
          >
            Workstream Estimates
          </div>
          <Button size="sm" onClick={addWorkstream}>
            + Add workstream
          </Button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "2px solid #e8ecf2" }}>
              {["Workstream", "Vendor(s)", "Phase", "Est. Cost", "Notes", ""].map((h, i) => (
                <th
                  key={i}
                  className="text-[11px] font-bold tracking-[0.08em] uppercase text-left"
                  style={{
                    color: "#8a9ab5",
                    padding: "0 12px 10px 0",
                    width: h === "" ? 32 : undefined,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workstreams.map((w) => (
              <tr
                key={w.id}
                className="group"
                style={{ borderBottom: "1px solid #f0f4f8" }}
              >
                <td
                  className="text-[13px] font-semibold text-primary"
                  style={{ padding: "12px 12px 12px 0" }}
                >
                  <InlineEdit
                    value={w.name}
                    onSave={(v) => updateField(w, "name", v)}
                    placeholder="Workstream"
                  />
                </td>
                <td
                  className="text-[12px]"
                  style={{ color: "#5a6a7e", padding: "12px 12px 12px 0" }}
                >
                  <InlineEdit
                    value={w.vendor ?? ""}
                    onSave={(v) => updateField(w, "vendor", v || null)}
                    placeholder="—"
                  />
                </td>
                <td
                  className="text-[12px]"
                  style={{ color: "#5a6a7e", padding: "12px 12px 12px 0" }}
                >
                  <InlineEdit
                    value={w.phase ?? ""}
                    onSave={(v) => updateField(w, "phase", v || null)}
                    placeholder="—"
                  />
                </td>
                <td style={{ padding: "12px 12px 12px 0" }}>
                  <span
                    className="text-[11px] rounded-[4px] inline-block"
                    style={{
                      color: "#aab5c5",
                      background: "#f8f9fc",
                      border: "1px dashed #d8e0ec",
                      padding: "3px 8px",
                    }}
                  >
                    <InlineEdit
                      value={w.estimated_cost ?? ""}
                      onSave={(v) => updateField(w, "estimated_cost", v || null)}
                      placeholder="TBC"
                    />
                  </span>
                </td>
                <td
                  className="text-[11px]"
                  style={{ color: "#8a9ab5", padding: "12px 12px 12px 0" }}
                >
                  <InlineEdit
                    value={w.notes ?? ""}
                    onSave={(v) => updateField(w, "notes", v || null)}
                    placeholder="—"
                  />
                </td>
                <td style={{ padding: "12px 0", width: 32 }}>
                  <button
                    onClick={() => setDeleteId(w.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/70"
                    title="Delete workstream"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {workstreams.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-[13px] text-text-muted"
                >
                  No workstreams yet. Click &quot;+ Add workstream&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete row"
        message="Are you sure you want to delete this row?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SectionHeader } from "./section-header";
import { DecisionCard } from "./decision-card";
import { DecisionDialog } from "./decision-dialog";
import { getThemeShortLabel } from "./theme-tag";
import type { ProgramDecision, ProgramTheme } from "@/lib/types";

interface Props {
  initialDecisions: ProgramDecision[];
  initialThemes: ProgramTheme[];
}

export function DecisionsList({ initialDecisions, initialThemes }: Props) {
  const [decisions, setDecisions] = useRealtime<ProgramDecision>(
    "coeo_program_decisions",
    initialDecisions
  );
  const [themes] = useRealtime<ProgramTheme>("coeo_program_themes", initialThemes);
  const [filter, setFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editDecision, setEditDecision] = useState<ProgramDecision | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const sortedDecisions = useMemo(
    () => [...decisions].sort((a, b) => a.sort_order - b.sort_order),
    [decisions]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return sortedDecisions;
    return sortedDecisions.filter((d) => d.theme_codes.includes(filter));
  }, [sortedDecisions, filter]);

  const nextSortOrder =
    decisions.length === 0
      ? 1
      : Math.max(...decisions.map((d) => d.sort_order)) + 1;

  const ownerCount = (match: (owner: string | null) => boolean) =>
    decisions.filter((d) => match(d.owner)).length;

  const summaryStats: [string, string, string][] = [
    [String(decisions.length), "Total Decisions", "#0f2744"],
    [
      String(ownerCount((o) => (o ?? "").toLowerCase().includes("coeo it"))),
      "Owner: Coeo IT",
      "#1e4d8c",
    ],
    [
      String(
        ownerCount(
          (o) =>
            !!o &&
            (o.toLowerCase().includes("business") ||
              o.toLowerCase().includes("sales"))
        )
      ),
      "Owner: Business",
      "#1a6b5c",
    ],
    ["Q2 2026", "Target Quarter", "#c87d2f"],
  ];

  const sortedThemes = useMemo(
    () => [...themes].sort((a, b) => a.sort_order - b.sort_order),
    [themes]
  );

  const handleSave = (decision: ProgramDecision) => {
    setDecisions((prev) => {
      const idx = prev.findIndex((d) => d.id === decision.id);
      if (idx === -1) return [...prev, decision];
      const next = [...prev];
      next[idx] = decision;
      return next;
    });
  };

  const handleStatusChange = async (
    decision: ProgramDecision,
    status: ProgramDecision["status"]
  ) => {
    const previous = decision.status;
    setDecisions((prev) =>
      prev.map((d) => (d.id === decision.id ? { ...d, status } : d))
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_program_decisions")
      .update({ status })
      .eq("id", decision.id);
    if (error) {
      setDecisions((prev) =>
        prev.map((d) => (d.id === decision.id ? { ...d, status: previous } : d))
      );
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = decisions.find((d) => d.id === deleteId);
    setDecisions((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_program_decisions")
      .delete()
      .eq("id", deleteId);
    if (error) {
      if (original) setDecisions((prev) => [...prev, original]);
      toast.error("Failed to delete decision");
    }
  };

  return (
    <>
      <SectionHeader
        label="Program · Governance"
        title="Decisions & Alignment"
        subtitle="The following items require stakeholder input before the program can move into detailed specification and design. Each is framed as a decision to make, not a problem to solve."
      />

      <div
        className="grid gap-3 mb-7"
        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
      >
        {summaryStats.map(([val, lbl, col]) => (
          <div
            key={lbl}
            className="rounded-[8px]"
            style={{
              background: "#fff",
              border: "1px solid #e8ecf2",
              padding: "16px 20px",
            }}
          >
            <div
              className="text-[24px] font-extrabold"
              style={{ color: col, fontFamily: "'Georgia', serif" }}
            >
              {val}
            </div>
            <div className="text-sm tracking-[0.06em] mt-[2px]" style={{ color: "#8a9ab5" }}>
              {lbl}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className="text-sm font-bold rounded-[4px] cursor-pointer tracking-[0.06em]"
            style={{
              padding: "5px 12px",
              border: `1px solid ${filter === "all" ? "#0f2744" : "#d8e0ec"}`,
              background: filter === "all" ? "#0f2744" : "#fff",
              color: filter === "all" ? "#fff" : "#5a6a7e",
            }}
          >
            ALL
          </button>
          {sortedThemes.map((t) => {
            const color = t.color ?? "#5a6a7e";
            const active = filter === t.code;
            return (
              <button
                key={t.code}
                onClick={() => setFilter(t.code)}
                className="text-sm font-bold rounded-[4px] cursor-pointer tracking-[0.04em]"
                style={{
                  padding: "5px 12px",
                  border: `1px solid ${active ? color : "#d8e0ec"}`,
                  background: active ? `${color}15` : "#fff",
                  color: active ? color : "#5a6a7e",
                }}
              >
                {getThemeShortLabel(t.code, themes)}
              </button>
            );
          })}
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add decision</Button>
      </div>

      <div className="flex flex-col gap-[10px]">
        {filtered.map((d) => (
          <DecisionCard
            key={d.id}
            decision={d}
            themes={themes}
            onStatusChange={(status) => handleStatusChange(d, status)}
            onEdit={() => setEditDecision(d)}
            onDelete={() => setDeleteId(d.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[14px] text-text-muted">
            {decisions.length === 0
              ? 'No decisions yet. Click "+ Add decision" to create one.'
              : "No decisions match this theme filter."}
          </div>
        )}
      </div>

      <DecisionDialog
        open={showAdd}
        decision={null}
        themes={sortedThemes}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <DecisionDialog
        open={!!editDecision}
        decision={editDecision}
        themes={sortedThemes}
        onClose={() => setEditDecision(null)}
        onSave={handleSave}
        nextSortOrder={nextSortOrder}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete decision"
        message="Are you sure you want to delete this decision?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

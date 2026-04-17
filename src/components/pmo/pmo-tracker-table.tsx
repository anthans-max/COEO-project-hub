"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditPmoTrackerDialog } from "./edit-pmo-tracker-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { PmoTrackerRow } from "@/lib/types";

interface Props {
  initialRows: PmoTrackerRow[];
}

const DATE_PREFIX_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}):/;
const DATE_SPLIT_RE = /(?=\d{1,2}\/\d{1,2}\/\d{2,4}:)/;

function parseDatePrefix(entry: string): Date | null {
  const m = entry.match(DATE_PREFIX_RE);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  let year = Number(m[3]);
  if (year < 100) year += 2000;
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function latestCommentEntry(text: string | null): string {
  if (!text) return "";
  let candidates = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => DATE_PREFIX_RE.test(l));

  if (candidates.length === 0) {
    candidates = text
      .split(DATE_SPLIT_RE)
      .map((l) => l.trim())
      .filter((l) => DATE_PREFIX_RE.test(l));
  }

  if (candidates.length === 0) {
    const firstLine = text.split("\n").map((l) => l.trim()).find((l) => l.length > 0);
    return firstLine ?? text.trim();
  }

  let best = candidates[0];
  let bestDate = parseDatePrefix(best);
  for (const c of candidates.slice(1)) {
    const d = parseDatePrefix(c);
    if (d && (!bestDate || d.getTime() > bestDate.getTime())) {
      best = c;
      bestDate = d;
    }
  }
  return best;
}

function statusVariant(status: string | null): string {
  if (!status) return "gray";
  const s = status.trim().toLowerCase();
  if (s === "in process" || s === "in-process") return "navy";
  if (s === "done") return "green";
  if (s === "hold" || s === "on hold") return "gray";
  if (s === "assess" || s === "scope") return "cream";
  return "gray";
}

function CommentCell({ text }: { text: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const latest = latestCommentEntry(text);
  if (!latest) return <span className="text-text-muted">—</span>;

  const truncated = latest.length > 120 ? latest.slice(0, 120) + "…" : latest;
  const canExpand = latest.length > 120;

  return (
    <div className="text-[13px] text-text-primary">
      <span className="whitespace-pre-wrap break-words">
        {expanded ? latest : truncated}
      </span>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-2 text-[11px] text-primary hover:underline"
        >
          {expanded ? "Less" : "More"}
        </button>
      )}
    </div>
  );
}

export function PmoTrackerTable({ initialRows }: Props) {
  const [rows, setRows] = useRealtime<PmoTrackerRow>("coeo_pmo_tracker", initialRows);
  const [editRow, setEditRow] = useState<PmoTrackerRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleEditSave = (updated: PmoTrackerRow) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = rows.find((r) => r.id === deleteId);
    setRows((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_pmo_tracker").delete().eq("id", deleteId);
    if (error) {
      if (original) setRows((prev) => [...prev, original]);
      toast.error("Failed to delete PMO tracker item");
    }
  };

  if (rows.length === 0) {
    return (
      <Card className="p-8 text-center text-[14px] text-text-muted">
        No data yet — upload the latest PMO Tracker to populate this table.
      </Card>
    );
  }

  const latestUploadedAt = rows.reduce<string>((max, r) => {
    return r.uploaded_at > max ? r.uploaded_at : max;
  }, rows[0].uploaded_at);

  return (
    <>
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-text-muted">
          Last updated: {new Date(latestUploadedAt).toLocaleDateString()}
        </span>
      </div>
      <Card className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1040px]">
            <thead>
              <tr className="bg-cream border-b border-border">
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[48px]">#</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[130px]">Category</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3">Project Description</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[110px]">Status</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[130px]">RCG Owner</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[130px]">COEO Support</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[130px]">Target Complete</th>
                <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3">Comments / Updates</th>
                <th className="text-right text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0 bg-white align-top">
                  <td className="px-4 py-3 text-[13px] text-text-primary">{r.item_no ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-primary">{r.category ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-primary">{r.project_description ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px]">
                    {r.project_status ? (
                      <Badge status={r.project_status} variant={statusVariant(r.project_status)} />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-primary">{r.rcg_owner ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-primary">{r.coeo_support ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-text-primary">{r.project_complete ?? "—"}</td>
                  <td className="px-4 py-3">
                    <CommentCell text={r.comments_updates} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 shrink-0 justify-end">
                      <Button size="sm" onClick={() => setEditRow(r)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(r.id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EditPmoTrackerDialog
        row={editRow}
        onClose={() => setEditRow(null)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete item"
        message="Delete this item?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

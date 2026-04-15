"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddMilestoneDialog } from "./add-milestone-dialog";
import { EditMilestoneDialog } from "./edit-milestone-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/utils";
import { isPast, parseISO } from "date-fns";
import type { Milestone } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface Props {
  initialData: Milestone[];
  projects: ProjectOption[];
}

export function MilestonesList({ initialData, projects }: Props) {
  const [milestones, setMilestones] = useRealtime("coeo_milestones", initialData);
  const [projectFilter, setProjectFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleEditSave = (updated: Milestone) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = milestones.find((m) => m.id === deleteId);
    setMilestones((prev) => prev.filter((m) => m.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_milestones").delete().eq("id", deleteId);
    if (error) {
      if (original) setMilestones((prev) => [...prev, original]);
      toast.error("Failed to delete milestone");
    }
  };

  const filtered = milestones.filter(
    (m) => projectFilter === "All" || m.project_id === projectFilter
  );

  const grouped = filtered.reduce<Record<string, Milestone[]>>((acc, m) => {
    const key = m.project_name || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const groupOrder = projects
    .map((p) => p.name)
    .filter((name) => grouped[name])
    .concat(grouped["Unassigned"] ? ["Unassigned"] : []);

  const renderRow = (ms: Milestone, showProject: boolean) => {
    const overdue = ms.due_date && isPast(parseISO(ms.due_date)) && ms.status !== "Complete";
    return (
      <div
        key={ms.id}
        className="flex items-center gap-3 px-4 py-[10px] border-b border-border-light last:border-b-0 hover:bg-cream transition-colors"
      >
        <div className={`text-[13px] font-medium w-[56px] shrink-0 ${overdue ? "text-destructive font-semibold" : "text-text-secondary"}`}>
          {formatShortDate(ms.due_date)}
        </div>
        <div className="flex-1">
          <div className="text-[15px] text-text-primary font-medium">{ms.title}</div>
        </div>
        {showProject && (
          <div className="text-[13px] text-text-muted w-[140px] shrink-0">
            {ms.project_name || "—"}
          </div>
        )}
        <div className="text-[13px] text-text-secondary w-[110px] shrink-0">
          {ms.owner || "Unassigned"}
        </div>
        <div className="w-[90px] shrink-0">
          <Badge status={overdue ? "Overdue" : ms.status} />
        </div>
        <div className="w-[120px] shrink-0 flex justify-end gap-2">
          <Button size="sm" onClick={() => setEditMilestone(ms)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteId(ms.id)}>
            Delete
          </Button>
        </div>
      </div>
    );
  };

  const isGrouped = projectFilter === "All";

  return (
    <>
      <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="appearance-none bg-primary text-white border border-primary rounded-pill pl-[14px] pr-8 py-[5px] text-[13px] font-medium outline-none cursor-pointer bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M1 1l4 4 4-4%22 stroke=%22white%22 stroke-width=%221.5%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-no-repeat bg-[right_12px_center]"
          >
            <option value="All">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add milestone</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-[15px] text-text-muted border border-border rounded-card bg-cream">
          No milestones yet
        </div>
      ) : isGrouped ? (
        groupOrder.map((groupName) => (
          <div key={groupName} className="mb-5">
            <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-[10px] pb-[6px] border-b border-border">
              {groupName}
            </div>
            <Card className="bg-white">
              {grouped[groupName].map((ms) => renderRow(ms, false))}
            </Card>
          </div>
        ))
      ) : (
        <Card className="bg-white">
          {filtered.map((ms) => renderRow(ms, false))}
        </Card>
      )}

      <AddMilestoneDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(ms) => setMilestones((prev) => [...prev, ms])}
      />

      <EditMilestoneDialog
        milestone={editMilestone}
        projects={projects}
        onClose={() => setEditMilestone(null)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete milestone"
        message="Are you sure you want to delete this milestone?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

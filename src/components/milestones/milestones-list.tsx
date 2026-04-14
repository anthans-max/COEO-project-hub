"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
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

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add milestone</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[56px]">Date</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase flex-1">Milestone</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[140px]">Project</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[110px]">Owner</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[90px]">Status</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[120px]"></div>
        </CardHeader>
        {milestones.map((ms) => {
          const overdue = ms.due_date && isPast(parseISO(ms.due_date)) && ms.status !== "Complete";
          return (
            <div
              key={ms.id}
              className="flex items-center gap-3 px-4 py-[10px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]"
            >
              <div className={`text-[11px] font-medium w-[56px] shrink-0 ${overdue ? "text-destructive font-semibold" : "text-text-secondary"}`}>
                {formatShortDate(ms.due_date)}
              </div>
              <div className="flex-1">
                <div className="text-[13px] text-text-primary font-medium">{ms.title}</div>
              </div>
              <div className="text-[11px] text-text-muted w-[140px] shrink-0">
                {ms.project_name || "—"}
              </div>
              <div className="text-[11px] text-text-secondary w-[110px] shrink-0">
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
        })}
        {milestones.length === 0 && (
          <div className="py-8 text-center text-[13px] text-text-muted">No milestones yet</div>
        )}
      </Card>

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

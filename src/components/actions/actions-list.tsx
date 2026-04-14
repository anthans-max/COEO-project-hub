"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddActionDialog } from "./add-action-dialog";
import { EditActionDialog } from "./edit-action-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/utils";
import type { Action } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface Props {
  initialData: Action[];
  projects: ProjectOption[];
}

export function ActionsList({ initialData, projects }: Props) {
  const [actions, setActions] = useRealtime("coeo_actions", initialData);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editAction, setEditAction] = useState<Action | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const statusOptions = ["All", "Open", "In Progress", "Complete", "Blocked"];
  const filtered = statusFilter === "All" ? actions : actions.filter((a) => a.status === statusFilter);

  // Group by owner
  const grouped = filtered.reduce<Record<string, Action[]>>((acc, action) => {
    const key = action.owner || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(action);
    return acc;
  }, {});

  const toggleComplete = async (action: Action) => {
    const newStatus = action.status === "Complete" ? "Open" : "Complete";
    const original = actions.find((a) => a.id === action.id);
    setActions((prev) => prev.map((a) => (a.id === action.id ? { ...a, status: newStatus } : a)));

    const supabase = createClient();
    const { error } = await supabase.from("coeo_actions").update({ status: newStatus }).eq("id", action.id);
    if (error) {
      if (original) setActions((prev) => prev.map((a) => (a.id === action.id ? original : a)));
      toast.error("Failed to update action");
    }
  };

  const handleEditSave = (updated: Action) => {
    setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = actions.find((a) => a.id === deleteId);
    setActions((prev) => prev.filter((a) => a.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_actions").delete().eq("id", deleteId);
    if (error) {
      if (original) setActions((prev) => [...prev, original]);
      toast.error("Failed to delete action");
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <FilterBar options={statusOptions} selected={statusFilter} onChange={setStatusFilter} />
        <Button onClick={() => setShowAdd(true)}>+ Add action</Button>
      </div>

      {Object.entries(grouped).map(([owner, ownerActions]) => (
        <div key={owner} className="mb-5">
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-[10px] pb-[6px] border-b border-border">
            {owner}
          </div>
          <Card>
            {ownerActions.map((action) => {
              const done = action.status === "Complete";
              return (
                <div
                  key={action.id}
                  className="flex items-center gap-[10px] px-4 py-[10px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]"
                >
                  <Checkbox checked={done} onChange={() => toggleComplete(action)} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[15px] leading-[1.45] ${done ? "line-through text-[#C8C0B4]" : "text-text-primary"}`}>
                      {action.description}
                    </div>
                    {action.due_date && (
                      <div className="text-[10px] text-text-muted mt-1">
                        Due {formatShortDate(action.due_date)}
                      </div>
                    )}
                  </div>
                  <Badge status={action.priority} variant={action.priority === "High" ? "red" : action.priority === "Low" ? "gray" : "amber"} />
                  <span className="text-[10px] font-semibold text-text-secondary bg-cream px-2 py-[2px] rounded-pill shrink-0">
                    {action.owner_initials}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => setEditAction(action)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(action.id)}>Delete</Button>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-8 text-center text-[15px] text-text-muted">No actions found</div>
      )}

      <AddActionDialog
        open={showAdd}
        projects={projects}
        onClose={() => setShowAdd(false)}
        onAdd={(action) => setActions((prev) => [...prev, action])}
      />

      <EditActionDialog
        action={editAction}
        projects={projects}
        onClose={() => setEditAction(null)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete action"
        message="Are you sure you want to delete this action item?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

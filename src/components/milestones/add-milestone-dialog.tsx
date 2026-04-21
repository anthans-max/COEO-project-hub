"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Milestone } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface PersonOption {
  id: string;
  name: string;
  initials: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (milestone: Milestone) => void;
  projects: ProjectOption[];
  people: PersonOption[];
  defaultProjectId?: string;
  lockProject?: boolean;
}

export function AddMilestoneDialog({
  open,
  onClose,
  onAdd,
  projects,
  people,
  defaultProjectId,
  lockProject,
}: Props) {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) setProjectId(defaultProjectId ?? "");
  }, [open, defaultProjectId]);

  if (!open) return null;

  const lockedProjectName = lockProject
    ? projects.find((p) => p.id === (defaultProjectId ?? projectId))?.name ?? ""
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_milestones")
      .insert({
        title: title.trim(),
        owner: owner.trim() || null,
        due_date: dueDate || null,
        project_id: projectId,
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add milestone");
      return;
    }

    onAdd(data);
    setTitle("");
    setOwner("");
    setDueDate("");
    setProjectId(defaultProjectId ?? "");
    onClose();
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border p-6 w-[400px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-semibold text-primary mb-4">Add milestone</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Milestone title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            autoFocus
          />
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {people.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
          {lockProject ? (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase">
                Project
              </span>
              <div className={`${inputClass} bg-gray-50 text-text-muted`}>
                {lockedProjectName || "—"}
              </div>
            </div>
          ) : (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !title.trim() || !projectId}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { MILESTONE_STATUSES } from "@/lib/constants";
import type { Milestone } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface Props {
  milestone: Milestone | null;
  projects: ProjectOption[];
  onClose: () => void;
  onSave: (updated: Milestone) => void;
}

export function EditMilestoneDialog({ milestone, projects, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    title: "",
    project_id: "",
    owner: "",
    due_date: "",
    status: "Upcoming",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (milestone) {
      setForm({
        title: milestone.title ?? "",
        project_id: milestone.project_id ?? "",
        owner: milestone.owner ?? "",
        due_date: milestone.due_date ?? "",
        status: milestone.status ?? "Upcoming",
        notes: milestone.notes ?? "",
      });
    }
  }, [milestone]);

  if (!milestone) return null;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    const selectedProject = projects.find((p) => p.id === form.project_id);

    const payload = {
      title: form.title.trim(),
      project_id: form.project_id || null,
      owner: form.owner.trim() || null,
      due_date: form.due_date || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    // Optimistic
    const updated: Milestone = {
      ...milestone,
      ...payload,
      project_name: selectedProject?.name ?? milestone.project_name,
    };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_milestones")
      .update(payload)
      .eq("id", milestone.id);

    setSaving(false);
    if (error) {
      onSave(milestone);
      toast.error("Failed to save milestone");
    }
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cream header */}
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">{milestone.title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Milestone title
            </label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Project
            </label>
            <select value={form.project_id} onChange={(e) => set("project_id", e.target.value)} className={inputClass}>
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Owner
              </label>
              <input type="text" value={form.owner} onChange={(e) => set("owner", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Due date
              </label>
              <input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Status
            </label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
              {MILESTONE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Notes
            </label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.title.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

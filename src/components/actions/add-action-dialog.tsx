"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { ACTION_STATUSES, ACTION_PRIORITIES } from "@/lib/constants";
import type { Action } from "@/lib/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  projects: ProjectOption[];
  onClose: () => void;
  onAdd: (action: Action) => void;
  defaultProjectId?: string;
  lockProject?: boolean;
}

export function AddActionDialog({ open, projects, onClose, onAdd, defaultProjectId, lockProject }: Props) {
  const [form, setForm] = useState({
    description: "",
    owner: "",
    owner_initials: "",
    status: "Open",
    priority: "Medium",
    due_date: "",
    project_id: defaultProjectId ?? "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () =>
    setForm({ description: "", owner: "", owner_initials: "", status: "Open", priority: "Medium", due_date: "", project_id: defaultProjectId ?? "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.due_date) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_actions")
      .insert({
        description: form.description.trim(),
        owner: form.owner.trim() || null,
        owner_initials: form.owner_initials.trim().toUpperCase().slice(0, 2) || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        project_id: form.project_id || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add action");
      return;
    }

    onAdd(data);
    resetForm();
    onClose();
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">New action</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className={inputClass} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Owner</label>
              <input type="text" value={form.owner} onChange={(e) => set("owner", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Owner initials</label>
              <input type="text" value={form.owner_initials} onChange={(e) => set("owner_initials", e.target.value)} maxLength={2} className={inputClass} placeholder="e.g. AS" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                {ACTION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputClass}>
                {ACTION_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Due date <span className="text-destructive">*</span>
            </label>
            <input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className={inputClass} required />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Linked project</label>
            <select value={form.project_id} onChange={(e) => set("project_id", e.target.value)} className={inputClass} disabled={lockProject}>
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={inputClass} />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.description.trim() || !form.due_date}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

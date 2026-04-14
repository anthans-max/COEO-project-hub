"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { Project } from "@/lib/types";

interface Props {
  project: Project | null;
  onClose: () => void;
  onSave: (updated: Project) => void;
  onDelete?: (id: string) => void;
}

export function EditProjectDialog({ project, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    name: "",
    key_risk: "",
    owner: "",
    status: "Not Started",
    phase_current: "",
    phase_next: "",
    progress: 0,
    notes: "",
    start_date: "",
    end_date: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name ?? "",
        key_risk: project.key_risk ?? "",
        owner: project.owner ?? "",
        status: project.status ?? "Not Started",
        phase_current: project.phase_current ?? "",
        phase_next: project.phase_next ?? "",
        progress: project.progress ?? 0,
        notes: project.notes ?? "",
        start_date: project.start_date ?? "",
        end_date: project.end_date ?? "",
      });
    }
  }, [project]);

  if (!project) return null;

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      key_risk: form.key_risk.trim() || null,
      owner: form.owner.trim() || null,
      status: form.status,
      phase_current: form.phase_current.trim() || null,
      phase_next: form.phase_next.trim() || null,
      progress: form.progress,
      notes: form.notes.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };

    // Optimistic
    const updated = { ...project, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_projects")
      .update(payload)
      .eq("id", project.id);

    setSaving(false);
    if (error) {
      // Revert by re-saving original
      onSave(project);
      toast.error("Failed to save project");
    }
  };

  const inputClass =
    "border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-card border border-border w-[520px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cream header */}
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">{project.name}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Project name
            </label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Description / key risk
            </label>
            <input type="text" value={form.key_risk} onChange={(e) => set("key_risk", e.target.value)} className={inputClass} placeholder="One-line subtitle" />
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
                Status
              </label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Current phase
              </label>
              <input type="text" value={form.phase_current} onChange={(e) => set("phase_current", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Next phase
              </label>
              <input type="text" value={form.phase_next} onChange={(e) => set("phase_next", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Progress
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={(e) => set("progress", Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                className={`${inputClass} w-[80px]`}
              />
              <span className="text-[12px] text-text-secondary">%</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Notes
            </label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Start date
              </label>
              <input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                End date
              </label>
              <input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <div>
              {onDelete && (
                <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { ProjectPhase } from "@/lib/types";

type PhaseStatus = ProjectPhase["status"];

interface Props {
  open: boolean;
  projectId: string;
  phase?: ProjectPhase | null;
  onClose: () => void;
  onAdd?: (p: ProjectPhase) => void;
  onUpdate?: (p: ProjectPhase) => void;
  onDelete?: (id: string) => void;
}

const STATUSES: { value: PhaseStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "at_risk", label: "At risk" },
];

export function AddPhaseDialog({ open, projectId, phase, onClose, onAdd, onUpdate, onDelete }: Props) {
  const isEdit = !!phase;
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "upcoming" as PhaseStatus,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (phase) {
      setForm({
        name: phase.name ?? "",
        description: phase.description ?? "",
        start_date: phase.start_date ?? "",
        end_date: phase.end_date ?? "",
        status: phase.status,
      });
    } else {
      setForm({ name: "", description: "", start_date: "", end_date: "", status: "upcoming" });
    }
  }, [phase, open]);

  if (!open) return null;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    };
    const supabase = createClient();

    if (isEdit && phase) {
      const updated = { ...phase, ...payload };
      onUpdate?.(updated);
      onClose();
      const { error } = await supabase
        .from("coeo_project_phases")
        .update(payload)
        .eq("id", phase.id);
      setSaving(false);
      if (error) {
        onUpdate?.(phase);
        toast.error("Failed to save phase");
      }
    } else {
      const { data, error } = await supabase
        .from("coeo_project_phases")
        .insert({ ...payload, project_id: projectId })
        .select()
        .single();
      setSaving(false);
      if (error || !data) {
        toast.error("Failed to add phase");
        return;
      }
      onAdd?.(data as ProjectPhase);
      onClose();
    }
  };

  const input = "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-card border border-border w-[520px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">
            {isEdit ? "Edit phase" : "Add phase"}
          </h3>
        </div>
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Phase name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={input}
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className={input}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                Start date
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
                End date
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
                className={input}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as PhaseStatus)}
              className={input}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div>
              {isEdit && phase && onDelete && (
                <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(phase.id)}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>
                {saving ? "Saving..." : isEdit ? "Save" : "Add phase"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

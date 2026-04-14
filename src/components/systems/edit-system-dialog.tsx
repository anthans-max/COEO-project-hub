"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { SYSTEM_STATUSES } from "@/lib/constants";
import type { System } from "@/lib/types";

interface Props {
  system: System | null;
  onClose: () => void;
  onSave: (updated: System) => void;
  categoryOptions: string[];
}

export function EditSystemDialog({ system, onClose, onSave, categoryOptions }: Props) {
  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    categories: [] as string[],
    purpose: "",
    status: "Active",
    owner: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (system) {
      setForm({
        name: system.name ?? "",
        subtitle: system.subtitle ?? "",
        categories: Array.isArray(system.category) ? system.category : system.category ? [system.category as unknown as string] : [],
        purpose: system.purpose ?? "",
        status: system.status ?? "Active",
        owner: system.owner ?? "",
        notes: system.notes ?? "",
      });
    }
  }, [system]);

  if (!system) return null;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.categories.length === 0) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || null,
      category: form.categories,
      purpose: form.purpose.trim() || null,
      status: form.status,
      owner: form.owner.trim() || null,
      notes: form.notes.trim() || null,
    };

    const updated = { ...system, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_systems")
      .update(payload)
      .eq("id", system.id);

    setSaving(false);
    if (error) {
      onSave(system);
      toast.error("Failed to save system");
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
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">{system.name}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Name</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Subtitle / description</label>
            <input type="text" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-2 block">Categories</label>
              <div className="flex flex-col gap-[6px]">
                {categoryOptions.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-[13px] text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="accent-primary"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Purpose</label>
            <input type="text" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Owner</label>
            <input type="text" value={form.owner} onChange={(e) => set("owner", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim() || form.categories.length === 0}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

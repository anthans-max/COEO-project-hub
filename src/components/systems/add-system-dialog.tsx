"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { SYSTEM_STATUSES } from "@/lib/constants";
import type { System } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (system: System) => void;
  categoryOptions: string[];
}

export function AddSystemDialog({ open, onClose, onAdd, categoryOptions }: Props) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Internal System"]);
  const [status, setStatus] = useState("Active");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedCategories.length === 0) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_systems")
      .insert({ name: name.trim(), subtitle: subtitle.trim() || null, category: selectedCategories, status })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add system");
      return;
    }

    onAdd(data);
    setName("");
    setSubtitle("");
    setSelectedCategories(["Internal System"]);
    setStatus("Active");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border p-6 w-[400px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-semibold text-primary mb-4">Add system</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="System name" value={name} onChange={(e) => setName(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent" autoFocus />
          <input type="text" placeholder="Subtitle / description" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent" />
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-2 block">Categories</label>
            <div className="flex flex-col gap-[6px]">
              {categoryOptions.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-[13px] text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="accent-primary"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent">
            {SYSTEM_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim() || selectedCategories.length === 0}>{saving ? "Adding..." : "Add"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

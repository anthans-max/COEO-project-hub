"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Milestone } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (milestone: Milestone) => void;
}

export function AddMilestoneDialog({ open, onClose, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_milestones")
      .insert({
        title: title.trim(),
        owner: owner.trim() || null,
        due_date: dueDate || null,
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
    onClose();
  };

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
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent"
            autoFocus
          />
          <input
            type="text"
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

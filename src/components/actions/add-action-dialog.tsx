"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { ACTION_PRIORITIES } from "@/lib/constants";
import type { Action } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (action: Action) => void;
}

export function AddActionDialog({ open, onClose, onAdd }: Props) {
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_actions")
      .insert({
        description: description.trim(),
        owner: owner.trim() || null,
        owner_initials: owner.trim() ? getInitials(owner.trim()) : null,
        priority,
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add action");
      return;
    }

    onAdd(data);
    setDescription("");
    setOwner("");
    setPriority("Medium");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border p-6 w-[400px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-semibold text-primary mb-4">Add action item</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent"
          >
            {ACTION_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !description.trim()}>
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Person } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (person: Person) => void;
}

export function AddPersonDialog({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("Coeo Internal");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_people")
      .insert({
        name: name.trim(),
        role: role.trim() || null,
        organization,
        initials: getInitials(name.trim()),
      })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add person");
      return;
    }

    onAdd(data);
    setName("");
    setRole("");
    setOrganization("Coeo Internal");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border p-6 w-[400px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-semibold text-primary mb-4">Add person</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent" autoFocus />
          <input type="text" placeholder={organization === "Vendor" ? "Vendor / company" : "Role / title"} value={role} onChange={(e) => setRole(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent" />
          <select value={organization} onChange={(e) => setOrganization(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent">
            <option value="Coeo Internal">Coeo Internal</option>
            <option value="Vendor">Vendor</option>
            <option value="External">External</option>
          </select>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>{saving ? "Adding..." : "Add"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

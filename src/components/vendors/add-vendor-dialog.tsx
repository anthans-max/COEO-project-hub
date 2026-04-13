"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { VENDOR_STATUSES } from "@/lib/constants";
import type { Vendor } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (vendor: Vendor) => void;
}

export function AddVendorDialog({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_vendors")
      .insert({ name: name.trim(), role: role.trim() || null, status })
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error("Failed to add vendor");
      return;
    }

    onAdd(data);
    setName("");
    setRole("");
    setStatus("Active");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border p-6 w-[400px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-semibold text-primary mb-4">Add vendor</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent" autoFocus />
          <input type="text" placeholder="Role / engagement" value={role} onChange={(e) => setRole(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent" />
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent">
            {VENDOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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

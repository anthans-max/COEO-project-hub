"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { PEOPLE_COLORS } from "@/lib/constants";
import type { Person } from "@/lib/types";

interface Props {
  person: Person | null;
  onClose: () => void;
  onSave: (updated: Person) => void;
}

export function EditPersonDialog({ person, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    organization: "Coeo Internal",
    role: "",
    initials: "",
    color: "#0A2342",
    email: "",
    phone: "",
    focus_areas: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (person) {
      setForm({
        name: person.name ?? "",
        organization: person.organization ?? "Coeo Internal",
        role: person.role ?? "",
        initials: person.initials ?? "",
        color: person.color ?? "#0A2342",
        email: person.email ?? "",
        phone: person.phone ?? "",
        focus_areas: person.focus_areas?.join(", ") ?? "",
        notes: person.notes ?? "",
      });
    }
  }, [person]);

  if (!person) return null;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const focusArray = form.focus_areas
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      organization: form.organization.trim() || "Coeo Internal",
      role: form.role.trim() || null,
      initials: form.initials.trim().toUpperCase().slice(0, 2) || null,
      color: form.color,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      focus_areas: focusArray,
      notes: form.notes.trim() || null,
    };

    const updated = { ...person, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_people")
      .update(payload)
      .eq("id", person.id);

    setSaving(false);
    if (error) {
      onSave(person);
      toast.error("Failed to save person");
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
          <h3 className="text-[14px] font-semibold text-primary">{person.name}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Name</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Organization</label>
              <input type="text" value={form.organization} onChange={(e) => set("organization", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Role / title</label>
              <input type="text" value={form.role} onChange={(e) => set("role", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Initials</label>
              <input type="text" value={form.initials} onChange={(e) => set("initials", e.target.value)} maxLength={2} className={inputClass} placeholder="e.g. AS" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Avatar color</label>
              <select value={form.color} onChange={(e) => set("color", e.target.value)} className={inputClass}>
                {PEOPLE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Focus areas</label>
            <input type="text" value={form.focus_areas} onChange={(e) => set("focus_areas", e.target.value)} className={inputClass} placeholder="Comma-separated, e.g. PM, Governance, Vendor Mgmt" />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { VENDOR_STATUSES } from "@/lib/constants";
import type { Vendor } from "@/lib/types";

interface Props {
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (updated: Vendor) => void;
}

export function EditVendorDialog({ vendor, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    category: "",
    role: "",
    status: "Active",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contract_ref: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.name ?? "",
        subtitle: vendor.subtitle ?? "",
        category: vendor.category ?? "",
        role: vendor.role ?? "",
        status: vendor.status ?? "Active",
        contact_name: vendor.contact_name ?? "",
        contact_email: vendor.contact_email ?? "",
        contact_phone: vendor.contact_phone ?? "",
        contract_ref: vendor.contract_ref ?? "",
        notes: vendor.notes ?? "",
      });
    }
  }, [vendor]);

  if (!vendor) return null;

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || null,
      category: form.category.trim() || null,
      role: form.role.trim() || null,
      status: form.status,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      contract_ref: form.contract_ref.trim() || null,
      notes: form.notes.trim() || null,
    };

    const updated = { ...vendor, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_vendors")
      .update(payload)
      .eq("id", vendor.id);

    setSaving(false);
    if (error) {
      onSave(vendor);
      toast.error("Failed to save vendor");
    }
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
          <h3 className="text-[14px] font-semibold text-primary">{vendor.name}</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Name</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Subtitle / category description</label>
            <input type="text" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Category</label>
              <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                {VENDOR_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Role / engagement description</label>
            <textarea value={form.role} onChange={(e) => set("role", e.target.value)} rows={2} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Contact name</label>
              <input type="text" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Contact email</label>
              <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Contact phone</label>
              <input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Contract reference</label>
              <input type="text" value={form.contract_ref} onChange={(e) => set("contract_ref", e.target.value)} className={inputClass} />
            </div>
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

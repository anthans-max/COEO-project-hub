"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Doc } from "@/lib/types";

interface Props {
  doc: Doc | null;
  onClose: () => void;
  onSave: (updated: Doc) => void;
  onDelete?: (id: string) => void;
}

export function EditDocDialog({ doc, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({ title: "", url: "", notes: "", date: "" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (doc) {
      setForm({
        title: doc.title ?? "",
        url: doc.url ?? "",
        notes: doc.notes ?? "",
        date: doc.date ?? "",
      });
    }
  }, [doc]);

  if (!doc) return null;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      url: form.url.trim() || null,
      notes: form.notes.trim() || null,
      date: form.date || null,
    };
    const updated = { ...doc, ...payload };
    onSave(updated);
    onClose();

    const supabase = createClient();
    const { error } = await supabase.from("coeo_docs").update(payload).eq("id", doc.id);
    setSaving(false);
    if (error) {
      onSave(doc);
      toast.error("Failed to save doc");
    }
  };

  const input = "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">{doc.title}</h3>
        </div>
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">URL</label>
            <input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Date</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={input} />
          </div>
          <div className="flex justify-between items-center mt-3">
            <div>
              {onDelete && (
                <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(doc.id)}>Delete</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.title.trim()}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Doc } from "@/lib/types";

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onAdd: (doc: Doc) => void;
}

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]+/g, "_");
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function AddDocDialog({ open, projectId, onClose, onAdd }: Props) {
  const [mode, setMode] = useState<"link" | "upload">("link");
  const [form, setForm] = useState({ title: "", url: "", notes: "", date: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!open) return null;
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const reset = () => {
    setForm({ title: "", url: "", notes: "", date: "" });
    setFile(null);
    setMode("link");
  };

  const handleFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      toast.error("File exceeds 20 MB limit");
      return;
    }
    setFile(f);
    if (!form.title.trim()) set("title", stripExtension(f.name));
  };

  const submitLink = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("coeo_docs")
      .insert({
        project_id: projectId,
        title: form.title.trim(),
        url: form.url.trim() || null,
        notes: form.notes.trim() || null,
        date: form.date || null,
      })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add doc");
      return;
    }
    onAdd(data);
    reset();
    onClose();
  };

  const submitUpload = async () => {
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    const supabase = createClient();
    const path = `${projectId}/${Date.now()}-${sanitizeFilename(file.name)}`;
    const upload = await supabase.storage
      .from("project-docs")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) {
      toast.error("Upload failed");
      return;
    }
    const { data, error } = await supabase
      .from("coeo_docs")
      .insert({
        project_id: projectId,
        title: form.title.trim(),
        url: null,
        notes: form.notes.trim() || null,
        date: null,
        file_path: path,
        file_size: file.size,
        mime_type: file.type || null,
      })
      .select()
      .single();
    if (error) {
      // Best-effort cleanup so we don't leak orphaned storage objects.
      await supabase.storage.from("project-docs").remove([path]);
      toast.error("Failed to add doc");
      return;
    }
    onAdd(data);
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    if (mode === "link") await submitLink();
    else await submitUpload();
    setSaving(false);
  };

  const input = "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";
  const tabBase = "px-3 py-1.5 text-[13px] font-medium rounded-card border transition-colors";
  const tabActive = "border-accent bg-accent/10 text-primary";
  const tabIdle = "border-border bg-white text-text-secondary hover:text-primary";

  const canSubmit = !saving && form.title.trim() && (mode === "link" || file);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border w-[480px] shadow-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">New doc</h3>
        </div>
        <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              className={`${tabBase} ${mode === "link" ? tabActive : tabIdle}`}
              onClick={() => setMode("link")}
            >
              Link
            </button>
            <button
              type="button"
              className={`${tabBase} ${mode === "upload" ? tabActive : tabIdle}`}
              onClick={() => setMode("upload")}
            >
              Upload
            </button>
          </div>
          {mode === "upload" && (
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">File</label>
              <input
                type="file"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                className="text-[13px] file:mr-3 file:px-3 file:py-1.5 file:rounded-card file:border file:border-border file:bg-cream file:text-[13px] file:cursor-pointer"
              />
              {file && (
                <div className="text-[12px] text-text-muted mt-1">
                  {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              )}
              <div className="text-[11px] text-text-muted mt-1">Max 20 MB.</div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Title</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={input} autoFocus />
          </div>
          {mode === "link" && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">URL</label>
                <input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} className={input} placeholder="https://..." />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Date</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={input} />
              </div>
            </>
          )}
          <div>
            <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} className={input} />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit}>{saving ? "Adding..." : "Add"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

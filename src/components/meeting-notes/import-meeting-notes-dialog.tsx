"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { MeetingNote } from "@/lib/types";

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onAdd: (note: MeetingNote) => void;
}

interface ExtractedItem {
  task: string;
  assignee: string;
  priority: "high" | "medium" | "low" | null;
}

const SYSTEM_PROMPT =
  "You extract ONLY explicit follow-up tasks from meeting notes. Return ONLY a JSON array, no markdown, no explanation. Each item must have: task (string), assignee (string, or TBD if unknown), priority (high | medium | low | null). Only include tasks explicitly stated as follow-up or next steps. If none exist, return [].";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function deriveInitials(name: string): string | null {
  if (!name || name === "TBD") return null;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((w) => w[0]?.toUpperCase() ?? "").join("");
  return initials || null;
}

function mapPriority(p: ExtractedItem["priority"]): "High" | "Medium" | "Low" {
  if (p === "high") return "High";
  if (p === "low") return "Low";
  return "Medium";
}

function parseExtractionText(text: string): ExtractedItem[] {
  const trimmed = text.trim();
  const tryParse = (s: string): ExtractedItem[] | null => {
    try {
      const v = JSON.parse(s);
      return Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  };
  const direct = tryParse(trimmed);
  if (direct) return direct;
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start >= 0 && end > start) {
    const slice = tryParse(trimmed.slice(start, end + 1));
    if (slice) return slice;
  }
  throw new Error("Could not parse extraction response");
}

async function extractActionItems(notesBody: string): Promise<ExtractedItem[]> {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing NEXT_PUBLIC_ANTHROPIC_API_KEY");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: notesBody }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "";
  const items = parseExtractionText(text);
  return items.filter(
    (i) => i && typeof i.task === "string" && i.task.trim().length > 0
  );
}

export function ImportMeetingNotesDialog({ open, projectId, onClose, onAdd }: Props) {
  const [step, setStep] = useState<"compose" | "review">("compose");
  const [form, setForm] = useState({
    title: "",
    date: todayISO(),
    attendees: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [savingItems, setSavingItems] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setStep("compose");
    setForm({ title: "", date: todayISO(), attendees: "", notes: "" });
    setItems([]);
    setBusy(false);
    setSavingItems(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const handleExtractAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.notes.trim()) return;
    setBusy(true);

    const supabase = createClient();
    const { data: noteRow, error: noteErr } = await supabase
      .from("coeo_meeting_notes")
      .insert({
        project_id: projectId,
        title: form.title.trim(),
        date: form.date || null,
        attendees: form.attendees.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    if (noteErr || !noteRow) {
      setBusy(false);
      toast.error("Failed to save meeting note");
      return;
    }

    onAdd(noteRow as MeetingNote);

    try {
      const extracted = await extractActionItems(form.notes.trim());
      setItems(extracted);
      setStep("review");
    } catch {
      toast.error("Meeting note saved, but action item extraction failed");
      closeAndReset();
      return;
    } finally {
      setBusy(false);
    }
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (items.length === 0) {
      closeAndReset();
      return;
    }
    setSavingItems(true);
    const rows = items.map((it) => ({
      description: it.task.trim(),
      owner: it.assignee && it.assignee !== "TBD" ? it.assignee : null,
      owner_initials: deriveInitials(it.assignee),
      status: "Open",
      priority: mapPriority(it.priority),
      due_date: null,
      project_id: projectId,
      notes: null,
    }));

    const supabase = createClient();
    const { error } = await supabase.from("coeo_actions").insert(rows);
    setSavingItems(false);
    if (error) {
      toast.error("Failed to save action items");
      return;
    }
    closeAndReset();
  };

  const input =
    "border border-border rounded-card px-3 py-2 text-[15px] outline-none focus:border-accent w-full";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={closeAndReset}>
      <div
        className="bg-white rounded-card border border-border w-[620px] shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-cream px-6 py-4 border-b border-border rounded-t-card">
          <h3 className="text-[14px] font-semibold text-primary">
            {step === "compose" ? "Import meeting notes" : "Review extracted action items"}
          </h3>
        </div>

        {step === "compose" ? (
          <form onSubmit={handleExtractAndSave} className="px-6 py-5 flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Title</label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={input} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Date</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={input} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Attendees</label>
                <input type="text" value={form.attendees} onChange={(e) => set("attendees", e.target.value)} className={input} placeholder="Names, comma-separated" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1 block">Paste meeting notes</label>
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={10} className={input} placeholder="Paste the raw notes here…" />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button type="button" variant="ghost" onClick={closeAndReset} disabled={busy}>Cancel</Button>
              <Button type="submit" disabled={busy || !form.title.trim() || !form.notes.trim()}>
                {busy ? "Extracting…" : "Extract & save"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-3">
            {items.length === 0 ? (
              <div className="py-4 text-center text-[14px] text-text-muted">
                No action items detected in these notes.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((it, idx) => {
                  const pri = mapPriority(it.priority);
                  const variant = pri === "High" ? "red" : pri === "Low" ? "gray" : "amber";
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 px-3 py-2 border border-border rounded-card"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] text-text-primary leading-[1.45]">{it.task}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-text-secondary bg-cream px-2 py-[2px] rounded-pill">
                            {it.assignee || "TBD"}
                          </span>
                          <Badge status={pri} variant={variant} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-text-muted hover:text-destructive text-[18px] leading-none px-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-3">
              <Button type="button" variant="ghost" onClick={closeAndReset} disabled={savingItems}>
                {items.length === 0 ? "Done" : "Cancel"}
              </Button>
              {items.length > 0 && (
                <Button type="button" onClick={handleConfirm} disabled={savingItems}>
                  {savingItems ? "Saving…" : `Confirm & add ${items.length} item${items.length === 1 ? "" : "s"}`}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

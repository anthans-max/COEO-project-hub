"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddMeetingNoteDialog } from "./add-meeting-note-dialog";
import { EditMeetingNoteDialog } from "./edit-meeting-note-dialog";
import { ImportMeetingNotesDialog } from "./import-meeting-notes-dialog";
import { MeetingNoteDrawer } from "./meeting-note-drawer";
import { useMeetingNotes } from "@/lib/hooks/use-meeting-notes";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { MeetingNote } from "@/lib/types";

interface Props {
  projectId: string;
  initialData: MeetingNote[];
  compactHeader?: boolean;
  title?: string;
}

export function MeetingNotesList({ projectId, initialData, compactHeader, title }: Props) {
  const [allNotes, setNotes] = useMeetingNotes(initialData);
  const notes = allNotes
    .filter((n) => n.project_id === projectId)
    .sort((a, b) => (b.date ?? b.created_at).localeCompare(a.date ?? a.created_at));
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<MeetingNote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const toast = useToast();

  const selected = selectedId ? notes.find((n) => n.id === selectedId) ?? null : null;

  const handleSave = (u: MeetingNote) => setNotes((prev) => prev.map((n) => (n.id === u.id ? u : n)));

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = allNotes.find((n) => n.id === deleteId);
    setNotes((prev) => prev.filter((n) => n.id !== deleteId));
    setDeleteId(null);
    const supabase = createClient();
    const { error } = await supabase.from("coeo_meeting_notes").delete().eq("id", deleteId);
    if (error) {
      if (original) setNotes((prev) => [...prev, original]);
      toast.error("Failed to delete meeting note");
    }
  };

  return (
    <>
      <div className="flex justify-between items-end gap-2 mb-4">
        {title ? (
          <h2 className="text-[11px] font-semibold text-text-secondary tracking-[0.1em] uppercase">
            {title}
          </h2>
        ) : (
          <div />
        )}
        <div className="flex items-end gap-2">
          {compactHeader ? (
            <>
              <Button variant="ghost" onClick={() => setShowAdd(true)}>+ Add note</Button>
              <Button onClick={() => setShowImport(true)}>+ Import / Add</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setShowImport(true)}>Import meeting notes</Button>
              <Button onClick={() => setShowAdd(true)}>+ Add meeting note</Button>
            </>
          )}
        </div>
      </div>

      {notes.length === 0 ? (
        <Card className="p-8 text-center text-[15px] text-text-muted">No meeting notes yet</Card>
      ) : (
        <div className="flex flex-col border border-border rounded-card overflow-hidden bg-cream">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              className={`flex items-center justify-between gap-4 px-5 py-3 text-left border-b border-border last:border-b-0 transition-colors ${
                selectedId === n.id ? "bg-[#E5DFD5]" : "hover:bg-[#EDE8DF]"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium text-text-primary truncate">{n.title}</div>
                <div className="text-[12px] text-text-muted mt-[2px] truncate">
                  {n.date ? formatDate(n.date) : "No date"}
                  {n.attendees ? ` · ${n.attendees}` : ""}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      )}

      <MeetingNoteDrawer
        note={selected}
        onClose={() => setSelectedId(null)}
        onEdit={(n) => setEditing(n)}
        onDelete={(id) => setDeleteId(id)}
      />

      <AddMeetingNoteDialog
        open={showAdd}
        projectId={projectId}
        onClose={() => setShowAdd(false)}
        onAdd={(n) => setNotes((prev) => [...prev, n])}
      />

      <ImportMeetingNotesDialog
        open={showImport}
        projectId={projectId}
        onClose={() => setShowImport(false)}
        onAdd={(n) => setNotes((prev) => [...prev, n])}
      />

      <EditMeetingNoteDialog
        note={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={(id) => {
          setEditing(null);
          setDeleteId(id);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete meeting note"
        message="Are you sure you want to delete this meeting note?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

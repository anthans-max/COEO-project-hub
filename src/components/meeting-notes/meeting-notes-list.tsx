"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddMeetingNoteDialog } from "./add-meeting-note-dialog";
import { EditMeetingNoteDialog } from "./edit-meeting-note-dialog";
import { ImportMeetingNotesDialog } from "./import-meeting-notes-dialog";
import { useMeetingNotes } from "@/lib/hooks/use-meeting-notes";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { MeetingNote } from "@/lib/types";

interface Props {
  projectId: string;
  initialData: MeetingNote[];
}

export function MeetingNotesList({ projectId, initialData }: Props) {
  const [allNotes, setNotes] = useMeetingNotes(initialData);
  const notes = allNotes
    .filter((n) => n.project_id === projectId)
    .sort((a, b) => (b.date ?? b.created_at).localeCompare(a.date ?? a.created_at));
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<MeetingNote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

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
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="ghost" onClick={() => setShowImport(true)}>Import meeting notes</Button>
        <Button onClick={() => setShowAdd(true)}>+ Add meeting note</Button>
      </div>

      {notes.length === 0 ? (
        <Card className="p-8 text-center text-[15px] text-text-muted">No meeting notes yet</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <div className="text-[15px] font-semibold text-text-primary">{n.title}</div>
                  <div className="text-[12px] text-text-muted mt-[2px]">
                    {n.date ? formatDate(n.date) : "No date"}
                    {n.attendees ? ` · ${n.attendees}` : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => setEditing(n)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(n.id)}>Delete</Button>
                </div>
              </div>
              {n.notes && (
                <div className="text-[14px] text-text-primary whitespace-pre-wrap leading-relaxed mt-2">{n.notes}</div>
              )}
            </Card>
          ))}
        </div>
      )}

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

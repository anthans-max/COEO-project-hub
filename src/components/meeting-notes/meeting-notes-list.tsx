"use client";

import { useState } from "react";
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
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <table className="w-full border-collapse table-fixed min-w-[560px]">
          <thead>
            <tr className="bg-cream border-b border-border">
              <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[120px]">
                Date
              </th>
              <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3">
                Meeting Topic
              </th>
              <th className="text-left text-[12px] font-semibold text-text-secondary tracking-[0.07em] uppercase px-4 py-3 w-[220px]">
                Attendees
              </th>
            </tr>
          </thead>
          <tbody>
            {notes.map((n) => (
              <tr
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(n.id);
                  }
                }}
                className={`border-b border-border last:border-b-0 cursor-pointer transition-colors ${
                  selectedId === n.id ? "bg-[#E5DFD5]" : "bg-white hover:bg-cream"
                }`}
              >
                <td className="px-4 py-3 text-[13px] text-text-primary whitespace-nowrap align-middle">
                  {n.date ? formatDate(n.date) : "—"}
                </td>
                <td className="px-4 py-3 text-[14px] text-text-primary align-middle truncate">
                  {n.title}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-muted align-middle truncate">
                  {n.attendees || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

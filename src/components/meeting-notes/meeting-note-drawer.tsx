"use client";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { MeetingNote } from "@/lib/types";

interface Props {
  note: MeetingNote | null;
  onClose: () => void;
  onEdit: (note: MeetingNote) => void;
  onDelete: (id: string) => void;
}

export function MeetingNoteDrawer({ note, onClose, onEdit, onDelete }: Props) {
  if (!note) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div
        className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-border shadow-lg z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[18px] font-medium text-text-primary truncate">{note.title}</div>
            <div className="text-[12px] text-text-muted mt-1">
              {note.date ? formatDate(note.date) : "No date"}
              {note.attendees ? ` · ${note.attendees}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text-primary text-[20px] leading-none shrink-0 -mt-1"
          >
            ×
          </button>
        </div>
        <div className="border-b border-border" />
        <div className="flex-1 overflow-y-auto px-6 py-5 text-[14px] text-text-primary whitespace-pre-wrap leading-[1.7]">
          {note.notes || <span className="text-text-muted">No notes</span>}
        </div>
        <div className="border-t border-border" />
        <div className="px-6 py-4 flex justify-end gap-2">
          <Button variant="destructive" size="sm" onClick={() => onDelete(note.id)}>Delete</Button>
          <Button size="sm" onClick={() => onEdit(note)}>Edit</Button>
        </div>
      </div>
    </>
  );
}

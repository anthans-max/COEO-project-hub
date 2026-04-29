"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { preprocessNoteText } from "@/lib/format-note";
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
            <div className="text-[18px] font-medium text-text-primary break-words">{note.title}</div>
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
        <div className="flex-1 overflow-y-auto px-6 py-5 text-[14px] text-text-primary leading-[1.7]">
          {note.notes ? (
            <ReactMarkdown
              components={{
                /* eslint-disable @typescript-eslint/no-unused-vars */
                p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-medium" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-3 flex flex-col gap-1 [&_ul]:list-[circle] [&_ul]:pl-6 [&_ul]:mt-1 [&_ul]:mb-0" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-3 flex flex-col gap-1" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-[18px] font-medium mt-4 mb-2 first:mt-0" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-[16px] font-medium mt-4 mb-2 first:mt-0" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-[15px] font-medium mt-3 mb-2 first:mt-0" {...props} />,
                a: ({ node, ...props }) => <a className="text-accent underline" target="_blank" rel="noreferrer" {...props} />,
                code: ({ node, ...props }) => <code className="bg-cream px-1 py-0.5 rounded text-[13px] break-words [overflow-wrap:anywhere]" {...props} />,
                pre: ({ node, ...props }) => <pre className="bg-cream p-3 rounded text-[13px] mb-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] [&>code]:bg-transparent [&>code]:p-0" {...props} />,
                /* eslint-enable @typescript-eslint/no-unused-vars */
              }}
            >
              {preprocessNoteText(note.notes)}
            </ReactMarkdown>
          ) : (
            <span className="text-text-muted">No notes</span>
          )}
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

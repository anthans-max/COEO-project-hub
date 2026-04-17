"use client";

import { useState } from "react";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { EditHighlightDialog } from "./edit-highlight-dialog";
import type { KeyHighlight } from "@/lib/types";

interface CardStyle {
  bg: string;
  icon: React.ReactNode;
}

const CARD_STYLES: CardStyle[] = [
  {
    bg: "#E8F5E9",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <path d="M3 8.5L6.5 12L13 4" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    bg: "#E3F2FD",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <circle cx="8" cy="8" r="5" stroke="#2980B9" strokeWidth="1.5" />
        <path d="M8 5.5V8.5L10 10" stroke="#2980B9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    bg: "#F3E5F5",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
        <path d="M4 12L8 4L12 12" stroke="#7B68EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 9.5H10.5" stroke="#7B68EE" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const FALLBACK_STYLE: CardStyle = {
  bg: "#EEEAE2",
  icon: (
    <svg viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px]">
      <circle cx="8" cy="8" r="4" stroke="#6B6560" strokeWidth="1.5" />
    </svg>
  ),
};

interface Props {
  initialData: KeyHighlight[];
}

export function Highlights({ initialData }: Props) {
  const [highlights, setHighlights] = useRealtime<KeyHighlight>(
    "coeo_key_highlights",
    initialData
  );
  const [editing, setEditing] = useState<KeyHighlight | null>(null);

  const sorted = [...highlights].sort((a, b) => a.sort_order - b.sort_order);

  const handleSave = (updated: KeyHighlight) => {
    setHighlights((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sorted.map((h, index) => {
          const style = CARD_STYLES[h.sort_order] ?? CARD_STYLES[index] ?? FALLBACK_STYLE;
          return (
            <div
              key={h.id}
              className="p-[14px] border border-border rounded-[10px] bg-white group relative"
            >
              <button
                onClick={() => setEditing(h)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium text-white bg-primary px-2 py-[2px] rounded-pill hover:bg-primary/90"
                aria-label={`Edit ${h.category}`}
              >
                Edit
              </button>
              <div className="flex items-center gap-2 mb-[10px]">
                <div
                  className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0"
                  style={{ background: style.bg }}
                >
                  {style.icon}
                </div>
                <div className="text-[12px] text-[#6B6560]">{h.category}</div>
              </div>
              <div className="text-[15px] font-medium text-primary mb-1">{h.headline}</div>
              <div className="text-[14px] text-[#6B6560] leading-[1.5]">{h.body}</div>
            </div>
          );
        })}
      </div>

      <EditHighlightDialog
        highlight={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  );
}

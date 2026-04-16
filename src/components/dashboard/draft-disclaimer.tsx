"use client";

import { useState } from "react";

export function DraftDisclaimer() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="-mt-6 md:-mt-8 -mx-4 md:-mx-8 mb-5 flex items-center gap-3 px-5 py-2.5"
      style={{
        backgroundColor: "#FFF8E1",
        borderBottom: "1px solid #F4C842",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="#8B6914"
        strokeWidth="1.5"
        className="shrink-0"
        aria-hidden
      >
        <circle cx="8" cy="8" r="7" />
        <line x1="8" y1="4.5" x2="8" y2="8.5" strokeLinecap="round" />
        <circle cx="8" cy="11.25" r="0.25" fill="#8B6914" stroke="none" />
      </svg>
      <div className="flex-1 flex flex-col md:flex-row md:items-baseline md:gap-1.5 min-w-0">
        <span
          className="text-[11px] font-bold uppercase shrink-0"
          style={{ color: "#8B6914", letterSpacing: "0.08em" }}
        >
          DRAFT —
        </span>
        <span className="text-[12px] leading-snug" style={{ color: "#5C4A1E" }}>
          This dashboard contains preliminary information that is pending review
          and confirmation by key stakeholders. Data should not be treated as
          final.
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss draft notice"
        className="shrink-0 flex items-center justify-center w-5 h-5 text-[18px] leading-none hover:opacity-70"
        style={{ color: "#8B6914" }}
      >
        ×
      </button>
    </div>
  );
}

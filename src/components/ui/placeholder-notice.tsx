"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "coeo:placeholder-notice-dismissed";

export function PlaceholderNotice() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed) return null;

  const onDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="flex items-start justify-between gap-3 text-[12px] text-text-muted italic mb-4">
      <span>
        Progress figures and project descriptions shown are illustrative placeholders pending confirmation with project owners.
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notice"
        className="text-text-muted hover:text-primary leading-none not-italic"
      >
        ×
      </button>
    </div>
  );
}

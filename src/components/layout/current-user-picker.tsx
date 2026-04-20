"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useCurrentPerson } from "@/lib/hooks/use-current-person";

export function CurrentUserPicker() {
  const { allPeople, current, setCurrent } = useCurrentPerson();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const pick = (id: string | null) => {
    setCurrent(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {current ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-pill border border-border bg-white hover:bg-cream transition-colors"
          title="Change identity"
        >
          <Avatar
            initials={current.initials ?? current.name.slice(0, 2).toUpperCase()}
            color={current.color ?? "#0A2342"}
            size="sm"
          />
          <span className="text-[13px] font-medium text-primary hidden sm:block">
            {current.name}
          </span>
          <svg width="10" height="6" viewBox="0 0 10 6" className="text-text-muted">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[13px] font-medium text-text-muted hover:text-primary underline-offset-2 hover:underline"
        >
          Set your name
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 max-h-72 overflow-y-auto bg-white border border-border rounded-card shadow-lg z-50">
          <div className="px-3 py-2 text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase border-b border-border">
            I am…
          </div>
          {allPeople.length === 0 && (
            <div className="px-3 py-3 text-[13px] text-text-muted">No people available</div>
          )}
          {allPeople.map((p) => {
            const selected = current?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-cream transition-colors ${
                  selected ? "bg-cream" : ""
                }`}
              >
                <Avatar
                  initials={p.initials ?? p.name.slice(0, 2).toUpperCase()}
                  color={p.color ?? "#0A2342"}
                  size="sm"
                />
                <span className="text-[13px] text-primary flex-1 truncate">{p.name}</span>
                {selected && (
                  <span className="text-[11px] text-text-muted">Selected</span>
                )}
              </button>
            );
          })}
          {current && (
            <button
              type="button"
              onClick={() => pick(null)}
              className="w-full text-left px-3 py-2 text-[12px] text-text-muted hover:bg-cream transition-colors border-t border-border"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}

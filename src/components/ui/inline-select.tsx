"use client";

import { cn } from "@/lib/utils";

interface InlineSelectProps {
  value: string;
  options: readonly string[];
  onSave: (value: string) => void;
  className?: string;
}

export function InlineSelect({ value, options, onSave, className }: InlineSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onSave(e.target.value)}
      className={cn(
        "bg-transparent border-none text-[11px] text-text-primary cursor-pointer outline-none hover:bg-cream/60 rounded px-1 py-0.5 -mx-1 appearance-none",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

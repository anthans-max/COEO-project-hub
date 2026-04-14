"use client";

import { cn } from "@/lib/utils";

interface FilterBarProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}

export function FilterBar({ options, selected, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-[6px] mb-[18px] flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "text-[13px] font-medium px-[14px] py-[5px] rounded-pill border transition-all cursor-pointer",
            selected === opt
              ? "bg-primary text-white border-primary"
              : "bg-transparent text-badge-gray-text border-[#C8C0B4] hover:bg-cream"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

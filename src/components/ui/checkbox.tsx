"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-4 h-4 rounded-full border-[1.5px] shrink-0 mt-[1px] flex items-center justify-center transition-all cursor-pointer",
        checked
          ? "bg-primary border-primary"
          : "border-[#C8C0B4] hover:border-primary",
        className
      )}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

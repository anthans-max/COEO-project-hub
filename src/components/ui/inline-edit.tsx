"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}

export function InlineEdit({ value, onSave, className, placeholder = "—", multiline = false }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    if (draft !== value) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    }
    if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  };

  if (editing) {
    const sharedProps = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref: inputRef as any,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: cn(
        "w-full bg-white border border-accent/40 rounded px-1.5 py-0.5 text-text-primary outline-none focus:border-accent",
        className
      ),
    };

    if (multiline) {
      return <textarea {...sharedProps} rows={2} />;
    }
    return <input type="text" {...sharedProps} />;
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={cn(
        "cursor-pointer hover:bg-cream/60 rounded px-1 -mx-1 transition-colors",
        !value && "text-text-muted italic",
        className
      )}
    >
      {value || placeholder}
    </span>
  );
}

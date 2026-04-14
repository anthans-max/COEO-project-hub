"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  categoryName: string | null;
  onClose: () => void;
  onSave: (oldName: string, newName: string) => void;
}

export function EditCategoryDialog({ categoryName, onClose, onSave }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (categoryName) setName(categoryName);
  }, [categoryName]);

  if (!categoryName) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === categoryName) {
      onClose();
      return;
    }
    onSave(categoryName, trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-card border border-border p-6 w-[360px] shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-[14px] font-semibold text-primary mb-4">Rename category</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-border rounded-card px-3 py-2 text-[13px] outline-none focus:border-accent"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

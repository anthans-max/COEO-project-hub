"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddSystemDialog } from "./add-system-dialog";
import { EditSystemDialog } from "./edit-system-dialog";
import { AddCategoryDialog } from "./add-category-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { System, SystemCategory } from "@/lib/types";

interface Props {
  initialData: System[];
  initialCategories: SystemCategory[];
}

function sortCategories(cats: string[]): string[] {
  return [...cats].sort((a, b) => {
    if (a === "Internal System") return -1;
    if (b === "Internal System") return 1;
    if (a === "Data Source") return -1;
    if (b === "Data Source") return 1;
    return a.localeCompare(b);
  });
}

function pluralize(cat: string): string {
  if (cat === "Internal System") return "Internal Systems";
  if (cat === "Data Source") return "Data Sources";
  return cat;
}

export function SystemsGrid({ initialData, initialCategories }: Props) {
  const [systems, setSystems] = useRealtime("coeo_systems", initialData);
  const [categories, setCategories] = useRealtime("coeo_system_categories", initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editSystem, setEditSystem] = useState<System | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleEditSave = (updated: System) => {
    setSystems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = systems.find((s) => s.id === deleteId);
    setSystems((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_systems").delete().eq("id", deleteId);
    if (error) {
      if (original) setSystems((prev) => [...prev, original]);
      toast.error("Failed to delete system");
    }
  };

  // Safe accessor: handles string[] (correct), string (legacy), null/undefined
  const getCategories = (s: System): string[] =>
    Array.isArray(s.category) ? s.category : s.category ? [s.category as unknown as string] : [];

  // Union categories from table and from system data
  const tableCatNames = (categories ?? []).map((c) => c.name);
  const systemCatNames = (systems ?? []).flatMap(getCategories);
  const allCatNames = sortCategories(Array.from(new Set([...tableCatNames, ...systemCatNames])));

  // All category names for dialogs
  const categoryOptions = allCatNames;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add system</Button>
      </div>

      {allCatNames.map((cat) => {
        const catSystems = systems.filter((s) => getCategories(s).includes(cat));
        return (
          <div key={cat} className="mb-[24px]">
            <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-[10px] pb-[6px] border-b border-border mt-[32px]">
              {pluralize(cat)}
            </div>
            {catSystems.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[10px]">
                {catSystems.map((system) => (
                  <div
                    key={`${cat}-${system.id}`}
                    className="bg-cream border border-border rounded-card px-4 py-[14px] group relative"
                  >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditSystem(system)}
                        className="text-[10px] font-medium text-white bg-primary px-2 py-[2px] rounded-pill hover:bg-primary/90"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(system.id)}
                        className="text-[10px] font-medium text-white bg-destructive px-2 py-[2px] rounded-pill hover:bg-destructive/90"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="text-[13px] font-semibold text-primary mb-[3px]">{system.name}</div>
                    <div className="text-[11px] text-text-secondary mb-[10px]">{system.subtitle}</div>
                    <Badge status={system.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-[12px] text-text-muted">No systems in this category</div>
            )}
          </div>
        );
      })}

      {allCatNames.length === 0 && (
        <div className="py-8 text-center text-[13px] text-text-muted">No systems yet</div>
      )}

      <button
        onClick={() => setShowAddCategory(true)}
        className="text-[12px] font-medium text-primary hover:underline mt-2"
      >
        + Add category
      </button>

      <AddSystemDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(system) => setSystems((prev) => [...prev, system])}
        categoryOptions={categoryOptions}
      />

      <EditSystemDialog
        system={editSystem}
        onClose={() => setEditSystem(null)}
        onSave={handleEditSave}
        categoryOptions={categoryOptions}
      />

      <AddCategoryDialog
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onAdd={(cat) => setCategories((prev) => [...prev, cat])}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete system"
        message="Are you sure you want to delete this system?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

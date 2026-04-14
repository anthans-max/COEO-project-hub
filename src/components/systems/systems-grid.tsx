"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddSystemDialog } from "./add-system-dialog";
import { EditSystemDialog } from "./edit-system-dialog";
import { AddCategoryDialog } from "./add-category-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";
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
  const [hideEmpty, setHideEmpty] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string | null>(null);
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

  const handleCategoryRename = async (oldName: string, newName: string) => {
    // Optimistic update: rename in categories table state
    setCategories((prev) =>
      prev.map((c) => (c.name === oldName ? { ...c, name: newName } : c))
    );
    // Optimistic update: rename in all systems that reference this category
    setSystems((prev) =>
      prev.map((s) => {
        const cats = getCategories(s);
        if (!cats.includes(oldName)) return s;
        return { ...s, category: cats.map((c) => (c === oldName ? newName : c)) };
      })
    );

    const supabase = createClient();

    // Update the categories table
    const { error: catError } = await supabase
      .from("coeo_system_categories")
      .update({ name: newName })
      .eq("name", oldName);

    if (catError) {
      // Revert
      setCategories((prev) =>
        prev.map((c) => (c.name === newName ? { ...c, name: oldName } : c))
      );
      setSystems((prev) =>
        prev.map((s) => {
          const cats = getCategories(s);
          if (!cats.includes(newName)) return s;
          return { ...s, category: cats.map((c) => (c === newName ? oldName : c)) };
        })
      );
      toast.error("Failed to rename category");
      return;
    }

    // Update all systems that had the old category name
    const affectedSystems = systems.filter((s) => getCategories(s).includes(oldName));
    for (const sys of affectedSystems) {
      const updatedCats = getCategories(sys).map((c) => (c === oldName ? newName : c));
      await supabase
        .from("coeo_systems")
        .update({ category: updatedCats })
        .eq("id", sys.id);
    }
  };

  const handleCategoryDelete = async () => {
    if (!deleteCategoryName) return;
    const catName = deleteCategoryName;
    setDeleteCategoryName(null);

    // Count systems in this category
    const count = systems.filter((s) => getCategories(s).includes(catName)).length;
    if (count > 0) {
      toast.error(`${count} system${count === 1 ? " is" : "s are"} assigned to this category. Reassign them before deleting.`);
      return;
    }

    // Optimistic remove
    const original = categories.find((c) => c.name === catName);
    setCategories((prev) => prev.filter((c) => c.name !== catName));

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_system_categories")
      .delete()
      .eq("name", catName);

    if (error) {
      if (original) setCategories((prev) => [...prev, original]);
      toast.error("Failed to delete category");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-4 mb-4">
        <label className="flex items-center gap-[6px] text-[11px] text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideEmpty}
            onChange={(e) => setHideEmpty(e.target.checked)}
            className="accent-primary"
          />
          Hide empty categories
        </label>
        <Button onClick={() => setShowAdd(true)}>+ Add system</Button>
      </div>

      {allCatNames.map((cat) => {
        const catSystems = systems.filter((s) => getCategories(s).includes(cat));
        if (hideEmpty && catSystems.length === 0) return null;
        return (
          <div key={cat} className="mb-[24px]">
            <div className="flex items-center justify-between mb-[10px] pb-[6px] border-b border-border mt-[32px] group/header">
              <span className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase">
                {pluralize(cat)}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditCategoryName(cat)}
                  className="text-primary hover:text-primary/70 transition-colors"
                  title="Rename category"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteCategoryName(cat)}
                  className="text-destructive hover:text-destructive/70 transition-colors"
                  title="Delete category"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4m2 0v9.33a1.33 1.33 0 01-1.34 1.34H4.67a1.33 1.33 0 01-1.34-1.34V4h9.34z" />
                  </svg>
                </button>
              </div>
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

      <EditCategoryDialog
        categoryName={editCategoryName}
        onClose={() => setEditCategoryName(null)}
        onSave={handleCategoryRename}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete system"
        message="Are you sure you want to delete this system?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!deleteCategoryName}
        title="Delete category"
        message={
          deleteCategoryName
            ? (() => {
                const count = systems.filter((s) => getCategories(s).includes(deleteCategoryName)).length;
                return count > 0
                  ? `${count} system${count === 1 ? " is" : "s are"} assigned to this category. Reassign them before deleting.`
                  : `Are you sure you want to delete the "${deleteCategoryName}" category?`;
              })()
            : ""
        }
        onConfirm={handleCategoryDelete}
        onCancel={() => setDeleteCategoryName(null)}
      />
    </>
  );
}

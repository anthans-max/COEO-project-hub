"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddPersonDialog } from "./add-person-dialog";
import { EditPersonDialog } from "./edit-person-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import type { Person } from "@/lib/types";

interface Props {
  initialData: Person[];
}

export function PeopleGrid({ initialData }: Props) {
  const [people, setPeople] = useRealtime("coeo_people", initialData);
  const [showAdd, setShowAdd] = useState(false);
  const [editPerson, setEditPerson] = useState<Person | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleEditSave = (updated: Person) => {
    setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = people.find((p) => p.id === deleteId);
    setPeople((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_people").delete().eq("id", deleteId);
    if (error) {
      if (original) setPeople((prev) => [...prev, original]);
      toast.error("Failed to delete person");
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAdd(true)}>+ Add person</Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
        {people.map((person) => (
          <div
            key={person.id}
            className="bg-cream border border-border rounded-card p-4 group relative"
          >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditPerson(person)}
                className="text-[10px] font-medium text-white bg-primary px-2 py-[2px] rounded-pill hover:bg-primary/90"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteId(person.id)}
                className="text-[10px] font-medium text-white bg-destructive px-2 py-[2px] rounded-pill hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
            <Avatar
              initials={person.initials || "?"}
              color={person.color || "#0A2342"}
              className="mb-[10px]"
            />
            <div className="text-[15px] font-semibold text-primary">{person.name}</div>
            <div className="text-[13px] text-text-secondary">{person.role}</div>
            <div className="text-[10px] text-text-muted mt-1">{person.organization}</div>
            {person.focus_areas && person.focus_areas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {person.focus_areas.map((area) => (
                  <span
                    key={area}
                    className="text-[9px] font-medium text-text-secondary bg-white px-2 py-[2px] rounded-pill border border-border"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {people.length === 0 && (
        <div className="py-8 text-center text-[15px] text-text-muted">No people yet</div>
      )}

      <AddPersonDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(person) => setPeople((prev) => [...prev, person])}
      />

      <EditPersonDialog
        person={editPerson}
        onClose={() => setEditPerson(null)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete person"
        message="Are you sure you want to remove this person?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

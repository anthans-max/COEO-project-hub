"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { useProjects } from "@/lib/hooks/use-projects";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";

interface Props {
  initialProject: Project;
}

export function ProjectEditAction({ initialProject }: Props) {
  const [projects, setProjects] = useProjects([initialProject]);
  const project = projects.find((p) => p.id === initialProject.id) ?? initialProject;
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const handleSave = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from("coeo_projects").delete().eq("id", deleteId);
    if (error) {
      toast.error("Failed to delete project");
      return;
    }
    router.push("/projects");
  };

  return (
    <>
      <Button onClick={() => setEditing(project)}>Edit project</Button>

      <EditProjectDialog
        project={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={(id) => {
          setEditing(null);
          setDeleteId(id);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete project"
        message="Are you sure you want to delete this project? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

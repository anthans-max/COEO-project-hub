"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function ProjectDetailHeader({ initialProject }: Props) {
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
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-[22px] font-semibold text-primary tracking-[-0.2px]">{project.name}</h1>
              <Badge status={project.status} />
            </div>
            {project.key_risk && (
              <div className="text-[13px] text-text-secondary mb-3">{project.key_risk}</div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-3">
              <Meta label="Owner" value={project.owner ?? "Unassigned"} />
              <Meta label="Current phase" value={project.phase_current ?? "—"} />
              <Meta label="Next phase" value={project.phase_next ?? "—"} />
              <div>
                <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1">Progress</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[6px] bg-border rounded-sm overflow-hidden">
                    <div className="h-full bg-primary rounded-sm transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-[13px] text-text-secondary">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <Button onClick={() => setEditing(project)}>Edit project</Button>
          </div>
        </div>
      </Card>

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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1">{label}</div>
      <div className="text-[13px] text-text-primary">{value}</div>
    </div>
  );
}

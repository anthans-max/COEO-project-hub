"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterBar } from "@/components/ui/filter-bar";
import { AddProjectDialog } from "./add-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";
import { useProjects } from "@/lib/hooks/use-projects";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { Project } from "@/lib/types";

interface Props {
  initialData: Project[];
}

export function ProjectsTable({ initialData }: Props) {
  const [projects, setProjects] = useProjects(initialData);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  const statusOptions = ["All", ...PROJECT_STATUSES];
  const filtered = statusFilter === "All" ? projects : projects.filter((p) => p.status === statusFilter);

  const handleEditSave = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const original = projects.find((p) => p.id === deleteId);
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_projects").delete().eq("id", deleteId);
    if (error) {
      if (original) setProjects((prev) => [...prev, original]);
      toast.error("Failed to delete project");
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <FilterBar options={statusOptions} selected={statusFilter} onChange={setStatusFilter} />
        <Button onClick={() => setShowAdd(true)}>+ Add project</Button>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase flex-1 min-w-[160px]">Project</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[110px]">Owner</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[90px]">Status</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[72px] text-right">Progress</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[180px]">Current phase</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[120px]"></div>
        </CardHeader>
        {filtered.map((project) => (
          <div
            key={project.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/projects/${project.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/projects/${project.id}`);
              }
            }}
            className="flex items-center gap-3 px-4 py-[11px] border-b border-border-light last:border-b-0 cursor-pointer hover:bg-cream transition-colors"
          >
            <div className="flex-1 min-w-[160px]">
              <div className="text-[15px] font-medium text-text-primary">{project.name}</div>
              {project.notes && (
                <div className="text-[13px] text-text-muted mt-1">{project.notes}</div>
              )}
            </div>
            <div className="text-[13px] text-text-secondary w-[110px] shrink-0">
              {project.owner || "Unassigned"}
            </div>
            <div className="w-[90px] shrink-0">
              <Badge status={project.status} />
            </div>
            <ProgressBar value={project.progress} />
            <div className="w-[180px] shrink-0 text-[13px] text-text-muted">
              {project.phase_current || "—"}
            </div>
            <div className="w-[120px] shrink-0 flex justify-end gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditProject(project);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(project.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-[15px] text-text-muted">No projects found</div>
        )}
      </Card>

      <AddProjectDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(project) => setProjects((prev) => [...prev, project])}
      />

      <EditProjectDialog
        project={editProject}
        onClose={() => setEditProject(null)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete project"
        message="Are you sure? This will also remove linked milestones."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

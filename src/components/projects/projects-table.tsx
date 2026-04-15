"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <FilterBar options={statusOptions} selected={statusFilter} onChange={setStatusFilter} />
        <Button onClick={() => setShowAdd(true)}>+ Add project</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-[15px] text-text-muted border border-border rounded-card bg-cream">
          No projects found
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              className="bg-cream border-[0.5px] border-border rounded-card p-5 cursor-pointer hover:bg-[#EDE8DF] hover:border-[#C8C0B4] transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-[15px] font-medium text-text-primary min-w-0 truncate">
                  {project.name}
                </div>
                <div className="shrink-0">
                  <Badge status={project.status} />
                </div>
              </div>

              {project.notes && (
                <div
                  className="text-[13px] text-text-muted overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {project.notes}
                </div>
              )}

              <div className="text-[13px] text-text-muted">
                {project.owner || "Unassigned"}
              </div>

              <ProgressBar value={project.progress} />

              <div className="flex items-end justify-between gap-3 mt-1">
                <div className="text-[12px] text-text-muted min-w-0 truncate">
                  {project.phase_current || "—"}
                </div>
                <div className="flex gap-2 shrink-0" onClick={stop}>
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
            </div>
          ))}
        </div>
      )}

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

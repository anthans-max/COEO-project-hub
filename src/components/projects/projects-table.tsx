"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "@/components/ui/inline-edit";
import { InlineSelect } from "@/components/ui/inline-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FilterBar } from "@/components/ui/filter-bar";
import { AddProjectDialog } from "./add-project-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { PROJECT_STATUSES } from "@/lib/constants";
import type { Project } from "@/lib/types";

interface Props {
  initialData: Project[];
}

export function ProjectsTable({ initialData }: Props) {
  const [projects, setProjects] = useRealtime("coeo_projects", initialData);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const statusOptions = ["All", ...PROJECT_STATUSES];
  const filtered = statusFilter === "All" ? projects : projects.filter((p) => p.status === statusFilter);

  const updateField = async (id: string, field: string, value: string | number) => {
    const original = projects.find((p) => p.id === id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_projects")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      if (original) setProjects((prev) => prev.map((p) => (p.id === id ? original : p)));
      toast.error("Failed to save");
    }
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

      <Card>
        <CardHeader>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase flex-1 min-w-[160px]">Project</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[110px]">Owner</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[100px]">Status</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[72px] text-right">Progress</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[200px]">Current phase</div>
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[60px]"></div>
        </CardHeader>
        {filtered.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-3 px-4 py-[11px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]"
          >
            <div className="flex-1 min-w-[160px]">
              <InlineEdit
                value={project.name}
                onSave={(v) => updateField(project.id, "name", v)}
                className="text-[13px] font-medium"
              />
              {project.key_risk && (
                <div className="text-[10px] text-text-muted mt-1">{project.key_risk}</div>
              )}
            </div>
            <div className="w-[110px] shrink-0">
              <InlineEdit
                value={project.owner ?? ""}
                onSave={(v) => updateField(project.id, "owner", v)}
                className="text-[11px] text-text-secondary"
                placeholder="Unassigned"
              />
            </div>
            <div className="w-[100px] shrink-0">
              <InlineSelect
                value={project.status}
                options={PROJECT_STATUSES}
                onSave={(v) => updateField(project.id, "status", v)}
              />
              <Badge status={project.status} className="mt-1" />
            </div>
            <ProgressBar value={project.progress} />
            <div className="w-[200px] shrink-0">
              <InlineEdit
                value={project.phase_current ?? ""}
                onSave={(v) => updateField(project.id, "phase_current", v)}
                className="text-[11px] text-text-muted"
                placeholder="No phase set"
              />
            </div>
            <div className="w-[60px] shrink-0 text-right">
              <Button variant="destructive" size="sm" onClick={() => setDeleteId(project.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-[13px] text-text-muted">No projects found</div>
        )}
      </Card>

      <AddProjectDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(project) => setProjects((prev) => [...prev, project])}
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

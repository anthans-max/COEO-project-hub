"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { AddMilestoneDialog } from "@/components/milestones/add-milestone-dialog";
import { EditMilestoneDialog } from "@/components/milestones/edit-milestone-dialog";
import { useRealtime } from "@/lib/hooks/use-realtime";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { GANTT_BAR_COLORS } from "@/lib/constants";
import type { Project, Milestone } from "@/lib/types";

interface Props {
  initialProjects: Project[];
  initialMilestones: Milestone[];
}

// Quarter boundaries for 2026
const quarters = [
  { label: "Q1 2026", start: new Date("2026-01-01"), end: new Date("2026-03-31") },
  { label: "Q2 2026", start: new Date("2026-04-01"), end: new Date("2026-06-30") },
  { label: "Q3 2026", start: new Date("2026-07-01"), end: new Date("2026-09-30") },
  { label: "Q4 2026", start: new Date("2026-10-01"), end: new Date("2026-12-31") },
];

const timelineStart = quarters[0].start.getTime();
const timelineEnd = quarters[quarters.length - 1].end.getTime();
const timelineRange = timelineEnd - timelineStart;

function dateToPercent(date: string | Date): number {
  const d = new Date(date).getTime();
  return Math.max(0, Math.min(100, ((d - timelineStart) / timelineRange) * 100));
}

function todayPercent(): number {
  return dateToPercent(new Date());
}

export function GanttChart({ initialProjects, initialMilestones }: Props) {
  const [projects, setProjects] = useRealtime("coeo_projects", initialProjects);
  const [milestones, setMilestones] = useRealtime("coeo_milestones", initialMilestones);

  const [tooltip, setTooltip] = useState<{ project: Project; x: number; y: number } | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
  const toast = useToast();

  const todayPct = todayPercent();

  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

  const handleProjectSave = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleProjectDeleteRequest = (id: string) => {
    setEditProject(null);
    setDeleteProjectId(id);
  };

  const handleProjectDelete = async () => {
    if (!deleteProjectId) return;
    const original = projects.find((p) => p.id === deleteProjectId);
    setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
    setDeleteProjectId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_projects").delete().eq("id", deleteProjectId);
    if (error) {
      if (original) setProjects((prev) => [...prev, original]);
      toast.error("Failed to delete project");
    }
  };

  const handleMilestoneSave = (updated: Milestone) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleMilestoneDeleteRequest = (id: string) => {
    setEditMilestone(null);
    setDeleteMilestoneId(id);
  };

  const handleMilestoneDelete = async () => {
    if (!deleteMilestoneId) return;
    const original = milestones.find((m) => m.id === deleteMilestoneId);
    setMilestones((prev) => prev.filter((m) => m.id !== deleteMilestoneId));
    setDeleteMilestoneId(null);

    const supabase = createClient();
    const { error } = await supabase.from("coeo_milestones").delete().eq("id", deleteMilestoneId);
    if (error) {
      if (original) setMilestones((prev) => [...prev, original]);
      toast.error("Failed to delete milestone");
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="ghost" onClick={() => setShowAddMilestone(true)}>+ Add milestone</Button>
        <Button onClick={() => setShowAddProject(true)}>+ Add project</Button>
      </div>

      <div className="border border-border rounded-card overflow-hidden bg-white">
        {/* Quarter headers */}
        <div className="flex">
          <div className="w-[200px] min-w-[200px] bg-cream border-b border-border border-r border-r-border px-4 py-3">
            <span className="text-[13px] font-semibold text-text-secondary tracking-[0.06em] uppercase">Project</span>
          </div>
          <div className="flex-1 flex">
            {quarters.map((q, i) => (
              <div
                key={q.label}
                className="flex-1 text-[13px] font-semibold text-text-secondary text-center border-l border-border py-3 tracking-[0.06em] uppercase bg-cream border-b border-b-border"
                style={{ borderLeft: i === 0 ? "none" : undefined }}
              >
                {q.label}
              </div>
            ))}
          </div>
        </div>

        {/* Project rows */}
        {projects.map((project) => {
          const barColor = GANTT_BAR_COLORS[project.status] || "#8A7E6E";
          const hasRange = project.start_date && project.end_date;
          const left = hasRange ? dateToPercent(project.start_date!) : 0;
          const right = hasRange ? dateToPercent(project.end_date!) : 0;
          const width = right - left;

          // Milestones for this project
          const projectMilestones = milestones.filter((m) => m.project_id === project.id && m.due_date);

          return (
            <div key={project.id} className="flex items-center min-h-[56px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]">
              {/* Label */}
              <div className="w-[200px] min-w-[200px] px-4 py-2 border-r border-border">
                <div className="text-[14px] font-medium text-text-primary leading-tight">{project.name}</div>
                <div className="text-[12px] text-text-muted font-normal">{project.owner}</div>
              </div>

              {/* Track */}
              <div className="flex-1 relative h-[56px] flex items-center">
                {/* Quarter dividers */}
                {quarters.map((_, i) => (
                  i > 0 && <div key={i} className="absolute top-0 bottom-0 border-l border-border" style={{ left: `${(i / 4) * 100}%` }} />
                ))}

                {/* Today line */}
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-accent opacity-60 pointer-events-none z-10"
                  style={{ left: `${todayPct}%` }}
                />

                {/* Project bar */}
                {hasRange && width > 0 && (
                  <div
                    className="absolute h-[26px] rounded flex items-center px-2 text-[12px] font-medium text-white overflow-hidden whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: barColor,
                    }}
                    onClick={() => setEditProject(project)}
                    onMouseEnter={(e) => setTooltip({ project, x: e.clientX, y: e.clientY })}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {width > 8 && project.name}
                  </div>
                )}

                {/* Milestone diamonds */}
                {projectMilestones.map((ms) => {
                  const msPct = dateToPercent(ms.due_date!);
                  return (
                    <div
                      key={ms.id}
                      className="absolute flex items-center justify-center w-5 h-[56px] cursor-pointer z-20"
                      style={{ left: `calc(${msPct}% - 10px)` }}
                      title={ms.title}
                      onClick={() => setEditMilestone(ms)}
                    >
                      <div className="w-[12px] h-[12px] rotate-45 bg-accent border-[1.5px] border-white" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed bg-primary text-white text-[10px] font-medium px-2 py-1 rounded-[5px] whitespace-nowrap z-50 pointer-events-none"
            style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
          >
            {tooltip.project.name} · {tooltip.project.owner} · {tooltip.project.status}
          </div>
        )}
      </div>

      {/* Add Project */}
      <AddProjectDialog
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        onAdd={(project) => setProjects((prev) => [...prev, project])}
      />

      {/* Edit Project (with Delete) */}
      <EditProjectDialog
        project={editProject}
        onClose={() => setEditProject(null)}
        onSave={handleProjectSave}
        onDelete={handleProjectDeleteRequest}
      />

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        open={!!deleteProjectId}
        title="Delete project"
        message="Are you sure you want to delete this project? This cannot be undone."
        onConfirm={handleProjectDelete}
        onCancel={() => setDeleteProjectId(null)}
      />

      {/* Add Milestone (with project selector) */}
      <AddMilestoneDialog
        open={showAddMilestone}
        onClose={() => setShowAddMilestone(false)}
        onAdd={(milestone) => setMilestones((prev) => [...prev, milestone])}
        projects={projectOptions}
      />

      {/* Edit Milestone */}
      <EditMilestoneDialog
        milestone={editMilestone}
        projects={projectOptions}
        onClose={() => setEditMilestone(null)}
        onSave={handleMilestoneSave}
        onDelete={handleMilestoneDeleteRequest}
      />

      {/* Delete Milestone Confirmation */}
      <ConfirmDialog
        open={!!deleteMilestoneId}
        title="Delete milestone"
        message="Are you sure you want to delete this milestone?"
        onConfirm={handleMilestoneDelete}
        onCancel={() => setDeleteMilestoneId(null)}
      />
    </>
  );
}

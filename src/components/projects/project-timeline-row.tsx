"use client";

import { useProjects } from "@/lib/hooks/use-projects";
import { createClient } from "@/lib/supabase/browser";
import { useToast } from "@/components/ui/toast";
import { ProgressDial } from "./progress-dial";
import { ProjectGantt } from "./project-gantt";
import type { Milestone, Project, ProjectPhase } from "@/lib/types";

interface Props {
  initialProject: Project;
  initialPhases: ProjectPhase[];
  initialMilestones: Milestone[];
}

export function ProjectTimelineRow({ initialProject, initialPhases, initialMilestones }: Props) {
  const [projects, setProjects] = useProjects([initialProject]);
  const project = projects.find((p) => p.id === initialProject.id) ?? initialProject;
  const toast = useToast();

  const setProgress = async (value: number) => {
    const prev = project.progress;
    setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, progress: value } : p)));
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_projects")
      .update({ progress: value })
      .eq("id", project.id);
    if (error) {
      setProjects((list) => list.map((p) => (p.id === project.id ? { ...p, progress: prev } : p)));
      toast.error("Failed to save progress");
    }
  };

  return (
    <div className="grid grid-cols-[140px_1fr] gap-5 mb-4">
      <ProgressDial value={project.progress} onChange={setProgress} />
      <ProjectGantt
        projectId={project.id}
        initialPhases={initialPhases}
        initialMilestones={initialMilestones}
      />
    </div>
  );
}

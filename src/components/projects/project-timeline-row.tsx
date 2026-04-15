"use client";

import { useEffect, useState } from "react";
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

// NOTE: do NOT subscribe to coeo_projects realtime here — ProjectDetailHeader
// already owns that subscription. A duplicate channel on the same table crashes
// the page on mount (see commit b017a72). We maintain local progress state and
// let the overview bar pick up remote updates through its own hook.
export function ProjectTimelineRow({ initialProject, initialPhases, initialMilestones }: Props) {
  const [progress, setLocalProgress] = useState<number>(initialProject.progress ?? 0);
  const toast = useToast();

  useEffect(() => {
    setLocalProgress(initialProject.progress ?? 0);
  }, [initialProject.progress]);

  const setProgress = async (value: number) => {
    const prev = progress;
    setLocalProgress(value);
    const supabase = createClient();
    const { error } = await supabase
      .from("coeo_projects")
      .update({ progress: value })
      .eq("id", initialProject.id);
    if (error) {
      setLocalProgress(prev);
      toast.error("Failed to save progress");
    }
  };

  return (
    <div className="grid grid-cols-[140px_1fr] gap-5 mb-4">
      <ProgressDial value={progress} onChange={setProgress} />
      <ProjectGantt
        projectId={initialProject.id}
        initialPhases={initialPhases}
        initialMilestones={initialMilestones}
      />
    </div>
  );
}

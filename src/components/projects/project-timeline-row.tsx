import { ProjectGantt } from "./project-gantt";
import type { Milestone, ProjectPhase } from "@/lib/types";

interface Props {
  projectId: string;
  initialPhases: ProjectPhase[];
  initialMilestones: Milestone[];
}

export function ProjectTimelineRow({ projectId, initialPhases, initialMilestones }: Props) {
  return (
    <div className="mb-4">
      <ProjectGantt
        projectId={projectId}
        initialPhases={initialPhases}
        initialMilestones={initialMilestones}
      />
    </div>
  );
}

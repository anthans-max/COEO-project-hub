import { ProjectGantt } from "./project-gantt";
import type { Milestone, ProjectPhase } from "@/lib/types";

interface PersonOption {
  id: string;
  name: string;
  initials: string | null;
}

interface Props {
  projectId: string;
  initialPhases: ProjectPhase[];
  initialMilestones: Milestone[];
  people: PersonOption[];
}

export function ProjectTimelineRow({ projectId, initialPhases, initialMilestones, people }: Props) {
  return (
    <div className="mb-4">
      <ProjectGantt
        projectId={projectId}
        initialPhases={initialPhases}
        initialMilestones={initialMilestones}
        people={people}
      />
    </div>
  );
}

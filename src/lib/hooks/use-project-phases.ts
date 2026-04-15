import { useRealtime } from "./use-realtime";
import type { ProjectPhase } from "@/lib/types";

export function useProjectPhases(initialData: ProjectPhase[]) {
  return useRealtime<ProjectPhase>("coeo_project_phases", initialData);
}

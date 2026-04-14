import { useRealtime } from "./use-realtime";
import type { Project } from "@/lib/types";

export function useProjects(initialData: Project[]) {
  return useRealtime<Project>("coeo_projects", initialData);
}

import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { GanttChart } from "@/components/roadmap/gantt-chart";
import type { Milestone } from "@/lib/types";

export default async function RoadmapPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: milestones }] = await Promise.all([
    supabase.from("coeo_projects").select("*").order("sort_order"),
    supabase.from("coeo_milestones").select("*, coeo_projects(name)").order("due_date"),
  ]);

  const mappedMilestones: Milestone[] = (milestones ?? []).map((m) => {
    const { coeo_projects, ...rest } = m as typeof m & { coeo_projects?: { name: string } | null };
    return {
      ...rest,
      project_name: coeo_projects?.name ?? undefined,
    } as Milestone;
  });

  return (
    <>
      <Topbar title="Roadmap" />
      <div className="pt-8 pb-7 px-8 flex-1 overflow-x-auto">
        <GanttChart initialProjects={projects ?? []} initialMilestones={mappedMilestones} />
      </div>
    </>
  );
}

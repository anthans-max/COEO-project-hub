import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { MilestonesList } from "@/components/milestones/milestones-list";
import type { Milestone } from "@/lib/types";

export default async function MilestonesPage() {
  const supabase = await createClient();

  const [{ data: milestones }, { data: projects }, { data: people }] = await Promise.all([
    supabase.from("coeo_milestones").select("*, coeo_projects(name)").order("due_date"),
    supabase.from("coeo_projects").select("id, name").order("sort_order"),
    supabase.from("coeo_people").select("id, name, initials").order("name"),
  ]);

  const mapped: Milestone[] = (milestones ?? []).map((m) => {
    const { coeo_projects, ...rest } = m as typeof m & { coeo_projects?: { name: string } | null };
    return {
      ...rest,
      project_name: coeo_projects?.name ?? undefined,
    } as Milestone;
  });

  return (
    <>
      <Topbar title="Milestones" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <MilestonesList
          initialData={mapped}
          projects={(projects ?? []) as { id: string; name: string }[]}
          people={(people ?? []) as { id: string; name: string; initials: string | null }[]}
        />
      </div>
    </>
  );
}

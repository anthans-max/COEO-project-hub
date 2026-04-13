import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { MilestonesList } from "@/components/milestones/milestones-list";
import type { Milestone } from "@/lib/types";

export default async function MilestonesPage() {
  const supabase = await createClient();
  const { data: milestones } = await supabase
    .from("coeo_milestones")
    .select("*, coeo_projects(name)")
    .order("due_date");

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
      <div className="p-7 px-8 flex-1">
        <MilestonesList initialData={mapped} />
      </div>
    </>
  );
}

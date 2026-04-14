import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/ui/metric-card";
import { ProjectStatusTable } from "@/components/dashboard/project-status-table";
import { ActionsWidget } from "@/components/dashboard/actions-widget";
import { MilestonesWidget } from "@/components/dashboard/milestones-widget";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: projectCount },
    { count: actionCount },
    { data: upcomingMilestones },
    { data: projects },
    { data: actions },
  ] = await Promise.all([
    supabase.from("coeo_projects").select("*", { count: "exact", head: true }).neq("status", "Complete"),
    supabase.from("coeo_actions").select("*", { count: "exact", head: true }).neq("status", "Complete"),
    supabase.from("coeo_milestones").select("*").neq("status", "Complete").order("due_date").limit(5),
    supabase.from("coeo_projects").select("*").neq("status", "Complete").order("sort_order").limit(5),
    supabase.from("coeo_actions").select("*").neq("status", "Complete").order("sort_order").limit(5),
  ]);

  const milestoneCount = upcomingMilestones?.length ?? 0;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-7 px-8 flex-1">
        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-[10px] mb-7">
          <MetricCard label="Active projects" value={projectCount ?? 0} sub={`${projects?.filter(p => p.status === 'In Progress').length ?? 0} in progress`} />
          <MetricCard label="Open actions" value={actionCount ?? 0} sub={`${actions?.filter(a => a.owner === 'Anthan Sunder').length ?? 0} assigned to you`} />
          <MetricCard label="Milestones (30d)" value={milestoneCount} sub="Upcoming" />
          <MetricCard label="Open questions" value={6} sub="3 high priority" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-[10px]">
              <div className="text-[11px] font-semibold text-primary tracking-[0.07em] uppercase">Project status</div>
              <a href="/projects" className="text-[13px] text-text-muted underline underline-offset-2 cursor-pointer">View all</a>
            </div>
            <ProjectStatusTable projects={projects ?? []} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-[10px]">
              <div className="text-[11px] font-semibold text-primary tracking-[0.07em] uppercase">My open actions</div>
              <a href="/actions" className="text-[13px] text-text-muted underline underline-offset-2 cursor-pointer">View all</a>
            </div>
            <ActionsWidget actions={actions ?? []} />
          </div>
        </div>

        {/* Upcoming milestones */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-[10px]">
            <div className="text-[11px] font-semibold text-primary tracking-[0.07em] uppercase">Upcoming milestones</div>
            <a href="/milestones" className="text-[13px] text-text-muted underline underline-offset-2 cursor-pointer">View all</a>
          </div>
          <MilestonesWidget milestones={upcomingMilestones ?? []} />
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { HeroBar } from "@/components/dashboard/hero-bar";
import { Highlights } from "@/components/dashboard/highlights";
import { DashboardRoadmap } from "@/components/dashboard/dashboard-roadmap";
import { ProjectStatusTable } from "@/components/dashboard/project-status-table";
import { RecentMeetings } from "@/components/dashboard/recent-meetings";
import { FeaturedSystems } from "@/components/dashboard/featured-systems";
import type { Project, ProjectPhase, Milestone, MeetingNote, System } from "@/lib/types";

const FEATURED_SYSTEM_NAMES = ["Salesforce", "Customer Portal", "Rev.io", "Data Warehouse"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: projectsData },
    { data: phasesData },
    { data: milestonesData },
    { data: meetingsData },
    { data: systemsData },
  ] = await Promise.all([
    supabase.from("coeo_projects").select("*").order("sort_order"),
    supabase.from("coeo_project_phases").select("*"),
    supabase.from("coeo_milestones").select("*"),
    supabase
      .from("coeo_meeting_notes")
      .select("*, coeo_projects(name)")
      .order("date", { ascending: false, nullsFirst: false })
      .limit(5),
    supabase.from("coeo_systems").select("*").in("name", FEATURED_SYSTEM_NAMES),
  ]);

  const projects = (projectsData ?? []) as Project[];
  const phases = (phasesData ?? []) as ProjectPhase[];
  const milestones = (milestonesData ?? []) as Milestone[];
  const systems = (systemsData ?? []) as System[];

  const meetings = ((meetingsData ?? []) as Array<MeetingNote & { coeo_projects?: { name: string } | null }>).map(
    ({ coeo_projects, ...rest }) => ({ ...rest, project_name: coeo_projects?.name ?? undefined })
  );

  const top5 = projects.slice(0, 5);
  const activeCount = projects.filter((p) => p.status !== "Complete").length;
  const ownerCount = new Set(projects.map((p) => p.owner).filter(Boolean)).size;
  const upcomingMilestoneCount = milestones.filter(
    (m) => m.status === "Upcoming" || m.status === "At Risk"
  ).length;
  const inProgressCount = projects.filter((p) => p.status === "In Progress").length;

  const featuredSystems = FEATURED_SYSTEM_NAMES
    .map((name) => systems.find((s) => s.name === name))
    .filter((s): s is System => Boolean(s));

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1">
        <HeroBar
          activeCount={activeCount}
          ownerCount={ownerCount}
          upcomingMilestoneCount={upcomingMilestoneCount}
          inProgressCount={inProgressCount}
        />

        <Section title="Key highlights">
          <Highlights />
        </Section>

        <Section title="Portfolio roadmap" linkLabel="View full roadmap" href="/projects/roadmap">
          <DashboardRoadmap projects={top5} phases={phases} milestones={milestones} />
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <SectionHeader title="Project status" linkLabel="View all" href="/projects" />
            <ProjectStatusTable projects={top5} />
          </div>
          <div>
            <SectionHeader title="Recent meetings" linkLabel="View all" href="/projects" />
            <RecentMeetings meetings={meetings} />
          </div>
        </div>

        <Section title="Systems landscape" linkLabel="View all systems" href="/systems">
          <FeaturedSystems systems={featuredSystems} />
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  linkLabel,
  href,
  children,
}: {
  title: string;
  linkLabel?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <SectionHeader title={title} linkLabel={linkLabel} href={href} />
      {children}
    </div>
  );
}

function SectionHeader({ title, linkLabel, href }: { title: string; linkLabel?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="text-[12px] font-semibold text-primary tracking-[0.05em] uppercase">{title}</div>
      {linkLabel && href && (
        <Link href={href} className="text-[12px] text-text-muted hover:text-primary shrink-0">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

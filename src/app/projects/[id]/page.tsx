import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/server";
import { Tabs } from "@/components/ui/tabs";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ActionsList } from "@/components/actions/actions-list";
import { MeetingNotesList } from "@/components/meeting-notes/meeting-notes-list";
// Hidden tabs (components preserved on disk for future re-enable):
// import { ProjectLinkedEntities } from "@/components/projects/project-linked-entities";
// import { GanttChart } from "@/components/roadmap/gantt-chart";
// import { DocsList } from "@/components/docs/docs-list";
import type {
  Project,
  Action,
  Milestone,
  MeetingNote,
  System,
  Vendor,
  Person,
} from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    projectRes,
    actionsRes,
    milestonesRes,
    notesRes,
    systemsJoinRes,
    vendorsJoinRes,
    peopleJoinRes,
  ] = await Promise.all([
    supabase.from("coeo_projects").select("*").eq("id", id).single(),
    supabase.from("coeo_actions").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("coeo_milestones").select("*").eq("project_id", id).order("due_date"),
    supabase.from("coeo_meeting_notes").select("*").eq("project_id", id),
    supabase.from("coeo_project_systems").select("coeo_systems(*)").eq("project_id", id),
    supabase.from("coeo_project_vendors").select("coeo_vendors(*)").eq("project_id", id),
    supabase.from("coeo_project_people").select("coeo_people(*)").eq("project_id", id),
  ]);

  const project = projectRes.data as Project | null;
  if (!project) notFound();

  const actions = (actionsRes.data ?? []) as Action[];
  const milestones = (milestonesRes.data ?? []) as Milestone[];
  const notes = (notesRes.data ?? []) as MeetingNote[];
  const flattenJoin = <T,>(rows: unknown, key: string): T[] => {
    const arr = (rows ?? []) as Record<string, unknown>[];
    return arr.flatMap((row) => {
      const v = row[key];
      if (!v) return [];
      return Array.isArray(v) ? (v as T[]) : [v as T];
    });
  };
  const systems = flattenJoin<System>(systemsJoinRes.data, "coeo_systems");
  const vendors = flattenJoin<Vendor>(vendorsJoinRes.data, "coeo_vendors");
  const people = flattenJoin<Person>(peopleJoinRes.data, "coeo_people");

  const projectOption = [{ id: project.id, name: project.name }];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <ProjectOverview
          project={project}
          actions={actions}
          milestones={milestones}
          systems={systems}
          vendors={vendors}
          people={people}
        />
      ),
    },
    {
      id: "actions",
      label: "Action Items",
      content: (
        <ActionsList
          initialData={actions}
          projects={projectOption}
          lockProjectId={project.id}
        />
      ),
    },
    {
      id: "meetings",
      label: "Meeting Notes",
      content: <MeetingNotesList projectId={project.id} initialData={notes} />,
    },
    // Hidden for now — will be re-enabled later:
    // Roadmap: <GanttChart initialProjects={[project]} initialMilestones={milestones} hideAddProject />
    // Docs: <DocsList projectId={project.id} initialData={docs} />
    // People/Vendors/Systems: <ProjectLinkedEntities people={people} vendors={vendors} systems={systems} />
  ];

  return (
    <>
      <Topbar title={project.name}>
        <Link
          href="/projects"
          className="text-[13px] text-text-muted hover:text-primary self-center mr-2"
        >
          ← Back to projects
        </Link>
      </Topbar>
      <div className="pt-8 pb-7 px-8 flex-1 overflow-x-auto">
        <ProjectDetailHeader initialProject={project} />
        <Tabs tabs={tabs} defaultTab="overview" />
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailHeader } from "@/components/projects/project-detail-header";
import { ProjectEditAction } from "@/components/projects/project-edit-action";
import { ActionsList } from "@/components/actions/actions-list";
import { MeetingNotesList } from "@/components/meeting-notes/meeting-notes-list";
import { ProjectTimelineRow } from "@/components/projects/project-timeline-row";
import type { Project, Action, MeetingNote, ProjectPhase, Milestone } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [projectRes, actionsRes, notesRes, phasesRes, milestonesRes] = await Promise.all([
    supabase.from("coeo_projects").select("*").eq("id", id).single(),
    supabase.from("coeo_actions").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("coeo_meeting_notes").select("*").eq("project_id", id),
    supabase.from("coeo_project_phases").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("coeo_milestones").select("*").eq("project_id", id).order("due_date"),
  ]);

  const project = projectRes.data as Project | null;
  if (!project) notFound();

  const actions = (actionsRes.data ?? []) as Action[];
  const notes = (notesRes.data ?? []) as MeetingNote[];
  const phases = (phasesRes.data ?? []) as ProjectPhase[];
  const milestones = (milestonesRes.data ?? []) as Milestone[];

  return (
    <>
      <Topbar
        title={project.name}
        badge={<Badge status={project.status} />}
        subtitle={project.notes ?? undefined}
        hideDate
      >
        <Link
          href="/projects"
          className="text-[15px] text-text-muted hover:text-primary self-center mr-2"
        >
          ← Back to projects
        </Link>
        <ProjectEditAction initialProject={project} />
      </Topbar>
      <div className="pt-6 md:pt-8 pb-7 px-4 md:px-8 flex-1 overflow-x-auto">
        <ProjectDetailHeader initialProject={project} />

        <ProjectTimelineRow
          projectId={project.id}
          initialPhases={phases}
          initialMilestones={milestones}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <ActionsList
              initialData={actions}
              projects={[{ id: project.id, name: project.name }]}
              lockProjectId={project.id}
              hideFilters
              title="Action items"
            />
          </section>

          <section>
            <MeetingNotesList
              projectId={project.id}
              initialData={notes}
              compactHeader
              title="Meeting notes"
            />
          </section>
        </div>
      </div>
    </>
  );
}

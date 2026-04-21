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
import { PmoTrackerUpload } from "@/components/pmo/pmo-tracker-upload";
import { PmoTrackerTable } from "@/components/pmo/pmo-tracker-table";
import type { Project, Action, MeetingNote, ProjectPhase, Milestone, PmoTrackerRow } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [projectRes, actionsRes, notesRes, phasesRes, milestonesRes, allProjectsRes, peopleRes, pmoRes] = await Promise.all([
    supabase.from("coeo_projects").select("*").eq("id", id).single(),
    supabase.from("coeo_actions").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("coeo_meeting_notes").select("*").eq("project_id", id),
    supabase.from("coeo_project_phases").select("*").eq("project_id", id).order("sort_order"),
    supabase.from("coeo_milestones").select("*").eq("project_id", id).order("due_date"),
    supabase.from("coeo_projects").select("id, name").order("sort_order"),
    supabase.from("coeo_people").select("id, name, initials").order("name"),
    supabase.from("coeo_pmo_tracker").select("*").order("item_no"),
  ]);

  const project = projectRes.data as Project | null;
  if (!project) notFound();

  const actions = (actionsRes.data ?? []) as Action[];
  const notes = (notesRes.data ?? []) as MeetingNote[];
  const phases = (phasesRes.data ?? []) as ProjectPhase[];
  const milestones = (milestonesRes.data ?? []) as Milestone[];
  const allProjects = (allProjectsRes.data ?? []) as { id: string; name: string }[];
  const people = (peopleRes.data ?? []) as { id: string; name: string; initials: string | null }[];
  const pmoRows = (pmoRes.data ?? []) as PmoTrackerRow[];
  const isPmoProject = project.name === "PMO";

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
          people={people}
        />

        {isPmoProject && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-[10px] pb-[6px] border-b border-border">
              <span className="text-[11px] font-semibold text-text-secondary tracking-[0.1em] uppercase">
                PMO Tracker
              </span>
              <PmoTrackerUpload />
            </div>
            <PmoTrackerTable initialRows={pmoRows} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <ActionsList
              initialData={actions}
              projects={allProjects}
              people={people}
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

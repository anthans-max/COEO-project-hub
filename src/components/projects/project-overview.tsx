import { Card } from "@/components/ui/card";
import type { Project, Action, Milestone, System, Vendor, Person } from "@/lib/types";

interface Props {
  project: Project;
  actions: Action[];
  milestones: Milestone[];
  systems: System[];
  vendors: Vendor[];
  people: Person[];
}

export function ProjectOverview({ project, actions, milestones, systems, vendors, people }: Props) {
  const openActions = actions.filter((a) => a.status !== "Complete").length;
  const today = new Date().toISOString().slice(0, 10);
  const upcomingMilestones = milestones.filter(
    (m) => m.status !== "Complete" && m.due_date && m.due_date >= today
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {project.notes && (
        <Card className="p-5">
          <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-2">Description</div>
          <div className="text-[14px] text-text-primary whitespace-pre-wrap leading-relaxed">{project.notes}</div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Open actions" value={openActions} />
        <Stat label="Upcoming milestones" value={upcomingMilestones} />
        <Stat label="People" value={people.length} />
        <Stat label="Vendors" value={vendors.length} />
        <Stat label="Systems" value={systems.length} />
      </div>

      <Card className="p-5">
        <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-3">Key dates</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
          <Meta label="Start date" value={project.start_date ?? "—"} />
          <Meta label="End date" value={project.end_date ?? "—"} />
          <Meta label="Key risk" value={project.key_risk ?? "—"} />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1">{label}</div>
      <div className="text-[22px] font-semibold text-primary">{value}</div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase mb-1">{label}</div>
      <div className="text-[13px] text-text-primary">{value}</div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { System, Vendor, Person } from "@/lib/types";

interface Props {
  people: Person[];
  vendors: Vendor[];
  systems: System[];
}

export function ProjectLinkedEntities({ people, vendors, systems }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="People">
        {people.length === 0 ? (
          <Empty label="No people linked to this project" />
        ) : (
          people.map((p) => (
            <Row key={p.id} primary={p.name} secondary={[p.role, p.organization].filter(Boolean).join(" · ")} tertiary={p.email ?? undefined} />
          ))
        )}
      </Section>

      <Section title="Vendors">
        {vendors.length === 0 ? (
          <Empty label="No vendors linked to this project" />
        ) : (
          vendors.map((v) => (
            <Row
              key={v.id}
              primary={v.name}
              secondary={[v.role, v.category].filter(Boolean).join(" · ")}
              tertiary={v.contact_email ?? undefined}
              badge={v.status}
            />
          ))
        )}
      </Section>

      <Section title="Systems">
        {systems.length === 0 ? (
          <Empty label="No systems linked to this project" />
        ) : (
          systems.map((s) => (
            <Row
              key={s.id}
              primary={s.name}
              secondary={s.subtitle ?? s.purpose ?? undefined}
              tertiary={s.owner ?? undefined}
              badge={s.status}
            />
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-text-secondary tracking-[0.1em] uppercase mb-[10px] pb-[6px] border-b border-border">
        {title}
      </div>
      <Card>{children}</Card>
    </div>
  );
}

function Row({
  primary,
  secondary,
  tertiary,
  badge,
}: {
  primary: string;
  secondary?: string;
  tertiary?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-text-primary">{primary}</div>
        {secondary && <div className="text-[13px] text-text-secondary mt-[2px]">{secondary}</div>}
      </div>
      {tertiary && <div className="text-[12px] text-text-muted shrink-0">{tertiary}</div>}
      {badge && <Badge status={badge} />}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="py-6 text-center text-[14px] text-text-muted">{label}</div>;
}

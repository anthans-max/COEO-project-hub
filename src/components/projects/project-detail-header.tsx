"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useProjects } from "@/lib/hooks/use-projects";
import type { Project } from "@/lib/types";

interface Props {
  initialProject: Project;
}

export function ProjectDetailHeader({ initialProject }: Props) {
  const seed = useMemo(() => [initialProject], [initialProject]);
  const [projects] = useProjects(seed);
  const project = projects.find((p) => p.id === initialProject.id) ?? initialProject;

  const cols = "grid grid-cols-2 md:grid-cols-5 gap-x-6";

  return (
    <Card className="mb-4">
      <div className={`${cols} bg-cream px-5 py-[10px] border-b border-border`}>
        <Label>Owner</Label>
        <Label>Current phase</Label>
        <Label>Next phase</Label>
        <Label>Key risk</Label>
        <Label>Progress</Label>
      </div>
      <div className={`${cols} bg-white px-5 py-[14px] gap-y-3`}>
        <Value>{project.owner ?? "Unassigned"}</Value>
        <Value>{project.phase_current ?? "—"}</Value>
        <Value>{project.phase_next ?? "—"}</Value>
        <Value>{project.key_risk ?? "—"}</Value>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[6px] bg-cream rounded-sm overflow-hidden">
            <div
              className="h-full bg-primary rounded-sm transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-[15px] text-text-secondary">{project.progress}%</span>
        </div>
      </div>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold text-text-secondary tracking-[0.07em] uppercase">
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <div className="text-[15px] text-text-primary">{children}</div>;
}

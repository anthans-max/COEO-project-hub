"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Project } from "@/lib/types";

interface Props {
  projects: Project[];
}

export function ProjectStatusTable({ projects }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase flex-1">Project</div>
        <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[110px]">Owner</div>
        <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[90px]">Status</div>
        <div className="text-[10px] font-semibold text-text-secondary tracking-[0.07em] uppercase w-[72px] text-right">Progress</div>
      </CardHeader>
      {projects.map((project) => (
        <div
          key={project.id}
          className="flex items-center gap-3 px-4 py-[11px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]"
        >
          <div className="flex-1">
            <div className="text-[13px] font-medium text-text-primary">{project.name}</div>
            <div className="text-[11px] text-text-muted mt-[1px]">{project.phase_current}</div>
          </div>
          <div className="text-[11px] text-text-secondary w-[110px] shrink-0">{project.owner}</div>
          <Badge status={project.status} />
          <ProgressBar value={project.progress} color={project.status === 'In Progress' && project.progress < 30 ? '#F4821F' : '#0A2342'} />
        </div>
      ))}
    </Card>
  );
}

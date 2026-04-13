"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import { isPast, parseISO } from "date-fns";
import type { Milestone } from "@/lib/types";

interface Props {
  milestones: Milestone[];
}

export function MilestonesWidget({ milestones }: Props) {
  return (
    <Card>
      {milestones.map((ms) => {
        const overdue = ms.due_date && isPast(parseISO(ms.due_date)) && ms.status !== "Complete";
        return (
          <div
            key={ms.id}
            className="flex items-center gap-3 px-4 py-[10px] border-b border-border-light last:border-b-0 hover:bg-[#FDFCFA]"
          >
            <div className={`text-[11px] font-medium w-[56px] shrink-0 ${overdue ? "text-destructive font-semibold" : "text-text-secondary"}`}>
              {formatShortDate(ms.due_date)}
            </div>
            <div className="flex-1">
              <div className="text-[13px] text-text-primary font-medium">{ms.title}</div>
            </div>
            <Badge status={overdue ? "Overdue" : ms.status} />
          </div>
        );
      })}
    </Card>
  );
}

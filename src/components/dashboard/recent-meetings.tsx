import Link from "next/link";
import { formatShortDate } from "@/lib/utils";
import type { MeetingNote } from "@/lib/types";

interface MeetingWithProject extends MeetingNote {
  project_name?: string;
}

interface Props {
  meetings: MeetingWithProject[];
}

export function RecentMeetings({ meetings }: Props) {
  return (
    <div className="bg-white border border-border rounded-[10px] overflow-hidden">
      {meetings.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-[13px] text-text-muted">No recent meetings</div>
      ) : (
        meetings.map((m) => (
          <Link
            key={m.id}
            href={`/projects/${m.project_id}`}
            className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border last:border-b-0 hover:bg-cream transition-colors"
          >
            <div className="text-[13px] text-[#6B6560] min-w-[52px]">
              {m.date ? formatShortDate(m.date) : "—"}
            </div>
            <div className="text-[14px] text-primary font-medium flex-1 leading-[1.3] truncate">{m.title}</div>
            {m.project_name && (
              <span className="text-[12px] px-2 py-0.5 rounded-[8px] bg-cream text-[#6B6560] whitespace-nowrap shrink-0">
                {m.project_name}
              </span>
            )}
          </Link>
        ))
      )}
    </div>
  );
}

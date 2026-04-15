interface Props {
  activeCount: number;
  ownerCount: number;
  upcomingMilestoneCount: number;
  inProgressCount: number;
}

export function HeroBar({ activeCount, ownerCount, upcomingMilestoneCount, inProgressCount }: Props) {
  return (
    <div className="bg-primary rounded-[10px] px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
      <div className="flex items-baseline gap-3">
        <div className="text-[40px] font-semibold text-white leading-none">{activeCount}</div>
        <div className="text-[17px] text-white/65">active projects across the IT portfolio</div>
      </div>
      <div className="flex gap-6">
        <Stat num={ownerCount} label="Owners" />
        <Stat num={upcomingMilestoneCount} label="Upcoming milestones" />
        <Stat num={inProgressCount} label="In progress" />
      </div>
    </div>
  );
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[24px] font-semibold text-white leading-none">{num}</div>
      <div className="text-[12px] uppercase tracking-[0.05em] text-white/50 mt-1">{label}</div>
    </div>
  );
}

import { format } from "date-fns";

interface TopbarProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="bg-white border-b border-border px-8 h-[54px] flex items-center justify-between shrink-0">
      <div>
        <div className="text-[22px] font-semibold text-primary tracking-[-0.2px]">
          {title}
        </div>
        <div className="text-[10px] text-text-muted tracking-[0.06em] uppercase mt-[2px]">
          {today}
        </div>
      </div>
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  );
}

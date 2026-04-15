import { format } from "date-fns";

interface TopbarProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  subtitle?: string;
  badge?: React.ReactNode;
  hideDate?: boolean;
}

export function Topbar({ title, children, subtitle, badge, hideDate }: TopbarProps) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="bg-white border-b border-border px-8 py-5 flex items-start justify-between shrink-0 gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-[22px] font-semibold text-primary tracking-[-0.2px]">
            {title}
          </div>
          {badge}
        </div>
        {subtitle ? (
          <div className="text-[15px] text-text-muted mt-1">{subtitle}</div>
        ) : hideDate ? null : (
          <div className="text-[11px] text-text-muted tracking-[0.06em] uppercase mt-[2px]">
            {today}
          </div>
        )}
      </div>
      <div className="flex gap-2 items-center self-start">
        {children}
      </div>
    </div>
  );
}

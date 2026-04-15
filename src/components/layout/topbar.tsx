import { format } from "date-fns";
import { MobileMenuButton } from "./mobile-menu-button";

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
    <div className="sticky top-0 z-10 bg-white border-b border-border px-4 md:px-8 py-3 md:py-5 flex items-center md:items-start justify-between shrink-0 gap-3 md:gap-4">
      <div className="flex items-center md:items-start gap-2 md:gap-0 min-w-0 flex-1">
        <MobileMenuButton />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold text-primary/60 tracking-[0.14em] uppercase md:hidden">
            COEO Project Hub
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-[17px] md:text-[22px] font-semibold text-primary tracking-[-0.2px] truncate">
              {title}
            </div>
            {badge}
          </div>
          {subtitle ? (
            <div className="text-[13px] md:text-[15px] text-text-muted mt-1">{subtitle}</div>
          ) : hideDate ? null : (
            <div className="hidden sm:block text-[11px] text-text-muted tracking-[0.06em] uppercase mt-[2px]">
              {today}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center self-center md:self-start shrink-0">
        {children}
      </div>
    </div>
  );
}

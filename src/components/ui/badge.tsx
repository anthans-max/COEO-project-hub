import { cn } from "@/lib/utils";
import { STATUS_BADGE_MAP } from "@/lib/constants";

const variantStyles: Record<string, string> = {
  blue: "bg-badge-blue-bg text-badge-blue-text",
  amber: "bg-badge-amber-bg text-badge-amber-text",
  green: "bg-badge-green-bg text-badge-green-text",
  gray: "bg-badge-gray-bg text-badge-gray-text",
  red: "bg-badge-red-bg text-badge-red-text",
  navy: "bg-primary text-white",
  cream: "bg-cream text-primary border border-border",
};

interface BadgeProps {
  status: string;
  variant?: string;
  className?: string;
}

export function Badge({ status, variant, className }: BadgeProps) {
  const resolvedVariant = variant || STATUS_BADGE_MAP[status] || "gray";
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] px-[10px] py-[3px] rounded-pill whitespace-nowrap shrink-0 font-semibold tracking-[0.02em]",
        variantStyles[resolvedVariant],
        className
      )}
    >
      {status}
    </span>
  );
}

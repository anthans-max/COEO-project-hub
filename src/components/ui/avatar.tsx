import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-[30px] h-[30px] text-[11px]",
  md: "w-[38px] h-[38px] text-[12px]",
  lg: "w-[48px] h-[48px] text-[14px]",
};

export function Avatar({ initials, color = "#0A2342", size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "destructive";
  size?: "sm" | "md";
}

const variantStyles = {
  primary: "bg-primary text-white hover:bg-[#0d2e56]",
  ghost: "bg-transparent text-primary border border-[#C8C0B4] hover:bg-cream",
  destructive: "bg-destructive text-white hover:bg-[#A93226]",
};

const sizeStyles = {
  sm: "px-3 py-[5px] text-[11px]",
  md: "px-4 py-[7px] text-[12px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-pill font-medium cursor-pointer transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

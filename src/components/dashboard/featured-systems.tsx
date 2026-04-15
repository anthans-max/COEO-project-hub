import Link from "next/link";
import type { System } from "@/lib/types";

interface Props {
  systems: System[];
}

function badgeClasses(status: string): string {
  const s = status.toLowerCase();
  if (s === "active") return "bg-[#E8F5E9] text-[#1B5E20]";
  if (s.includes("discovery")) return "bg-[#E3F2FD] text-[#1565C0]";
  if (s === "in progress" || s === "in_progress") return "bg-[#FFF8E1] text-[#8B6914]";
  return "bg-cream text-text-muted";
}

export function FeaturedSystems({ systems }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {systems.map((s) => (
        <Link
          key={s.id}
          href="/systems"
          className="block border border-border rounded-[10px] p-3.5 bg-white hover:border-primary transition-colors"
        >
          <div className="text-[14px] font-semibold text-primary">{s.name}</div>
          {s.subtitle && <div className="text-[11px] text-text-muted mt-[3px] leading-[1.4]">{s.subtitle}</div>}
          <span
            className={`inline-block text-[9px] font-medium px-2.5 py-[3px] rounded-[10px] mt-2.5 ${badgeClasses(s.status)}`}
          >
            {s.status}
          </span>
        </Link>
      ))}
    </div>
  );
}

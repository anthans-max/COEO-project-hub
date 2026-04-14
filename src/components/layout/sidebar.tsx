"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Map,
  Flag,
  CheckSquare,
  Server,
  Building2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Projects",
    items: [
      { name: "Project list", href: "/projects", icon: FolderKanban },
      { name: "Roadmap", href: "/projects/roadmap", icon: Map },
      { name: "Milestones", href: "/milestones", icon: Flag },
    ],
  },
  {
    label: "Work",
    items: [
      { name: "Action items", href: "/actions", icon: CheckSquare },
    ],
  },
  {
    label: "Reference",
    items: [
      { name: "Systems", href: "/systems", icon: Server },
      { name: "Vendors", href: "/vendors", icon: Building2 },
      { name: "People", href: "/people", icon: Users },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-sidebar min-w-sidebar bg-primary flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
        <div className="text-[15px] font-semibold text-white tracking-[0.12em] uppercase whitespace-nowrap">
          COEO PROJECT HUB
        </div>
        <div className="text-[11px] text-white/[0.6] tracking-[0.14em] uppercase mt-[3px]">
          Internal Operations · 2026
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-2 flex-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="text-[11px] font-semibold text-white/[0.6] tracking-[0.14em] uppercase px-5 pt-[13px] pb-1">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-[10px] px-5 py-2 text-[14px] font-medium transition-all border-l-[3px] border-transparent",
                    active
                      ? "bg-white/[0.07] text-white border-l-accent"
                      : "text-white hover:bg-white/[0.05]"
                  )}
                >
                  <Icon size={15} className={active ? "" : "opacity-90"} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

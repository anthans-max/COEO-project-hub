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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileDrawer } from "./app-shell";

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
  const { open, setOpen } = useMobileDrawer();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "bg-primary flex flex-col",
        "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "-translate-x-full",
        "md:sticky md:top-0 md:translate-x-0 md:transition-none md:w-sidebar md:min-w-sidebar md:h-screen"
      )}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.07] flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-white tracking-[0.12em] uppercase whitespace-nowrap">
            COEO PROJECT HUB
          </div>
          <div className="text-[11px] text-white/[0.6] tracking-[0.14em] uppercase mt-[3px]">
            Internal Operations · 2026
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="md:hidden -mr-2 -mt-1 p-2 text-white/80 hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-[10px] px-5 py-3 md:py-2 min-h-[44px] md:min-h-0 text-[14px] font-medium transition-all border-l-[3px] border-transparent",
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

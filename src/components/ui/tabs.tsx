"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TabDef {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface Props {
  tabs: TabDef[];
  defaultTab: string;
}

export function Tabs({ tabs, defaultTab }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = sp.get("tab");
  const active = tabs.find((t) => t.id === requested) ? requested! : defaultTab;

  const setTab = (id: string) => {
    const params = new URLSearchParams(sp.toString());
    if (id === defaultTab) params.delete("tab");
    else params.set("tab", id);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex gap-[6px] mb-6 flex-wrap border-b border-border pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "text-[13px] font-medium px-[14px] py-[5px] rounded-pill border transition-all cursor-pointer",
              active === t.id
                ? "bg-primary text-white border-primary"
                : "bg-transparent text-badge-gray-text border-[#C8C0B4] hover:bg-cream"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{current.content}</div>
    </div>
  );
}

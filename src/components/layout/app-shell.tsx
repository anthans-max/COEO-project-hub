"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { CurrentPersonProvider, type CurrentPerson } from "@/lib/hooks/use-current-person";

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileDrawerContext = createContext<DrawerContextValue>({
  open: false,
  setOpen: () => {},
});

export function useMobileDrawer() {
  return useContext(MobileDrawerContext);
}

export function AppShell({
  children,
  people,
}: {
  children: React.ReactNode;
  people: CurrentPerson[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <CurrentPersonProvider people={people}>
      <MobileDrawerContext.Provider value={{ open, setOpen }}>
        <div className="flex min-h-screen bg-white">
          <Sidebar />
          {open && (
            <div
              className="fixed inset-0 bg-black/45 z-40 md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
          )}
          <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
            {children}
          </main>
        </div>
      </MobileDrawerContext.Provider>
    </CurrentPersonProvider>
  );
}

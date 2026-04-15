"use client";

import { Menu } from "lucide-react";
import { useMobileDrawer } from "./app-shell";

export function MobileMenuButton() {
  const { setOpen } = useMobileDrawer();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="md:hidden -ml-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-primary"
      aria-label="Open menu"
    >
      <Menu size={22} />
    </button>
  );
}

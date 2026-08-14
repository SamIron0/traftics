"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-2 px-4">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          className="-ml-1 rounded-md p-2 text-foreground hover:bg-accent md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex flex-1 justify-start px-2"></div>
      </div>
    </div>
  );
}

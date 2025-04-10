"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isReplayMode = searchParams.get("mode") === "replay";
  const shouldShowNavbar = !isReplayMode;

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex w-full">
          {!isReplayMode && <AppSidebar />}
          <div
            className={`flex-1 flex flex-col ${
              !isReplayMode ? "overflow-x-hidden" : ""
            }`}
          >
            {shouldShowNavbar && <Navbar />}
            <main className={`flex-1 w-full`}>{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
} 
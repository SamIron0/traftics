"use client";

import "../globals.css";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { useSearchParams, usePathname } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { Spinner } from "@/components/ui/spinner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isReplayMode = searchParams.get("mode") === "replay";
  const initializeState = useAppStore((state) => state.initializeState);
  const isLoading = useAppStore((state) => state.isLoading);

  // Check if the current path should show the sidebar panel
  const dashboardsPattern = /^\/org\/[^/]+\/project\/[^/]+\/dashboards(?:\/[^/]+)?$/;
  const sessionsPattern = /^\/org\/[^/]+\/project\/[^/]+\/sessions(?:\/[^/]+)?$/;
  const shouldShowPanel = dashboardsPattern.test(pathname);
  const shouldShowNavbar = !isReplayMode && sessionsPattern.test(pathname);

  useEffect(() => {
    initializeState();
  }, [initializeState]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  } else {
    return (
      <SidebarProvider>
        <div className="flex w-full">
          {!isReplayMode && <AppSidebar />}
          <div
            className={`flex-1 flex flex-col ${
              !isReplayMode && shouldShowPanel ? "overflow-x-hidden" : ""
            }`}
          >
            {shouldShowNavbar && <Navbar />}
            <main
              className={`flex-1 w-full`}
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
}

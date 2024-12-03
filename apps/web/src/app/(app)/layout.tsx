"use client";

import "../globals.css";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const isReplayMode = searchParams.get("mode") === "replay";
  const initializeState = useAppStore((state) => state.initializeState);
  const isLoading = useAppStore((state) => state.isLoading);
  useEffect(() => {
    initializeState();
  }, [initializeState]);

  if (isLoading) {
    return <div>Loading...</div>;
  } else {
    return (
      <SidebarProvider>
        <div className="flex w-full">
          {!isReplayMode && <AppSidebar />}
          <div
            className={`flex-1 flex flex-col ${
              !isReplayMode ? "ml-[207px] overflow-x-hidden" : ""
            }`}
          >
            {!isReplayMode && <Navbar />}
            <main
              className={`flex-1 w-full ${!isReplayMode ? "pt-3 px-2" : ""}`}
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
}

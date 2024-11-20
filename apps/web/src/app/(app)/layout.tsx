"use client";

import "../globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { useSearchParams } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const isReplayMode = searchParams.get("mode") === "replay";

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex w-full">
            {!isReplayMode && <AppSidebar />}
            <div 
              className={`flex-1 flex flex-col ${
                !isReplayMode ? "ml-[255px]" : ""
              }`}
            >
              {!isReplayMode && <Navbar />}
              <main className={`flex-1 ${!isReplayMode ? "pt-3 px-2" : ""}`}>
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}

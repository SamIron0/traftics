"use client";

import "../globals.css";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { useSearchParams} from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchParams = useSearchParams();
  const isReplayMode = searchParams.get("mode") === "replay";
  const initializeState = useAppStore((state) => state.initializeState);
  const isLoading = useAppStore((state) => state.isLoading);
  const router = useRouter();

  const shouldShowNavbar = !isReplayMode;
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      } else {
        initializeState(user);
      }
    };

    checkAuth();
  }, [router, initializeState]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  } else {
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
}

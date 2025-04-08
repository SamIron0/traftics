"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { createClient } from "@/utils/supabase/client";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const router = useRouter();
  const initializeState = useAppStore((state) => state.initializeState);
  const isLoading = useAppStore((state) => state.isLoading);
  const projectSlug = useAppStore((state) => state.projectSlug);

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

  useEffect(() => {
    if (!isLoading && projectSlug) {
      router.push(`/project/${projectSlug}/dashboard`);
    }
  }, [isLoading, projectSlug, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return null; 
}

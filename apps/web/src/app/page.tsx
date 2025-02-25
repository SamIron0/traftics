"use client";

import { useEffect } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";

export default function HomePage() {
  const { user } = useAuthStatus();
  const router = useRouter();
  const projectSlug = useAppStore((state) => state.projectSlug);

  useEffect(() => {
    async function handleRedirect() {
      if (!user) {
        router.push("/login");
        return;
      }
      // Redirect to dashboard if we have project info
      if (projectSlug) {
        router.push(`/project/${projectSlug}/dashboard`);
      }
    }

    handleRedirect();
  }, [user, router, projectSlug]);

  return null;
}

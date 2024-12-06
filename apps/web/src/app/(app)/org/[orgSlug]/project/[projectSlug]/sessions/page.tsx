"use client";

import React, { Suspense } from "react";
import { SessionsPage } from "@/components/sessions/SessionsPage";
import { notFound } from "next/navigation";
import { SessionsSkeleton } from "@/components/sessions/SessionsSkeleton";
import { useAppStore } from "@/stores/useAppStore";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/script";

export default function Sessions() {
  const { orgId, projectId, sessions, setSessions, isWebsiteVerified } = useAppStore();

  React.useEffect(() => {
    async function fetchSessions() {
      if (!orgId || !projectId) return;
      try {
        const response = await fetch(`/api/sessions`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    }

    if (isWebsiteVerified) {
      fetchSessions();
    }
  }, [orgId, projectId, setSessions, isWebsiteVerified]);

  if (!orgId || !projectId) {
    notFound();
  }

  if (!isWebsiteVerified && projectId) {
    const script = generateScript(projectId);
    return <UnverifiedView script={script} />;
  }

  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionsPage sessions={sessions} />
    </Suspense>
  );
}
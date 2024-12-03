"use client";

import React, { Suspense, useEffect } from "react";
import { SessionsPage } from "@/components/sessions/SessionsPage";
import { notFound } from "next/navigation";
import { SessionsSkeleton } from "@/components/sessions/SessionsSkeleton";
import { useAppStore } from "@/stores/useAppStore";

export default function Sessions() {
  const { orgId, projectId, sessions, setSessions } = useAppStore();

  useEffect(() => {
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

    if (sessions.length === 0) {
      fetchSessions();
    }
  }, [orgId, projectId, sessions.length, setSessions]);

  if (!orgId || !projectId) {
    notFound();
  }

  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionsPage sessions={sessions} />
    </Suspense>
  );
}

"use client";

import React, { useEffect, useCallback, useState} from "react";
import { SessionsPage } from "@/components/sessions/SessionsPage";
import { notFound } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { UnverifiedView } from "@/components/Dashboard/UnverifiedView";
import { generateScript } from "@/utils/helpers";
import { SessionsSkeleton } from "@/components/sessions/SessionsSkeleton";

export default function Sessions() {
  const { orgId, projectId, sessions, setSessions, isWebsiteVerified } = useAppStore();
  const [isLoading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!orgId || !projectId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, [orgId, projectId, setSessions]);

  useEffect(() => {
    if (!orgId || !projectId || !isWebsiteVerified) return;

    // Initial fetch
    fetchSessions();

  }, [orgId, projectId, isWebsiteVerified, fetchSessions]);

  if (!orgId || !projectId) {
    notFound();
  }

  if (!isWebsiteVerified && projectId) {
    const script = generateScript(projectId);
    return <UnverifiedView script={script} />;
  }

  if(isLoading) {
    return    <div className="p-6">
      <SessionsSkeleton />
    </div>
  }
  return (
    <div className="flex flex-col">
        <SessionsPage sessions={sessions} />
    </div>
  );
}
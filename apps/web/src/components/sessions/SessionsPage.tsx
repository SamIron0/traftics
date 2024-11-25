"use client";

import { useSearchParams } from "next/navigation";
import { ClientSessionList } from "./ClientSessionList";
import { Session } from "@/types/api";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { eventWithTime } from "@rrweb/types";
import SessionPlayer from "./SessionPlayer";
interface Props {
  sessions: Session[];
}

export function SessionsPage({ sessions }: Props) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionWithEvents, setSessionWithEvents] = useState<
    Session & { events: eventWithTime[] } | null
  >(null);
  const router = useRouter();

  const handleSelectSession = useCallback(async (sessionId: string) => {
    if (sessionId === sessionWithEvents?.id) return;
    
    setSessionId(sessionId);
    try {
      const sessionEvents = await fetch(`/api/sessions/${sessionId}`);
      const data = await sessionEvents.json();
      setSessionWithEvents(data);
      
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", "replay");
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error('Failed to fetch session events:', error);
    }
  }, [searchParams, router, sessionWithEvents]);

  useEffect(() => {
    
    if (mode === "replay" && !sessionId && sessions.length > 0) {
      handleSelectSession(sessions[0].id);
    }
  }, [mode, sessionId, sessions, handleSelectSession]);

  if (mode === "replay") {
    if (!sessionWithEvents) return null;
    return <SessionPlayer session={sessionWithEvents} />;
  }

  return (
    <ClientSessionList
      sessions={sessions}
      onSelectSession={handleSelectSession}
    />
  );
}

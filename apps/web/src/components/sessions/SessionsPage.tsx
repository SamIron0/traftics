"use client";

import { useSearchParams } from "next/navigation";
import { ClientSessionList } from "./ClientSessionList";
import { Session } from "@/types/api";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { eventWithTime } from "@rrweb/types";
import SessionPlayer from "./SessionPlayer";
import DateFilter from "@/components/DateFilter";
import { useAppStore } from "@/stores/useAppStore";
import { SessionsSkeleton } from "./SessionsSkeleton";

interface Props {
  sessions: Session[];
}

export function SessionsPage({ sessions: initialSessions }: Props) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionWithEvents, setSessionWithEvents] = useState<
    (Session & { events: eventWithTime[] }) | null
  >(null);
  const [dateRange, setDateRange] = useState<
    { startDate: Date; endDate: Date } | undefined
  >();
  const { isLoading } = useAppStore();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [sortedSessions, setSortedSessions] = useState<Session[]>(initialSessions);

  useEffect(() => {
    setSessions(initialSessions);
    setSortedSessions(initialSessions);
  }, [initialSessions]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      setCurrentSessionId(sessionId);
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();
        setSessionWithEvents(data);

        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "replay");
        params.set("sessionId", sessionId);
        router.push(`?${params.toString()}`);
      } catch (error) {
        console.error("Failed to fetch session events:", error);
      }
    },
    [searchParams, router]
  );

  useEffect(() => {
    if (mode === "replay" && sessionId && !sessionWithEvents) {
      handleSelectSession(sessionId);
    }
  }, [mode, sessionId, handleSelectSession, sessionWithEvents]);

  const getCurrentIndex = useCallback(() => {
    if (!currentSessionId) return -1;
    return sortedSessions.findIndex(
      (session) => session.id === currentSessionId
    );
  }, [currentSessionId, sortedSessions]);

  const handleNextSession = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < sortedSessions.length - 1) {
      const nextSession = sortedSessions[currentIndex + 1];
      handleSelectSession(nextSession.id);
    }
  }, [getCurrentIndex, sortedSessions, handleSelectSession]);

  const handlePreviousSession = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      const previousSession = sortedSessions[currentIndex - 1];
      handleSelectSession(previousSession.id);
    }
  }, [getCurrentIndex, sortedSessions, handleSelectSession]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  };

  const handleSort = useCallback((sortedSessions: Session[]) => {
    setSortedSessions(sortedSessions);
  }, []);

  if (mode === "replay") {
    if (!sessionWithEvents) return null;
    const currentIndex = getCurrentIndex();
    return (
      <SessionPlayer
        session={sessionWithEvents}
        onNextSession={handleNextSession}
        onPreviousSession={handlePreviousSession}
        hasNextSession={currentIndex < sortedSessions.length - 1}
        hasPreviousSession={currentIndex > 0}
        currentSessionIndex={currentIndex}
        totalSessions={sortedSessions.length}
      />
    );
  }

  if (isLoading) {
    return <SessionsSkeleton />;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <p className="text-sm text-muted-foreground">
          No sessions found{isLoading ? "" : "..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="mb-4">
        <DateFilter onDateRangeChange={handleDateRangeChange} />
      </div>
      <ClientSessionList
        sessions={sessions}
        onSelectSession={handleSelectSession}
        dateRange={dateRange}
        onSort={handleSort}
      />
    </div>
  );
}

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
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [sessionWithEvents, setSessionWithEvents] = useState<
    (Session & { events: eventWithTime[] }) | null
  >(null);
  const [dateRange, setDateRange] = useState<
    { startDate: Date; endDate: Date } | undefined
  >();
  const { isLoading } = useAppStore();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  const callApi = useCallback(async () => {
    const response = await fetch("/api/sessions");
    const newSessions = await response.json();
    setSessions(newSessions);
  }, []);

  useEffect(() => {
    if (mode === "replay") return;

    const pollSessions = async () => {
      callApi();
    };

    const interval = setInterval(pollSessions, 10000);

    return () => clearInterval(interval);
  }, [mode, callApi]);

  const handleSelectSession = useCallback(
    async (sessionId: string, index: number) => {
      if (sessionId === sessionWithEvents?.id) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "replay");
        params.set("sessionId", sessionId);
        router.push(`?${params.toString()}`);
        return;
      }

      setCurrentSessionIndex(index);
      try {
        const sessionEvents = await fetch(`/api/sessions/${sessionId}`);
        const data = await sessionEvents.json();
        setSessionWithEvents(data);

        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", "replay");
        params.set("sessionId", sessionId);
        router.push(`?${params.toString()}`);
      } catch (error) {
        console.error("Failed to fetch session events:", error);
      }
    },
    [searchParams, router, sessionWithEvents]
  );

  useEffect(() => {
    if (mode === "replay" && sessionId && !sessionWithEvents) {
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index !== -1) {
        handleSelectSession(sessionId, index);
      }
    }
  }, [mode, sessionId, sessions, handleSelectSession, sessionWithEvents]);

  const handleNextSession = useCallback(() => {
    if (currentSessionIndex < sessions.length - 1) {
      handleSelectSession(
        sessions[currentSessionIndex + 1].id,
        currentSessionIndex + 1
      );
    }
  }, [currentSessionIndex, sessions, handleSelectSession]);

  const handlePreviousSession = useCallback(() => {
    if (currentSessionIndex > 0) {
      handleSelectSession(
        sessions[currentSessionIndex - 1].id,
        currentSessionIndex - 1
      );
    }
  }, [currentSessionIndex, sessions, handleSelectSession]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  };

  if (mode === "replay") {
    if (!sessionWithEvents) return null;
    return (
      <SessionPlayer
        session={sessionWithEvents}
        onNextSession={handleNextSession}
        onPreviousSession={handlePreviousSession}
        hasNextSession={currentSessionIndex < sessions.length - 1}
        hasPreviousSession={currentSessionIndex > 0}
        currentSessionIndex={currentSessionIndex}
        totalSessions={sessions.length}
        onDeleteSession={callApi}
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
      />
    </div>
  );
}

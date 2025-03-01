import { useQuery } from "@tanstack/react-query";
import { Session } from "@/types/api";
import { eventWithTime } from "@rrweb/types";

export type SessionWithEvents = Session & { events: eventWithTime[] };

export function useSessionWithEvents(sessionId: string | null) {
  return useQuery<SessionWithEvents>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID provided");
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch session events");
      }
      return response.json();
    },
    enabled: !!sessionId,
  });
} 
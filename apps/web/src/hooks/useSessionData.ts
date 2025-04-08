import { useEffect, useState } from "react";
import { Session } from "@/types/api";
import { Event } from "@/types/event";
import { getRelativeTimestamp } from "@/utils/helpers";

interface Page {
  href: string;
  timestamp: string;
}

interface UseSessionDataProps {
  session: Session;
}

function convertToSliderEvents(events: Event[]): Event[] {
  return events.map((event) => ({
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
    ...(event.event_type === "input" &&
      event.data?.startTime &&
      event.data?.endTime && {
        data: {
          ...event.data,
          startTime: event.data.startTime,
          endTime: event.data.endTime,
        },
      }),
  }));
}

export function useSessionData({ session }: UseSessionDataProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [specialEvents, setSpecialEvents] = useState<Event[]>([]);
  const [errors, setErrors] = useState<Array<{
    id: string;
    error_message: string;
    stack_trace: string | null;
    error_type: string;
    file_name: string | null;
    line_number: number | null;
    column_number: number | null;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    async function fetchSessionData() {
      try {
        const [pagesRes, eventsRes] = await Promise.all([
          fetch(`/api/sessions/${session.id}/pages`),
          fetch(`/api/sessions/${session.id}/events`),
        ]);

        if (!pagesRes.ok || !eventsRes.ok)
          throw new Error("Failed to fetch session data");

        const [pagesData, eventsData] = await Promise.all([
          pagesRes.json(),
          eventsRes.json(),
        ]);

        setPages(pagesData);

        // Convert timestamps to relative time from session start
        const convertedEvents = eventsData.map((event: Event) => ({
          ...event,
          timestamp:
            new Date(event.timestamp).getTime() -
            (session.started_at ? new Date(session.started_at).getTime() : 0),
        }));

        const processedEvents = convertToSliderEvents(convertedEvents);
        setSpecialEvents(processedEvents);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    }

    fetchSessionData();
  }, [session.id, session.started_at]);

  useEffect(() => {
    async function fetchErrors() {
      try {
        const res = await fetch(`/api/sessions/${session.id}/errors`);
        if (!res.ok) throw new Error("Failed to fetch errors");
        const errorData = await res.json();
        setErrors(errorData);
      } catch (error) {
        console.error("Error fetching session errors:", error);
      }
    }

    fetchErrors();
  }, [session.id]);

  const updateSelectedPage = (time: number) => {
    // Find the last page that was visited before the current time
    const newPageIndex = pages.reduce((lastIndex, page, index) => {
      const pageTime = getRelativeTimestamp(
        page.timestamp,
        session.started_at || 0
      );
      return pageTime <= time ? index : lastIndex;
    }, 0);

    setSelectedPageIndex(newPageIndex);
  };

  return {
    pages,
    selectedPageIndex,
    setSelectedPageIndex,
    specialEvents,
    errors,
    updateSelectedPage,
  };
} 
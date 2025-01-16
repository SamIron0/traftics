import {
  EventType,
  eventWithTime,
  IncrementalSource,
  MouseInteractions,
} from "@rrweb/types";
import { SessionEventService } from "@/server/services/sessionEvent.service";

const RAGE_CLICK_THRESHOLD = 3;
const RAGE_CLICK_TIMEFRAME = 1000;
const UTURN_TIME_THRESHOLD = 30000;

export async function processAndStoreEvents(
  sessionId: string,
  events: eventWithTime[]
): Promise<void> {
  let clickSequence: number[] = [];
  const visitedPages = new Map<string, number>();

  for (const event of events) {
    // Handle uturns
    if (event.type === EventType.Custom && event.data?.tag === "url_change") {
      const currentTimestamp = event.timestamp;
      const href = (event.data as { payload: { href: string } }).payload.href;

      if (visitedPages.has(href)) {
        const lastVisit = visitedPages.get(href)!;
        const timeDiff = currentTimestamp - lastVisit;

        if (timeDiff < UTURN_TIME_THRESHOLD) {
          await SessionEventService.storeEvent({
            session_id: sessionId,
            event_type: "uturn",
            timestamp: new Date(currentTimestamp).toISOString(),
            data: {
              url: href,
              previousVisit: new Date(lastVisit).toISOString(),
              timeDiff,
            },
          });
        }
      }

      visitedPages.set(href, currentTimestamp);
    }

    // Handle clicks and rage clicks
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.MouseInteraction &&
      event.data.type === MouseInteractions.Click
    ) {
      // Store regular click
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: "click",
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          x: event.data.x,
          y: event.data.y,
        },
      });

      // Process potential rage click
      const timestamp = event.timestamp;
      clickSequence = clickSequence.filter(
        (t) => timestamp - t < RAGE_CLICK_TIMEFRAME
      );
      clickSequence.push(timestamp);

      if (clickSequence.length >= RAGE_CLICK_THRESHOLD) {
        await SessionEventService.storeEvent({
          session_id: sessionId,
          event_type: "rage_click",
          timestamp: new Date(timestamp).toISOString(),
          data: {
            x: event.data.x,
            y: event.data.y,
            clickCount: clickSequence.length,
          },
        });
        clickSequence = []; // Reset after detecting rage click
      }
    }

    // Handle inputs
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.Input
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: "input",
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          value: event.data.text,
          element: event.data.id,
        },
      });
    }

    // Handle window resize
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.ViewportResize
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: "window_resize",
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          width: event.data.width,
          height: event.data.height,
        },
      });
    }

    // Handle selection
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.Selection
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: "selection",
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          ranges: event.data.ranges,
        },
      });
    }

    if (event.type === EventType.Custom && event.data?.tag === "page_refresh") {
      const payload = (
        event.data as {
          payload: {
            url: string;
            referrer: string | null;
            type: string;
            navigationSource: string;
          };
        }
      ).payload;
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: "refresh",
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          url: payload.url,
          referrer: payload.referrer,
          type: payload.type,
          navigationSource: payload.navigationSource,
        },
      });
    }
  }
}

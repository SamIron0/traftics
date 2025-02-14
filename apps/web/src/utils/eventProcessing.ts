import {
  EventType,
  eventWithTime,
  IncrementalSource,
  MouseInteractions,
} from "@rrweb/types";
import { SessionEventService } from "@/server/services/sessionEvent.service";
import { ErrorEventService } from "@/server/services/errorEvent.service";
import { ErrorType } from "@/types/error";

const RAGE_CLICK_THRESHOLD = 3;
const RAGE_CLICK_TIMEFRAME = 1000;

export async function processAndStoreSpecialEvents(
  sessionId: string,
  events: eventWithTime[]
): Promise<void> {
  let clickSequence: number[] = [];
  const navigationEvents: {
    url: string;
    timestamp: number;
    referrer: string;
  }[] = [];
  const UTURN_THRESHOLD = 5000; // 5 seconds threshold for U-turn detection

  let currentInputStart: number | null = null;
  let lastInputTime: number | null = null;
  let lastInputId: number | null = null;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const nextEvent = events[i +2];

    // Handle clicks and rage clicks
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.MouseInteraction &&
      event.data.type === MouseInteractions.Click
    ) {
      const timestamp = event.timestamp;
      clickSequence = clickSequence.filter(
        (t) => timestamp - t < RAGE_CLICK_TIMEFRAME
      );
      clickSequence.push(timestamp);

      if (clickSequence.length >= RAGE_CLICK_THRESHOLD) {
        // Store rage click instead of individual clicks
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
      } else {
        // Only store regular click if not part of a rage click
        await SessionEventService.storeEvent({
          session_id: sessionId,
          event_type: "click",
          timestamp: new Date(event.timestamp).toISOString(),
          data: {
            x: event.data.x,
            y: event.data.y,
          },
        });
      }
    }

    // Handle U-turn detection for navigation events
    if (event.type === EventType.Custom && event.data?.tag === "url_change") {
      const payload = event.data.payload as { href: string; referrer: string };
      const currentUrl = payload.href;
      const currentTimestamp = event.timestamp;
      const referrer = payload.referrer;

      // Add current navigation to array
      navigationEvents.push({
        url: currentUrl,
        timestamp: currentTimestamp,
        referrer: referrer,
      });

      // Check for U-turn pattern if we have at least 2 navigation events
      if (navigationEvents.length >= 2) {
        const currentNav = navigationEvents[navigationEvents.length - 1];
        const prevNav = navigationEvents[navigationEvents.length - 2];
        const timeDifference = currentNav.timestamp - prevNav.timestamp;

        // Check if this is a quick return to the referrer URL
        if (timeDifference <= UTURN_THRESHOLD && currentUrl === prevNav.referrer) {
          await SessionEventService.storeEvent({
            session_id: sessionId,
            event_type: "uturn",
            timestamp: new Date(currentTimestamp).toISOString(),
            data: {
              from_url: prevNav.url,
              to_url: currentUrl,
              duration: timeDifference,
            },
          });
        }
      }
    }

    // Handle inputs with start and end time tracking
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.Input &&
      event.data.text &&
      event.data.id >= 0
    ) {
      const currentTime = event.timestamp;

      // Start new input sequence if not already started or if element ID changed
      if (currentInputStart === null || event.data.id !== lastInputId) {
        currentInputStart = currentTime;
        lastInputId = event.data.id;
      }

      // Always update last input time
      lastInputTime = currentTime;

      // Check if this is the end of an input sequence
      const isLastEvent = !nextEvent;
      const isNextEventDifferent = nextEvent && (
        nextEvent.type !== EventType.IncrementalSnapshot ||
        nextEvent.data.source !== IncrementalSource.Input ||
        nextEvent.data.id !== event.data.id ||
        Math.abs(nextEvent.timestamp - currentTime) > 5000 // Time gap threshold
      );
      if (isLastEvent || isNextEventDifferent) {
        // Store the complete input sequence
        await SessionEventService.storeEvent({
          session_id: sessionId,
          event_type: "input",
          timestamp: new Date(currentInputStart).toISOString(),
          data: {
            value: event.data.text,
            element: event.data.id,
            startTime: currentInputStart,
            endTime: lastInputTime
          },
        });

        // Reset tracking variables
        currentInputStart = null;
        lastInputTime = null;
        lastInputId = null;
      }
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

    if (event.type === EventType.Custom && event.data?.tag) {
      const errorTags = ['error', 'console_error', 'network_error', 'unhandled_promise', 'resource_error'];
      
      if (errorTags.includes(event.data.tag)) {
        const payload = event.data.payload as {
          type: ErrorType;
          message: string;
          stack?: string;
          lineNumber?: number;
          columnNumber?: number;
          fileName?: string;
          resourceType?: string;
          url?: string;
          status?: number;
        };

        await ErrorEventService.storeErrorEvent({
          session_id: sessionId,
          error_type: payload.type,
          message: payload.message,
          stack: payload.stack,
          metadata: {
            lineNumber: payload.lineNumber,
            columnNumber: payload.columnNumber,
            fileName: payload.fileName,
            resourceType: payload.resourceType,
            url: payload.url,
            status: payload.status
          },
          timestamp: new Date(event.timestamp).toISOString()
        });
      }
    }
  }
}

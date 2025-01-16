import { EventType, eventWithTime, IncrementalSource, MouseInteractions } from "@rrweb/types";
import { SessionEventService, SessionEventType } from "@/server/services/sessionEvent.service";

export async function processAndStoreEvents(
  sessionId: string,
  events: eventWithTime[]
): Promise<void> {
  for (const event of events) {
    // Handle clicks and rage clicks
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.MouseInteraction &&
      event.data.type === MouseInteractions.Click
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: 'click',
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          x: event.data.x,
          y: event.data.y
        }
      });
    }

    // Handle inputs
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.Input
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: 'input',
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          value: event.data.text,
          element: event.data.id
        }
      });
    }

    // Handle window resize
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.ViewportResize
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: 'window_resize',
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          width: event.data.width,
          height: event.data.height
        }
      });
    }

    // Handle selection
    if (
      event.type === EventType.IncrementalSnapshot &&
      event.data.source === IncrementalSource.Selection
    ) {
      await SessionEventService.storeEvent({
        session_id: sessionId,
        event_type: 'selection',
        timestamp: new Date(event.timestamp).toISOString(),
        data: {
          ranges: event.data.ranges
        }
      });
    }
  }
} 
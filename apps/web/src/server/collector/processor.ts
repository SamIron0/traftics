import type { eventWithTime } from '@rrweb/types';

export async function processEvents(events: eventWithTime[]): Promise<eventWithTime[]> {
  return events.map(event => ({
    ...event,
    timestamp: Number(event.timestamp)
  }));
}

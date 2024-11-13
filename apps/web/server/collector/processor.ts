import { RecordedEvent } from '@/types';

export async function processEvents(events: RecordedEvent[]): Promise<RecordedEvent[]> {
  // Add processing logic here (e.g., sanitization, compression)
  return events.map(event => ({
    ...event,
    timestamp: Number(event.timestamp)
  }));
}

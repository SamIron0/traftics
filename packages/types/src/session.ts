import { RecordedEvent } from './events';

export interface Session {
  id: string;
  siteId: string;
  startedAt: number;
  duration: number;
  events: RecordedEvent[];
  userAgent: string;
  screenResolution: {
    width: number;
    height: number;
  };
}

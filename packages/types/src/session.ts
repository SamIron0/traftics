import type { eventWithTime } from '@rrweb/types';

export interface Session {
  id: string;
  site_id: string;
  started_at: number;
  duration: number;
  events: eventWithTime[];
  user_agent: string;
  screen_width: number;
  screen_height: number;
  screenshot?: string | null;
}

import type { eventWithTime } from '@rrweb/types';

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    orgId: string;
  };
  headers?: Record<string, string>;
}

export interface ServiceRequest {
  user: {
    id: string;
    email: string;
    orgId: string;
  };
  headers?: Record<string, string>;
  query?: Record<string, string | string[]>;
  params?: Record<string, string>;
  body?: unknown;
}

export interface Session {
  id: string;
  site_id: string;
  started_at: number;
  duration: number;
  events: eventWithTime[];
  user_agent: string;
  screen_width: number;
  screen_height: number;
}
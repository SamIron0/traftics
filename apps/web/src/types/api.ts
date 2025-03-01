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
  };
  headers?: Record<string, string>;
  query?: Record<string, string | string[]>;
  params?: Record<string, string>;
  body?: unknown;
}

export interface Session {
  id: string;
  site_id: string;
  started_at?: number;
  duration: number;
  events?: eventWithTime[];
  user_agent?: string;
  screen_width?: number;
  screen_height?: number;
  screenshot?: string | null;
  location?: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
  };
  relevance_score?: number;
  frustration_score?: number;
  engagement_score?: number;
  device?: UAParser.IDevice;
  os?: UAParser.IOS;
  browser?: UAParser.IBrowser;
  city?: string;
  region?: string;
  timezone?: string;
  total_clicks: number;
  total_scroll_distance: number;
  total_inputs: number;
  session_error_count: number;
  network_speed?: string;
  isp?: string;
  is_active?: boolean;
  end_reason?: string;
  is_played?: boolean;
}

export type SessionStatus = {
  is_active: boolean;
  end_reason?: 'manual_stop' | 'inactivity_timeout' | 'quota_exceeded' | 'window_unload' | null;
  last_active_at: number;
};

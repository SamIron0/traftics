import type { eventWithTime } from "@rrweb/types";
import UAParser from "ua-parser-js";

export interface SessionConfig {
  websiteId: string;
  collectorUrl?: string;
  batchConfig?: Partial<BatchConfig>;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  maxBackoffMs: number;
}
export type ErrorType = 'error' | 'console_error' | 'network_error' | 'unhandled_promise' | 'runtime_error';

export interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
  maxQueueSize: number;
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
  total_clicks?: number;
  total_scroll_distance?: number;
  total_inputs?: number;
  session_error_count?: number;
  network_speed?: string;
  isp?: string;
  is_active?: boolean;
  end_reason?: string;
}

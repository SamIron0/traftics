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
  location?: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
  };
  is_active?: boolean;
  end_reason?: string;
}

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  resourceLoading: {
    url: string;
    duration: number;
    size: number;
    type: string;
  }[];
  jsErrors: {
    message: string;
    stack: string;
    timestamp: number;
  }[];
  apiCalls: {
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
  }[];
}
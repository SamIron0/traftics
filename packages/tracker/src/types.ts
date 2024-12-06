import type { eventWithTime } from "@rrweb/types";

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
  maxBatchSize: number;  // Maximum number of events per batch
  flushInterval: number; // Time in ms between flushes
  maxQueueSize: number;  // Maximum number of events to queue before forcing a flush
}


export interface Session {
    id: string;
    site_id: string;
    started_at?: number;
    duration?: number;
    events?: eventWithTime[];
    user_agent?: string;
    screen_width?: number;
    screen_height?: number;
    screenshot?: string | null;
    location?: string;
  }
  
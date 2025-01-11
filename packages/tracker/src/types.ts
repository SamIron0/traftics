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

export interface PerformanceMetrics {
  // Web Vitals
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  
  // Resource Metrics
  resourceLoading: {
    url: string;
    duration: number;
    size: number;
    type: string;
  }[];
  
  // JavaScript Metrics
  jsErrors: {
    message: string;
    stack: string;
    
    timestamp: number;
  }[];
  
  // Network Metrics
  apiCalls: {
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
  }[];
  
  // Memory Usage
  memoryUsage?: {
    jsHeapSize: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

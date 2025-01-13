import type { BatchConfig, RetryConfig } from '../types';

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 1000,
  flushInterval: 10000,
  maxQueueSize: 1000,
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMs: 1000,
  maxBackoffMs: 10000,
};

export const RRWEB_CONFIG = {
  blockClass: "privacy",
  maskTextClass: "mask-text",
  collectFonts: true,
};

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const DEFAULT_COLLECTOR_URL = "https://traftics.ironkwe.site";

export const MAX_FAILED_EVENTS = 50; 
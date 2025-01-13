export const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export const DEFAULT_BATCH_CONFIG = {
  maxBatchSize: 1000,
  flushInterval: 10000,
  maxQueueSize: 1000,
};

export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000,
  maxBackoffMs: 10000,
};

export const RRWEB_CONFIG = {
  blockClass: "privacy",
  maskTextClass: "mask-text",
  collectFonts: true,
}; 
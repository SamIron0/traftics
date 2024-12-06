import * as rrweb from "rrweb";
import { v4 as uuidv4 } from "uuid";
import type { eventWithTime } from "@rrweb/types";
import type { Session, RetryConfig, BatchConfig, SessionConfig } from "./types";

const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 1000,
  flushInterval: 10000,
  maxQueueSize: 1000,
};

export class SessionTracker {
  private sessionId: string;
  private readonly websiteId: string;
  private readonly collectorUrl: string;
  private eventQueue: eventWithTime[] = [];
  private startedAt: number;
  private lastEventTime: number;
  private batchConfig: BatchConfig;
  private flushTimeout: number | null = null;
  private isFlushInProgress = false;
  private hasFirstBatchBeenSent = false;
  private currentHref: string;
  private location: string | null = null;
  private retryConfig: RetryConfig;
  private quotaExceeded = false;

  constructor(config: SessionConfig) {
    this.batchConfig = {
      ...DEFAULT_BATCH_CONFIG,
      ...config.batchConfig,
    };

    this.currentHref = window.location.href;
    this.sessionId = uuidv4();
    this.websiteId = config.websiteId;
    this.collectorUrl = config.collectorUrl || "https://gaha.vercel.app";
    this.startedAt = Date.now();
    this.lastEventTime = this.startedAt;

    // Get location and initialize session
    this.getLocation().then((location) => {
      this.location = location;
    });

    // Listen for URL changes
    window.addEventListener("popstate", () => this.handleUrlChange());

    // Intercept history methods
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      this.handleUrlChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState(...args);
      this.handleUrlChange();
    };

    this.startRecording();
    this.scheduleFlush();

    this.retryConfig = {
      maxRetries: 3,
      backoffMs: 1000,
      maxBackoffMs: 10000,
    };
  }

  private queueEvent(event: eventWithTime): void {
    this.eventQueue.push(event);
    this.lastEventTime = Date.now();

    // If queue size exceeds max, schedule immediate flush
    if (this.eventQueue.length >= this.batchConfig.maxQueueSize) {
      this.scheduleFlush(true);
    }
  }

  private scheduleFlush(immediate = false): void {
    if (this.flushTimeout) {
      window.clearTimeout(this.flushTimeout);
    }

    const timeout = immediate ? 0 : this.batchConfig.flushInterval;
    this.flushTimeout = window.setTimeout(() => this.flush(), timeout);
  }

  private async flush(): Promise<void> {
    if (this.isFlushInProgress || this.eventQueue.length === 0) return;

    this.isFlushInProgress = true;
    const batches = this.createBatches();

    try {
      await Promise.all(batches.map((batch) => this.sendBatch(batch)));
      this.eventQueue = []; // Clear queue after successful send
    } catch (error) {
      console.error("Failed to send batches:", error);
      // Schedule retry
      this.scheduleFlush(true);
    } finally {
      this.isFlushInProgress = false;
      this.scheduleFlush();
    }
  }

  private createBatches(): Session[] {
    const batches: Session[] = [];
    const { maxBatchSize } = this.batchConfig;

    for (let i = 0; i < this.eventQueue.length; i += maxBatchSize) {
      const batchEvents = this.eventQueue.slice(i, i + maxBatchSize);
      const isFirstBatch = !this.hasFirstBatchBeenSent;

      if (isFirstBatch) {
        console.log("Batch Events:", batchEvents);
        console.log("length:", this.eventQueue.length);
        console.log("maxBatchSize:", maxBatchSize);
      }

      batches.push({
        id: this.sessionId,
        site_id: this.websiteId,
        ...(isFirstBatch
          ? {
              started_at: this.startedAt,
              user_agent: navigator.userAgent,
              screen_width: window.screen.width,
              screen_height: window.screen.height,
              location: this.location || undefined,
            }
          : {}),
        duration: this.lastEventTime - this.startedAt,
        events: batchEvents,
      });
    }

    // Mark first batch as sent after creating batches
    this.hasFirstBatchBeenSent = true;
    return batches;
  }

  private async sendBatch(batch: Session): Promise<void> {
    const success = await this.flushWithRetry(batch);
    if (!success) {
      this.storeFailedEvents(batch);
    }
  }

  private startRecording(): void {
    rrweb.record({
      emit: (event: eventWithTime) => {
        this.queueEvent(event);
      },
      sampling: {
        mousemove: 50, // Record 1 out of every 50 mouse moves
        scroll: 150, // Record 1 out of every 150 scrolls
        input: "last", // Only record last input in text field
      },
      blockClass: "privacy",
      maskTextClass: "mask-text",
      collectFonts: true,
    });
  }

  private async flushWithRetry(payload: Session): Promise<boolean> {
    if (this.quotaExceeded) return false;

    let retries = 0;
    let backoff = this.retryConfig.backoffMs;

    while (retries <= this.retryConfig.maxRetries) {
      try {
        const response = await fetch(`${this.collectorUrl}/api/collect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) return true;

        // Handle quota exceeded
        if (response.status === 429) {
          const data = await response.json();
          if (data.code === "USAGE_LIMIT_EXCEEDED") {
            this.quotaExceeded = true;
            this.stop();
            return false;
          }
        }

        // Don't retry 4xx errors except 429
        if (response.status >= 400 && response.status < 500) {
          return false;
        }
      } catch (error) {
        console.warn(`Attempt ${retries + 1} failed:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff = Math.min(backoff * 2, this.retryConfig.maxBackoffMs);
      retries++;
    }

    return false;
  }

  private storeFailedEvents(payload: Session): void {
    try {
      const key = `failed_events_${this.sessionId}`;
      const existingData = localStorage.getItem(key);
      const failedEvents = existingData ? JSON.parse(existingData) : [];

      failedEvents.push({
        payload,
        timestamp: Date.now(),
      });

      // Keep only last 50 failed events to prevent localStorage overflow
      if (failedEvents.length > 50) {
        failedEvents.shift();
      }

      localStorage.setItem(key, JSON.stringify(failedEvents));
    } catch (error) {
      console.error("Failed to store failed events:", error);
    }
  }

  public stop(): void {
    if (this.flushTimeout) {
      window.clearTimeout(this.flushTimeout);
    }
    // Flush remaining events immediately
    this.flush();
  }

  private async getLocation(): Promise<string | null> {
    try {
      const response = await fetch("https://cloudflare.com/cdn-cgi/trace");
      const data = await response.text();
      const loc = data
        .split("\n")
        .find((line) => line.startsWith("loc="))
        ?.split("=")[1];
      console.log("Location:", loc);
      return loc || null;
    } catch (error) {
      console.error("Failed to fetch location:", error);
      return null;
    }
  }

  private handleUrlChange() {
    const newHref = window.location.href;
    if (newHref !== this.currentHref) {
      this.currentHref = newHref;
      this.queueEvent({
        type: 4,
        timestamp: Date.now(),
        data: {
          href: this.currentHref,
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    }
  }
}

declare global {
  interface Window {
    _r?: {
      websiteId: string;
      collectorUrl?: string;
    };
  }
}

if (typeof window !== "undefined" && window._r) {
  const tracker = new SessionTracker({
    websiteId: window._r.websiteId,
    collectorUrl: window._r.collectorUrl,
  });

  window.addEventListener("unload", () => {
    tracker.stop();
  });
}

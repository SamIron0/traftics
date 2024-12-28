import * as rrweb from "rrweb";
import { v4 as uuidv4 } from "uuid";
import type { eventWithTime } from "@rrweb/types";
import type { Session, RetryConfig, BatchConfig, SessionConfig } from "./types";
import { ErrorType } from "./types";

interface NetworkEvent {
  type: 'xhr' | 'fetch' | 'resource';
  status?: number;
  method?: string;
  url: string;
  duration?: number;
  timestamp: number;
  initiatorType?: string;
  failed?: boolean;
  blocked?: boolean;
  size?: number;
}

const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 1000,
  flushInterval: 10000,
  maxQueueSize: 1000,
};

export class SessionTracker {
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  private inactivityTimer: number | null = null;
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
  private previousHref: string | null = null;
  private location: { country: string; region: string; city: string; lat: number; lon: number } | null = null;
  private retryConfig: RetryConfig;
  private quotaExceeded = false;
  private networkEvents: NetworkEvent[] = [];
  private readonly MAX_NETWORK_EVENTS = 100;
  private perfObserver: PerformanceObserver | null = null;

  constructor(config: SessionConfig) {
    this.batchConfig = {
      ...DEFAULT_BATCH_CONFIG,
      ...config.batchConfig,
    };

    this.currentHref = window.location.href;
    this.previousHref = document.referrer || null;
    this.sessionId = uuidv4();
    this.websiteId = config.websiteId;
    this.collectorUrl = config.collectorUrl || "https://gaha.vercel.app";
    this.startedAt = Date.now();
    this.lastEventTime = this.startedAt;
    this.getLocation().then((location) => {
      this.location = location;
    });
    window.addEventListener("popstate", () => {
      this.handleUrlChange('popstate');
    });

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      this.previousHref = this.currentHref;
      originalPushState(...args);
      this.handleUrlChange('pushState');
    };

    history.replaceState = (...args) => {
      this.previousHref = this.currentHref;
      originalReplaceState(...args);
      this.handleUrlChange('replaceState');
    };

    this.startRecording();
    this.scheduleFlush(false, 5000);

    this.retryConfig = {
      maxRetries: 3,
      backoffMs: 1000,
      maxBackoffMs: 10000,
    };

    this.setupCustomEventListeners();
  }

  private resetInactivityTimer() {
    if (this.inactivityTimer) {
      window.clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = window.setTimeout(() => {
      this.stop();
      this.sendBatch({
        id: this.sessionId,
        site_id: this.websiteId,
        duration: Date.now() - this.startedAt,
        is_active: false,
        end_reason: 'inactivity_timeout'
      });
    }, this.INACTIVITY_TIMEOUT);
  }

  private queueEvent(event: eventWithTime): void {
    this.eventQueue.push(event);
    this.lastEventTime = Date.now();
    this.resetInactivityTimer(); // Reset timer on each event

    // If queue size exceeds max, schedule immediate flush
    if (this.eventQueue.length >= this.batchConfig.maxQueueSize) {
      this.scheduleFlush(true);
    }
  }

  private scheduleFlush(immediate = false, customTimeout?: number): void {
    if (this.flushTimeout) {
      window.clearTimeout(this.flushTimeout);
    }

    const timeout = immediate ? 0 : (customTimeout || this.batchConfig.flushInterval);
    this.flushTimeout = window.setTimeout(() => this.flush(), timeout);
  }

  private async flush(): Promise<void> {
    if (this.isFlushInProgress) return;

    if (this.eventQueue.length > 0) {
      this.isFlushInProgress = true;
      const batches = this.createBatches();

      try {
        await Promise.all(batches.map((batch) => this.sendBatch(batch)));
        this.eventQueue = [];
      } catch (error) {
        console.error("Failed to send batches:", error);
        // Schedule retry immediately
        this.scheduleFlush(true);
      } finally {
        this.isFlushInProgress = false;
      }
    }
    this.scheduleFlush();
  }

  private createBatches(): Session[] {
    const batches: Session[] = [];
    const { maxBatchSize } = this.batchConfig;

    for (let i = 0; i < this.eventQueue.length; i += maxBatchSize) {
      const batchEvents = this.eventQueue.slice(i, i + maxBatchSize);
      const isFirstBatch = !this.hasFirstBatchBeenSent;

      batches.push({
        id: this.sessionId,
        site_id: this.websiteId,
        ...(isFirstBatch
          ? {
            started_at: this.startedAt,
            user_agent: navigator.userAgent,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            location: this.location || undefined,
          }
          : {}),
        duration: this.lastEventTime - this.startedAt,
        events: batchEvents,
      });
    }

    this.hasFirstBatchBeenSent = true;
    return batches;
  }

  private async sendBatch(batch: Session): Promise<void> {
    if (batch.is_active !== undefined) {
      try {
        await fetch(`${this.collectorUrl}/api/collect`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: batch.id,
            status: {
              is_active: batch.is_active,
              end_reason: batch.end_reason,
              last_active_at: Date.now()
            }
          })
        });
      } catch (error) {
        console.error('Failed to update session status:', error);
      }
    }

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
        mousemove: 50,
        scroll: 150,
        input: "last",
      },
      blockClass: "privacy",
      maskTextClass: "mask-text",
      collectFonts: true,
    });
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
    const finalBatch: Session = {
      id: this.sessionId,
      site_id: this.websiteId,
      duration: Date.now() - this.startedAt,
      is_active: false,
      end_reason: 'manual_stop'
    };

    this.sendBatch(finalBatch);
  }

  private async flushWithRetry(payload: Session): Promise<boolean> {
    if (this.quotaExceeded) {
      // Set session as inactive when quota exceeded
      payload.is_active = false;
      payload.end_reason = 'quota_exceeded';
      return false;
    }

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
      backoff = Math.min(backoff * 2, this.retryConfig.maxBackoffMs); // exponential backoff
      retries++;
    }

    return false;
  }

  private async getLocation() {
    try {
      const response = await fetch("https://ipinfo.io/json?token=0d420c2f8c5887");
      const data = await response.json(); // Parse the JSON response

      const locationData = {
        country: data.country,
        region: data.region,
        city: data.city,
        lat: parseFloat(data.loc.split(',')[0]),
        lon: parseFloat(data.loc.split(',')[1]),
      };

      return locationData;
    } catch (error) {
      console.error("Failed to fetch location:", error);
      return null;
    }
  }

  private handleUrlChange(source: 'pushState' | 'popstate' | 'replaceState') {
    const newHref = window.location.href;
    const now = Date.now();

    if (newHref !== this.currentHref) {
      const referrer = this.previousHref || document.referrer || '';
      this.previousHref = this.currentHref;
      this.currentHref = newHref;

      this.queueEvent({
        type: 5,
        timestamp: now,
        data: {
          tag: "url_change",
          payload: {
            href: newHref,
            referrer,
            navigationSource: source
          },
        },
      });
    }
  }
  private setupCustomEventListeners(): void {

    const createEvent = (tag: ErrorType | string, payload: any) => {
      this.queueEvent({
        type: 5,
        timestamp: Date.now(),
        data: { tag, payload },
      });
    };

    // 1. Capture console errors
    const originalConsoleError = console.error.bind(console);
    console.error = (...args) => {
      createEvent("console_error", args);
      originalConsoleError(...args);
    };

    // 2. Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      createEvent("unhandled_promise", event.reason);
    });

    // 3. Capture global runtime errors
    window.addEventListener("error", (event) => {
      if (event.error) {
        createEvent("runtime_error", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error.stack,
        });
      }
    });

    // 4. Capture blocked scripts (CSP violations)
    window.addEventListener("securitypolicyviolation", (event) => {
      createEvent("script", {
        url: event.blockedURI,
        failed: true,
        blocked: true,
        initiatorType: "script",
      });
    });

    // 5. Capture DNS or offline errors
    window.addEventListener("offline", () => {
      createEvent("network_offline", {});
    });

    // 6. Observe network performance (resource timing)
    this.perfObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceResourceTiming[];
      entries.forEach((entry) => {
        if (!entry.name.includes(this.collectorUrl)) {
          const event: NetworkEvent = {
            type: "resource",
            url: entry.name,
            duration: entry.duration,
            timestamp: performance.now(),
            initiatorType: entry.initiatorType,
            size: entry.transferSize,
            failed: entry.responseEnd === 0,
            blocked: entry.responseStart === 0 && entry.responseEnd === 0,
          };
          this.addNetworkEvent(event);
        }
      });
    });

    this.perfObserver.observe({ entryTypes: ["resource"] });

    // 7. Patch fetch for tracking
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [resource, config] = args;
      const url = resource instanceof Request ? resource.url : resource;

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;

        this.addNetworkEvent({
          type: "fetch",
          url: url.toString(),
          status: response.status,
          method: config?.method || "GET",
          duration,
          timestamp: startTime,
          failed: !response.ok,
        });

        return response;
      } catch (error) {
        this.addNetworkEvent({
          type: "fetch",
          url: url.toString(),
          timestamp: startTime,
          method: config?.method || "GET",
          failed: true,
          blocked: (error as Error).name === "TypeError",
        });
        throw error;
      }
    };

    // 8. Patch XMLHttpRequest (XHR) for tracking
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    const originalSend = XHR.send;

    XHR.open = function (method: string, url: string) {
      (this as any)._networkData = { method, url, startTime: performance.now() };
      return originalOpen.apply(this, arguments as any);
    };

    XHR.send = function () {
      const xhr = this;
      const networkData = (xhr as any)._networkData;

      xhr.addEventListener('load', () => {
        const duration = performance.now() - networkData.startTime;
        (window as any)._tracker?.addNetworkEvent?.({
          type: 'xhr',
          url: networkData.url,
          method: networkData.method,
          status: xhr.status,
          duration,
          timestamp: networkData.startTime,
          failed: xhr.status < 200 || xhr.status >= 300
        });
      });

      xhr.addEventListener('error', () => {
        (window as any)._tracker?.addNetworkEvent?.({
          type: 'xhr',
          url: networkData.url,
          method: networkData.method,
          timestamp: networkData.startTime,
          failed: true
        });
      });

      return originalSend.apply(this, arguments as any);
    };

    // capture page load info
    window.addEventListener('load', () => {
      const performanceData = window.performance.timing;
      const loadTime = performanceData.loadEventEnd - performanceData.navigationStart;
      const domContentLoadedTime = performanceData.domContentLoadedEventEnd - performanceData.navigationStart;

      const pageLoadData = {
        loadTime,
        domContentLoadedTime,
        navigationStart: performanceData.navigationStart,
        responseStart: performanceData.responseStart,
        domComplete: performanceData.domComplete,
      };

      this.queueEvent({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: 'page_load',
          payload: pageLoadData,
        },
      });

    });
  }


  private addNetworkEvent(event: NetworkEvent): void {
    if (event.failed || event.blocked || (event.duration && event.duration > 3000)) {
      this.networkEvents.push(event);
      if (this.networkEvents.length > this.MAX_NETWORK_EVENTS) {
        this.networkEvents.shift();
      }
      this.queueEvent({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: "network",
          payload: event
        }
      });
    }
  }

  public getNetworkSummary() {
    return {
      totalEvents: this.networkEvents.length,
      failedEvents: this.networkEvents.filter(e => e.failed).length,
      blockedEvents: this.networkEvents.filter(e => e.blocked).length,
      slowEvents: this.networkEvents.filter(e => e.duration && e.duration > 3000).length,
      byType: {
        xhr: this.networkEvents.filter(e => e.type === 'xhr').length,
        fetch: this.networkEvents.filter(e => e.type === 'fetch').length,
        resource: this.networkEvents.filter(e => e.type === 'resource').length
      }
    };
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

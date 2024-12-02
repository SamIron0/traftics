import * as rrweb from "rrweb";
import { v4 as uuidv4 } from "uuid";
import type { eventWithTime } from "@rrweb/types";
import pako from 'pako';

interface SessionConfig {
  websiteId: string;
  collectorUrl?: string;
}

class SessionTracker {
  private sessionId: string;
  private readonly websiteId: string;
  private readonly collectorUrl: string;
  private events: eventWithTime[] = [];
  private startedAt: number;
  private lastEventTime: number;
  private flushInterval: number = 10000;
  private initialFlushTimeout: number = 3000;
  private intervalId?: number;
  private timeoutId?: number;
  private hasScreenshot: boolean = false;

  constructor(config: SessionConfig) {
    this.sessionId = uuidv4();
    this.websiteId = config.websiteId;
    this.collectorUrl = config.collectorUrl || "https://gaha.vercel.app";
    this.startedAt = Date.now();
    this.lastEventTime = this.startedAt;

    // Initialize session with metadata
    this.events.push({
      type: 0, // Meta event type in rrweb
      data: {
        href: window.location.href,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: this.startedAt,
    } as eventWithTime);

    this.startRecording();
    this.setupInitialFlush();
  }

  private startRecording(): void {
    rrweb.record({
      emit: (event: eventWithTime) => {
        this.events.push(event);
        this.lastEventTime = Date.now();
      },
      sampling: {
        mousemove: 50,
        scroll: 150,
      },
      blockClass: "privacy",
      maskTextClass: "mask-text",
      collectFonts: true,
    });
  }

  private setupInitialFlush(): void {
    // Set up initial flush after 3 seconds
    this.timeoutId = window.setTimeout(() => {
      this.flush();
      // After initial flush, set up regular interval
      this.setupFlushInterval();
    }, this.initialFlushTimeout);
  }

  private setupFlushInterval(): void {
    this.intervalId = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    let screenshot: string | null = null;
    if (!this.hasScreenshot) {
      screenshot = await this.getPageScreenshot();
      this.hasScreenshot = true;
    }

    // Compress events using LZ compression
    const compressedEvents = await this.compressEvents(this.events);
    
    const payload = {
      id: this.sessionId,
      site_id: this.websiteId,
      started_at: this.startedAt,
      duration: this.lastEventTime - this.startedAt,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      events: compressedEvents,
      screenshot: screenshot,
    };

    try {
      // Use Beacon API for more reliable data sending, especially on page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: 'application/json',
        });
        
        const success = navigator.sendBeacon(
          `${this.collectorUrl}/api/collect`,
          blob
        );
        
        if (success) {
          this.events = [];
          this.checkSessionReset();
          return;
        }
      }

      // Fallback to fetch if sendBeacon fails or isn't available
      const response = await fetch(`${this.collectorUrl}/api/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      if (response.ok) {
        this.events = [];
        this.checkSessionReset();
      }
    } catch (error) {
      console.error("Failed to send session data:", error);
    }
  }

  private checkSessionReset(): void {
    if (this.lastEventTime - this.startedAt > 30 * 60 * 1000) {
      this.sessionId = uuidv4();
      this.startedAt = Date.now();
      this.hasScreenshot = false;
    }
  }

  private async compressEvents(events: eventWithTime[]): Promise<string> {
    const jsonString = JSON.stringify(events);
    const uint8Array = new TextEncoder().encode(jsonString);
    const compressed = pako.gzip(uint8Array);
    return btoa(String.fromCharCode.apply(null, Array.from(compressed)));
  }

  public stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.flush();
  }

  private async getPageScreenshot(): Promise<string | null> {
    try {
      const html2canvas = (await import("html2canvas")).default;

      const screenshot = await html2canvas(document.documentElement, {
        useCORS: true,
        scale: 1,
        logging: false,
        allowTaint: true,
      });

      return screenshot.toDataURL("image/jpeg", 0.95);
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      return null;
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

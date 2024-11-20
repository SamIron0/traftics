import * as rrweb from 'rrweb';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '@session-recorder/types';
import type { eventWithTime } from '@rrweb/types';

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
  private intervalId?: number;

  constructor(config: SessionConfig) {
    this.sessionId = uuidv4();
    this.websiteId = config.websiteId;
    this.collectorUrl = config.collectorUrl || 'https://gaha.vercel.app';
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
    this.setupFlushInterval();
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
      blockClass: 'privacy',
      maskTextClass: 'mask-text',
      collectFonts: true,
    });
  }

  private setupFlushInterval(): void {
    this.intervalId = window.setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const payload: Session = {
      id: this.sessionId,
      site_id: this.websiteId,
      started_at: this.startedAt,
      duration: this.lastEventTime - this.startedAt,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      events: [...this.events]
    };

    try {
      const response = await fetch(`${this.collectorUrl}/api/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Clear only events that were successfully sent
        this.events = [];
        
        // If session is getting too long, create a new session
        if (this.lastEventTime - this.startedAt > 30 * 60 * 1000) { // 30 minutes
          this.sessionId = uuidv4(); // Start a new session
          this.startedAt = Date.now();
        }
      }
    } catch (error) {
      console.error('Failed to send session data:', error);
    }
  }

  public stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    this.flush(); // Final flush of remaining events
  }
}

// Initialize tracker when script loads
declare global {
  interface Window {
    _r?: {
      websiteId: string;
      collectorUrl?: string;
    };
  }
}

if (typeof window !== 'undefined' && window._r) {
  const tracker = new SessionTracker({
    websiteId: window._r.websiteId,
    collectorUrl: window._r.collectorUrl
  });

  // Clean up on page unload
  window.addEventListener('unload', () => {
    tracker.stop();
  });
}

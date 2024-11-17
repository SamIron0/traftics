import * as rrweb from "rrweb";
import { RecordedEvent, Session } from "@session-recorder/types";
import { sendEvents } from "./transport";

export class SessionRecorder {
  private events: RecordedEvent[] = [];
  private sessionId: string;
  private readonly siteId: string;
  private readonly collectorUrl: string;
  private startTime: number;
  private stopFn: (() => void) | null = null;
  private uploadInterval: number | null = null;

  constructor({
    siteId,
    collectorUrl,
  }: {
    siteId: string;
    collectorUrl: string;
  }) {
    this.siteId = siteId;
    this.collectorUrl = collectorUrl;
    this.sessionId = crypto.randomUUID();
    this.startTime = Date.now();
  }

  start() {
    this.stopFn = rrweb.record({
      emit: (event: any) => {
        this.addEvent({
          ...event,
          timestamp: Date.now(),
        });
      },
      sampling: {
        mousemove: 50,
        scroll: 150,
      },
      maskAllInputs: true,
    }) as () => void;

    this.startEventUpload();
  }

  stop() {
    if (this.stopFn) {
      this.stopFn();
      this.stopFn = null;
    }
    if (this.uploadInterval) {
      window.clearInterval(this.uploadInterval);
      this.uploadInterval = null;
    }
  }

  private addEvent(event: RecordedEvent) {
    this.events.push(event);
  }

  private startEventUpload() {
    this.uploadInterval = window.setInterval(() => {
      if (this.events.length === 0) return;

      const eventsToSend = [...this.events];
      this.events = [];

      sendEvents(this.collectorUrl, {
        id: this.sessionId,
        siteId: this.siteId,
        startedAt: this.startTime,
        duration: Date.now() - this.startTime,
        events: eventsToSend,
        userAgent: navigator.userAgent,
        screenResolution: {
          width: window.screen.width,
          height: window.screen.height,
        },
      });
    },8000);
  }
}

import { v4 as uuidv4 } from "uuid";
import * as rrweb from "rrweb";
import type { eventWithTime } from "@rrweb/types";
import type { Session, SessionConfig, BatchConfig, RetryConfig } from "../types";
import { EventQueue } from "./EventQueue";
import { BatchManager } from "./BatchManager";
import { NetworkService } from "../services/NetworkService";
import { LocationService } from "../services/LocationService";
import { PerformanceService } from "../services/PerformanceService";
import { DEFAULT_BATCH_CONFIG } from "../utils/constants";

export class SessionManager {
  private readonly sessionId: string;
  private readonly websiteId: string;
  private readonly startedAt: number;
  private readonly eventQueue: EventQueue;
  private readonly batchManager: BatchManager;
  private readonly networkService: NetworkService;
  private readonly locationService: LocationService;
  private readonly performanceService: PerformanceService;
  private inactivityTimer: number | null = null;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  private currentHref: string;
  private previousHref: string | null = null;
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    maxBackoffMs: 10000,
  };

  constructor(config: SessionConfig) {
    this.sessionId = uuidv4();
    this.websiteId = config.websiteId;
    this.startedAt = Date.now();
    this.currentHref = window.location.href;
    this.previousHref = document.referrer || null;

    const batchConfig: BatchConfig = {
      ...DEFAULT_BATCH_CONFIG,
      ...config.batchConfig,
    };

    this.eventQueue = new EventQueue(batchConfig);
    this.networkService = new NetworkService(config.collectorUrl || "https://traftics.ironkwe.site");
    this.locationService = new LocationService();
    this.performanceService = new PerformanceService();

    this.batchManager = new BatchManager(
      this.eventQueue,
      batchConfig,
      this.networkService,
      this.sessionId,
      this.websiteId,
      this.startedAt,
      () => this.getSessionMetadata()
    );

    this.initialize();
  }

  private initialize(): void {
    this.setupUrlChangeListeners();
    this.startRecording();
    this.performanceService.setupMonitoring();
    this.batchManager.scheduleFlush(false, 5000);
  }

  private setupUrlChangeListeners(): void {
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
  }

  private startRecording(): void {
    rrweb.record({
      emit: (event: eventWithTime) => {
        this.handleEvent(event);
      },
      blockClass: "privacy",
      maskTextClass: "mask-text",
      collectFonts: true,
    });
  }

  private handleEvent(event: eventWithTime): void {
    const shouldFlush = this.eventQueue.push(event);
    this.resetInactivityTimer();
    if (shouldFlush) {
      this.batchManager.scheduleFlush(true);
    }
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      window.clearTimeout(this.inactivityTimer);
    }
    this.inactivityTimer = window.setTimeout(() => {
      this.stop('inactivity_timeout');
    }, this.INACTIVITY_TIMEOUT);
  }

  private handleUrlChange(source: 'pushState' | 'popstate' | 'replaceState'): void {
    const newHref = window.location.href;
    if (newHref !== this.currentHref) {
      const referrer = this.previousHref || document.referrer || '';
      this.previousHref = this.currentHref;
      this.currentHref = newHref;

      this.handleEvent({
        type: 5,
        timestamp: Date.now(),
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

  private getSessionMetadata(): Partial<Session> {
    const location = this.locationService.getCurrentLocation();
    return {
      started_at: this.startedAt,
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      location: location || undefined,
    };
  }

  public stop(reason: string = 'manual_stop'): void {
    if (this.inactivityTimer) {
      window.clearTimeout(this.inactivityTimer);
    }

    const finalBatch: Session = {
      id: this.sessionId,
      site_id: this.websiteId,
      duration: Date.now() - this.startedAt,
      is_active: false,
      end_reason: reason
    };

    this.batchManager.stop();
    this.networkService.sendBatch(finalBatch, this.retryConfig);
  }
} 
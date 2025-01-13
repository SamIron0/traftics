import type { Session, BatchConfig, RetryConfig } from "../types";
import { EventQueue } from "./EventQueue";
import { NetworkService } from "../services/NetworkService";
import { StorageService } from "../services/StorageService";

export class BatchManager {
  private isFlushInProgress = false;
  private hasFirstBatchBeenSent = false;
  private flushTimeout: number | null = null;
  private readonly storageService: StorageService;
private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    maxBackoffMs: 10000,
  };
  constructor(
    private readonly eventQueue: EventQueue,
    private readonly batchConfig: BatchConfig,
    private readonly networkService: NetworkService,
    private readonly sessionId: string,
    private readonly websiteId: string,
    private readonly startedAt: number,
    private readonly getSessionMetadata: () => Partial<Session>
  ) {
    this.storageService = new StorageService();
  }

  scheduleFlush(immediate = false, customTimeout?: number): void {
    if (this.flushTimeout) {
      window.clearTimeout(this.flushTimeout);
    }

    const timeout = immediate ? 0 : (customTimeout || this.batchConfig.flushInterval);
    this.flushTimeout = window.setTimeout(() => this.flush(), timeout);
  }

  async flush(): Promise<void> {
    if (this.isFlushInProgress || this.eventQueue.length === 0) return;

    this.isFlushInProgress = true;
    const batches = this.createBatches();

    try {
      await Promise.all(batches.map(batch => this.sendBatch(batch)));
      this.eventQueue.clear();
    } catch (error) {
      console.error("Failed to send batches:", error);
      this.scheduleFlush(true);
    } finally {
      this.isFlushInProgress = false;
    }

    this.scheduleFlush();
  }

  private createBatches(): Session[] {
    const eventBatches = this.eventQueue.createBatches(this.batchConfig.maxBatchSize);
    const isFirstBatch = !this.hasFirstBatchBeenSent;

    const batches = eventBatches.map(events => ({
      id: this.sessionId,
      site_id: this.websiteId,
      ...(isFirstBatch ? this.getSessionMetadata() : {}),
      duration: this.eventQueue.lastTime - this.startedAt,
      events,
    }));

    this.hasFirstBatchBeenSent = true;
    return batches;
  }

  private async sendBatch(batch: Session): Promise<void> {
    const success = await this.networkService.sendBatch(batch, this.retryConfig);

    if (!success) {
      this.storageService.storeFailedEvents(this.sessionId, batch);
    }
  }

  stop(): void {
    if (this.flushTimeout) {
      window.clearTimeout(this.flushTimeout);
    }
  }
} 
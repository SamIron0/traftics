import type { eventWithTime } from "@rrweb/types";
import type { BatchConfig } from "../types";

export class EventQueue {
  private queue: eventWithTime[] = [];
  private lastEventTime: number;
  private readonly maxQueueSize: number;
  
  constructor(batchConfig: BatchConfig) {
    this.lastEventTime = Date.now();
    this.maxQueueSize = batchConfig.maxQueueSize;
  }

  push(event: eventWithTime): boolean {
    this.queue.push(event);
    this.lastEventTime = Date.now();
    return this.queue.length >= this.maxQueueSize;
  }

  clear(): void {
    this.queue = [];
  }

  createBatches(maxBatchSize: number): eventWithTime[][] {
    const batches: eventWithTime[][] = [];
    for (let i = 0; i < this.queue.length; i += maxBatchSize) {
      batches.push(this.queue.slice(i, i + maxBatchSize));
    }
    return batches;
  }

  get length(): number {
    return this.queue.length;
  }

  get events(): eventWithTime[] {
    return this.queue;
  }

  get lastTime(): number {
    return this.lastEventTime;
  }
} 
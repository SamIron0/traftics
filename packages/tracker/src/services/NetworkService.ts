import type { Session, RetryConfig } from '../types';

export class NetworkService {
  private readonly collectorUrl: string;
  private quotaExceeded = false;

  constructor(collectorUrl: string) {
    this.collectorUrl = collectorUrl;
  }

  async sendBatch(batch: Session, retryConfig: RetryConfig): Promise<boolean> {
    if (this.quotaExceeded) {
      batch.is_active = false;
      batch.end_reason = 'quota_exceeded';
      return false;
    }

    let retries = 0;
    let backoff = retryConfig.backoffMs;

    while (retries <= retryConfig.maxRetries) {
      try {
        const response = await fetch(`${this.collectorUrl}/api/collect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        });

        if (response.ok) return true;

        if (response.status === 429) {
          const data = await response.json();
          if (data.code === "USAGE_LIMIT_EXCEEDED") {
            this.quotaExceeded = true;
            return false;
          }
        }

        if (response.status >= 400 && response.status < 500) {
          return false;
        }
      } catch (error) {
        console.warn(`Attempt ${retries + 1} failed:`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff = Math.min(backoff * 2, retryConfig.maxBackoffMs);
      retries++;
    }

    return false;
  }

  async updateSessionStatus(sessionId: string, status: {
    is_active: boolean;
    end_reason?: string;
    last_active_at: number;
  }): Promise<void> {
    try {
      await fetch(`${this.collectorUrl}/api/collect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status
        })
      });
    } catch (error) {
      console.error('Failed to update session status:', error);
    }
  }

  isQuotaExceeded(): boolean {
    return this.quotaExceeded;
  }
} 
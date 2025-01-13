import type { RetryConfig } from '../types';

export class RetryManager {
  private quotaExceeded = false;

  constructor(private readonly retryConfig: RetryConfig) {}

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    onQuotaExceeded?: () => void
  ): Promise<{ success: boolean; data?: T }> {
    if (this.quotaExceeded) {
      return { success: false };
    }

    let retries = 0;
    let backoff = this.retryConfig.backoffMs;

    while (retries <= this.retryConfig.maxRetries) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof Response) {
          if (error.status === 429) {
            const data = await error.json();
            if (data.code === "USAGE_LIMIT_EXCEEDED") {
              this.quotaExceeded = true;
              onQuotaExceeded?.();
              return { success: false };
            }
          }

          if (error.status >= 400 && error.status < 500) {
            return { success: false };
          }
        }

        console.warn(`Attempt ${retries + 1} failed:`, error);
        
        if (retries === this.retryConfig.maxRetries) {
          return { success: false };
        }
      }

      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff = Math.min(backoff * 2, this.retryConfig.maxBackoffMs);
      retries++;
    }

    return { success: false };
  }

  isQuotaExceeded(): boolean {
    return this.quotaExceeded;
  }
} 
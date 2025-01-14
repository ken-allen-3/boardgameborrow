import { logError } from '../../utils/errorUtils';

interface QueuedRequest {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export class RateLimiter {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private retryDelay = 15000; // 15 seconds
  private maxRetries = 3;

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: request,
        resolve,
        reject
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastRequestTime + this.retryDelay - now);

    if (timeToWait > 0) {
      await this.delay(timeToWait);
    }

    const request = this.queue.shift();
    if (!request) {
      this.processing = false;
      return;
    }

    let retries = 0;
    let currentDelay = this.retryDelay;

    try {
      while (retries <= this.maxRetries) {
        try {
          const result = await request.execute();
          this.lastRequestTime = Date.now();
          request.resolve(result);
          break;
        } catch (error: any) {
          if (error?.status === 429 && retries < this.maxRetries) {
            retries++;
            currentDelay *= 2;
            await this.delay(currentDelay);
            continue;
          }
          throw error;
        }
      }
    } catch (error) {
      logError({
        message: 'Rate limited request failed',
        code: 'RATE_LIMIT_ERROR',
        context: { retries, error }
      });
      request.reject(error);
    } finally {
      this.processing = false;
      this.processQueue();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
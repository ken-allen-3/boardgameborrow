import { ApiConfig, ApiError } from './types';
import { StorageCache } from './storage';
import { RateLimiter } from './rateLimiter';
import { createAppError } from '../../utils/errorUtils';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 3;

export class ApiClient {
  private config: ApiConfig;
  private cache: StorageCache;
  private rateLimiter: RateLimiter;
  private requestQueue = new Map<string, Promise<any>>();

  constructor(config: ApiConfig) {
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      retries: DEFAULT_RETRIES,
      ...config
    };

    this.cache = new StorageCache('bgg-api', 24); // 24 hour TTL
    this.rateLimiter = new RateLimiter();
  }

  async get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = url.toString();

    // Check cache
    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    // Handle concurrent requests
    const request = this.rateLimiter.enqueue(() => this.makeRequest<T>(url))
      .then(data => {
        this.cache.set(cacheKey, data);
        return data;
      });

    return request;
  }

  private async makeRequest<T>(url: URL, retries = this.config.retries): Promise<T> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml',
          'Origin': window.location.origin
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw this.handleHttpError(response);
      }

      const text = await response.text();
      if (!text.trim()) {
        throw createAppError('Empty response received', 'EMPTY_RESPONSE');
      }

      return text as unknown as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw createAppError('Request timed out', 'TIMEOUT_ERROR');
        }
        if (retries > 0 && this.shouldRetry(error)) {
          await this.delay(this.getRetryDelay(this.config.retries! - retries));
          return this.makeRequest(url, retries - 1);
        }
      }
      throw error;
    }
  }

  private buildUrl(endpoint: string, params: Record<string, string>): URL {
    const url = new URL(endpoint, this.config.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return url;
  }

  private handleHttpError(response: Response): ApiError {
    switch (response.status) {
      case 429:
        return createAppError('Too many requests, please try again later', 'RATE_LIMIT');
      case 404:
        return createAppError('Resource not found', 'NOT_FOUND');
      default:
        return createAppError(
          'Failed to fetch data',
          'HTTP_ERROR',
          { status: response.status }
        );
    }
  }

  private shouldRetry(error: Error): boolean {
    return error.name === 'TypeError' || // Network errors
           error.message.includes('Failed to fetch') ||
           error.message.includes('NetworkError');
  }

  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
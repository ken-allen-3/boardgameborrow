import { createAppError } from './errorUtils';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const requestQueue = new Map<string, Promise<any>>();

export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttl: number = CACHE_TTL
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  // Handle concurrent requests for same URL
  if (requestQueue.has(cacheKey)) {
    return requestQueue.get(cacheKey);
  }

  const request = fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw createAppError(
          'API request failed',
          'API_ERROR',
          { status: response.status }
        );
      }
      const data = await response.json();
      
      // Update cache
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    })
    .finally(() => {
      requestQueue.delete(cacheKey);
    });

  requestQueue.set(cacheKey, request);
  return request;
}

// Rate limiter
const rateLimits = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, window: number): boolean {
  const now = Date.now();
  const timestamps = rateLimits.get(key) || [];
  
  // Remove old timestamps
  const validTimestamps = timestamps.filter(t => now - t < window);
  
  if (validTimestamps.length >= limit) {
    return false;
  }
  
  validTimestamps.push(now);
  rateLimits.set(key, validTimestamps);
  return true;
}
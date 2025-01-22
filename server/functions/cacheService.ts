import { db } from './index';
import * as admin from 'firebase-admin';

interface CacheEntry {
  data: string;  // XML response data
  timestamp: number;
  endpoint: string;
  params: Record<string, any>;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_COLLECTION = 'api-cache';

export const generateCacheKey = (endpoint: string, params: Record<string, any>): string => 
  `${endpoint}:${JSON.stringify(params)}`;

export const isCacheValid = (entry: CacheEntry): boolean => 
  Date.now() - entry.timestamp < CACHE_TTL;

// Metric counters
let cacheHits = 0;
let cacheMisses = 0;
let rateLimitErrors = 0;
let totalRequests = 0;

export const logApiEvent = (type: string, data: any) => {
  const timestamp = new Date().toISOString();
  
  // Update metrics
  totalRequests++;
  switch(type) {
    case 'cache_hit':
      cacheHits++;
      break;
    case 'cache_miss':
      cacheMisses++;
      break;
    case 'api_error':
      if (data.error?.includes('429')) {
        rateLimitErrors++;
      }
      break;
  }

  // Log metrics every 100 requests
  if (totalRequests % 100 === 0) {
    const hitRatio = (cacheHits / totalRequests) * 100;
    console.log(JSON.stringify({
      type: 'metrics_summary',
      timestamp,
      cacheHits,
      cacheMisses,
      rateLimitErrors,
      hitRatio: `${hitRatio.toFixed(2)}%`,
      totalRequests
    }));
  }

  // Log the original event
  console.log(JSON.stringify({
    type,
    timestamp,
    ...data
  }));
};

export async function getCacheEntry(cacheKey: string): Promise<CacheEntry | null> {
  const startTime = Date.now();
  try {
    const doc = await db
      .collection(CACHE_COLLECTION)
      .doc(cacheKey)
      .get();

    if (!doc.exists) {
      return null;
    }

    const result = doc.data() as CacheEntry;
    const duration = Date.now() - startTime;
    logApiEvent('cache_performance', { 
      operation: 'getCacheEntry',
      duration,
      success: true
    });
    return result;
  } catch (error) {
    logApiEvent('cache_error', { error, operation: 'get', cacheKey });
    const duration = Date.now() - startTime;
    logApiEvent('cache_performance', { 
      operation: 'getCacheEntry',
      duration,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

export async function setCacheEntry(
  cacheKey: string, 
  entry: CacheEntry
): Promise<void> {
  const startTime = Date.now();
  let error: any = null;
  try {
    await db
      .collection(CACHE_COLLECTION)
      .doc(cacheKey)
      .set(entry);
    
    logApiEvent('cache_set', { 
      cacheKey,
      endpoint: entry.endpoint,
      timestamp: entry.timestamp
    });
  } catch (err) {
    error = err;
    logApiEvent('cache_error', { error, operation: 'set', cacheKey });
  } finally {
    const duration = Date.now() - startTime;
    logApiEvent('cache_performance', { 
      operation: 'setCacheEntry',
      duration,
      success: !error,
      error: error?.message
    });
  }
}

export async function handleCachedApiRequest(
  endpoint: string,
  params: Record<string, any>,
  apiFn: () => Promise<string>
): Promise<string> {
  const cacheKey = generateCacheKey(endpoint, params);

  const startTime = Date.now();
  
  // Try cache first
  try {
    const cachedEntry = await getCacheEntry(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
      logApiEvent('cache_hit', { endpoint, params });
      return cachedEntry.data;
    }
  } catch (error) {
    logApiEvent('cache_error', { error, endpoint, params });
    // Continue to API call on cache error
  }

  // Cache miss or invalid - call API
  logApiEvent('cache_miss', { endpoint, params });

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await apiFn();
      
      // Store in cache
      await setCacheEntry(cacheKey, {
        data: response,
        timestamp: Date.now(),
        endpoint,
        params
      });
      
      const duration = Date.now() - startTime;
      logApiEvent('cache_performance', { 
        operation: 'handleCachedApiRequest',
        duration,
        success: true
      });
      return response;
    } catch (error: any) {
      logApiEvent('api_error', { 
        attempt,
        error: error.message,
        endpoint,
        params 
      });
      
      if (attempt < MAX_RETRIES && error.response?.status !== 429) {
        logApiEvent('api_retry', { attempt, endpoint });
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      } else {
        throw error; // Rethrow after max retries or rate limit
      }
    }
  }

  const duration = Date.now() - startTime;
  logApiEvent('cache_performance', { 
    operation: 'handleCachedApiRequest',
    duration,
    success: false,
    error: 'Max retries exceeded'
  });
  throw new Error('Max retries exceeded');
}

import { db } from './index';

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

export const logApiEvent = (type: string, data: any) => {
  console.log(JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    ...data
  }));
};

export async function getCacheEntry(cacheKey: string): Promise<CacheEntry | null> {
  try {
    const doc = await db
      .collection(CACHE_COLLECTION)
      .doc(cacheKey)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as CacheEntry;
  } catch (error) {
    logApiEvent('cache_error', { error, operation: 'get', cacheKey });
    return null;
  }
}

export async function setCacheEntry(
  cacheKey: string, 
  entry: CacheEntry
): Promise<void> {
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
  } catch (error) {
    logApiEvent('cache_error', { error, operation: 'set', cacheKey });
  }
}

export async function handleCachedApiRequest(
  endpoint: string,
  params: Record<string, any>,
  apiFn: () => Promise<string>
): Promise<string> {
  const cacheKey = generateCacheKey(endpoint, params);

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

  throw new Error('Max retries exceeded');
}

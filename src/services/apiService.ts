import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';
import { createAppError } from '../utils/errorUtils';

const functions = getFunctions(app);
const bggSearch = httpsCallable(functions, 'bggSearch');
const bggGameDetails = httpsCallable(functions, 'bggGameDetails');

// Cache configuration

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const requestQueue = new Map<string, Promise<any>>();

export async function makeApiRequest(endpoint: string, params: Record<string, string> = {}): Promise<string> {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[API] Returning cached response for:', cacheKey);
    return cached.data;
  }

  // Handle concurrent requests for same URL
  if (requestQueue.has(cacheKey)) {
    return requestQueue.get(cacheKey);
  }

  console.log('[API] Making request:', { endpoint, params });

  const request = (endpoint === '/search' ? bggSearch(params) : bggGameDetails(params))
    .then(response => {
      const xmlData = response.data as string;
      
      // Cache successful response
      cache.set(cacheKey, {
        data: xmlData,
        timestamp: Date.now()
      });
      
      return xmlData;
    })
    .catch(error => {
      console.error('[API] Request failed:', error);
      
      if (error.code === 'functions/resource-exhausted') {
        throw createAppError(
          'Too many requests. Please try again in a few minutes.',
          'RATE_LIMIT_ERROR'
        );
      }
      
      throw createAppError(
        'Failed to fetch game data. Please try again.',
        'API_ERROR',
        { originalError: error }
      );
    })
    .finally(() => {
      requestQueue.delete(cacheKey);
    });

  requestQueue.set(cacheKey, request);
  return request;
}

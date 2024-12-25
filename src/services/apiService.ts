import axios, { AxiosResponse, AxiosError } from 'axios';
import { createAppError } from '../utils/errorUtils';

const FUNCTIONS_BASE_URL = 'https://us-central1-boardgameshare-001.cloudfunctions.net';

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

  const functionName = endpoint === '/search' ? 'searchGames' : 'getGameDetails';
  const url = `${FUNCTIONS_BASE_URL}/${functionName}`;

  const request = axios.get(url, { params })
    .then((response: AxiosResponse) => {
      const xmlData = response.data;
      
      // Cache successful response
      cache.set(cacheKey, {
        data: xmlData,
        timestamp: Date.now()
      });
      
      return xmlData;
    })
    .catch((error: AxiosError) => {
      console.error('[API] Request failed:', error);
      
      if (error.response?.status === 429) {
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

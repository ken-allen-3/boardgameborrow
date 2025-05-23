import axios, { AxiosResponse, AxiosError } from 'axios';
import { createAppError } from '../utils/errorUtils';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://us-central1-boardgameshare-001.cloudfunctions.net';

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const requestQueue = new Map<string, Promise<any>>();

// Common axios configuration
const axiosConfig = {
  withCredentials: true,
  timeout: 10000,
  validateStatus: (status: number) => status < 500
};

export async function makeCacheRequest(endpoint: string, token: string): Promise<any> {
  const url = `${FUNCTIONS_BASE_URL}/${endpoint}`;
  
  console.log(`[API] Making cache request to: ${endpoint}`);
  
  return axios.get(url, {
    ...axiosConfig,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .catch((error: AxiosError) => {
      console.error('[API] Cache request failed:', error);
      
      if (error.response?.status === 401) {
        throw createAppError(
          'Authentication required. Please sign in again.',
          'AUTH_ERROR'
        );
      }
      
      throw createAppError(
        'Failed to initialize cache. Please try again.',
        'CACHE_ERROR',
        { originalError: error }
      );
    });
}

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

  const url = `${FUNCTIONS_BASE_URL}/${endpoint === 'game-details' ? 'getGameDetails' : 'searchGames'}`;

  const request = axios.get(url, { 
    params,
    responseType: 'text' // All BGG responses come as XML through our Firebase Functions
  })
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
        const operation = endpoint.includes('search') ? 'game search' : 
                         endpoint.includes('thing') ? 'game details' : 
                         'BoardGameGeek API';
        throw createAppError(
          `The BoardGameGeek API is currently rate limited. Please wait a few minutes before trying another ${operation}.`,
          'RATE_LIMIT_ERROR',
          { operation, endpoint }
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

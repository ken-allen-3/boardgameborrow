import { BOARD_GAME_API } from '../config/constants';
import { createAppError } from '../utils/errorUtils';

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;
const CORS_PROXY = 'https://corsproxy.io/?';

interface RateLimitConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 3,
  baseDelay: BASE_RETRY_DELAY,
  maxDelay: MAX_RETRY_DELAY
};

class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRetryDelay(attempt: number): number {
  const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
  return Math.min(delay, MAX_RETRY_DELAY);
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const requestQueue = new Map<string, Promise<any>>();

export async function makeApiRequest(endpoint: string, params: Record<string, string> = {}): Promise<string> {
  // Build the BGG API URL first
  const bggUrl = new URL(BOARD_GAME_API.BASE_URL + endpoint.replace(/^\//, ''));
  Object.entries(params).forEach(([key, value]) => {
    bggUrl.searchParams.append(key, value);
  });
  
  // Then encode it for the CORS proxy
  const proxyUrl = CORS_PROXY + encodeURIComponent(bggUrl.toString());
  const cacheKey = bggUrl.toString();

  console.log('[API] Making request:', {
    originalUrl: bggUrl.toString(),
    proxyUrl
  });

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

  const request = retryRequest(proxyUrl, {}, MAX_RETRIES)
    .then(response => {
      // Cache successful response
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      return response;
    })
    .catch(error => {
      if (error instanceof RateLimitError) {
        throw createAppError(
          'Too many requests. Please try again in a few minutes.',
          'RATE_LIMIT_ERROR'
        );
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw createAppError(
          'Unable to connect to BoardGameGeek. Please check your internet connection.',
          'NETWORK_ERROR'
        );
      }
      throw createAppError(
        'An error occurred while fetching game data. Please try again.',
        'API_ERROR'
      );
    })
    .finally(() => {
      requestQueue.delete(cacheKey);
    });

  requestQueue.set(cacheKey, request);
  return request;
}

async function retryRequest(
  url: string,
  options: RequestInit,
  retriesLeft: number = MAX_RETRIES
): Promise<string> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/xml',
        'Origin': window.location.origin
      }
    });

    // Log response status for debugging
    console.log('[API] Response status:', {
      url,
      status: response.status,
      statusText: response.statusText
    });

    // Check for rate limiting response
    if (response.status === 429) {
      const retryDelay = getRetryDelay(MAX_RETRIES - retriesLeft + 1);
      if (retriesLeft > 0) {
        await delay(retryDelay);
        return retryRequest(url, options, retriesLeft - 1);
      }
      throw new RateLimitError('Rate limit exceeded');
    }

    // Check for other error responses
    if (!response.ok) {
      throw createAppError(
        'Failed to fetch game data',
        'API_ERROR',
        { status: response.status }
      );
    }

    const text = await response.text();
    
    // Log response length for debugging
    console.log('[API] Response length:', text.length);

    if (!text.trim()) {
      throw createAppError(
        'Received empty response from API',
        'EMPTY_RESPONSE'
      );
    }

    // Validate XML response
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');
    if (doc.querySelector('parsererror')) {
      throw createAppError(
        'Invalid XML response from API',
        'INVALID_RESPONSE'
      );
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw createAppError(
          'Unable to connect to BoardGameGeek. Please check your internet connection.',
          'NETWORK_ERROR',
          { originalError: error }
        );
      }
      throw error;
    }
    throw createAppError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
}
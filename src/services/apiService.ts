import { BOARD_GAME_API } from '../config/constants';

interface RateLimitConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 10000  // 10 seconds
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

async function fetchWithRetry(
  url: string,
  config: RateLimitConfig = defaultConfig
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      
      // Check for rate limiting response
      if (response.status === 429) {
        throw new RateLimitError('Rate limit exceeded');
      }
      
      // Check for other error responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      // If this is the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const backoffDelay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );
      
      console.log(`Attempt ${attempt} failed, retrying in ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }
  
  throw lastError;
}

export async function makeApiRequest(endpoint: string, params: Record<string, string> = {}): Promise<string> {
  const url = new URL(BOARD_GAME_API.BASE_URL + endpoint);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  try {
    const response = await fetchWithRetry(url.toString());
    return response.text();
  } catch (error: any) {
    if (error instanceof RateLimitError) {
      throw new Error('The service is temporarily unavailable. Please try again in a few moments.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the game database. Please check your internet connection.');
    }
    
    throw new Error('An error occurred while fetching game data. Please try again.');
  }
}
import { auth } from '../config/firebase';
import { CacheMetrics } from '../types/cache';
import { makeCacheRequest } from './apiService';
import axios, { AxiosError } from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await wait(delay);
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
};

interface DetailedError {
  name?: string;
  message?: string;
  code?: string;
  details?: unknown;
  stack?: string;
  timestamp: string;
}

const logDetailedError = (error: unknown, context: string) => {
  const errorDetails: DetailedError = {
    timestamp: new Date().toISOString(),
    message: 'Unknown error'
  };

  if (error instanceof Error) {
    errorDetails.name = error.name;
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
    
    // Check for Firebase Functions error properties
    const functionError = error as { code?: string; details?: unknown };
    if (functionError.code) {
      errorDetails.code = functionError.code;
    }
    if (functionError.details) {
      errorDetails.details = functionError.details;
    }
  } else {
    errorDetails.message = String(error);
  }
  
  console.error(`Detailed ${context} error:`, errorDetails);
};

export const getCacheMetrics = async (): Promise<CacheMetrics> => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    console.log('Making metrics call...');
    const result = await retryOperation(async () => {
      const response = await makeCacheRequest('getCacheMetrics', idToken);
      
      if (!response.data) {
        throw new Error('No data returned from metrics call');
      }
      return response;
    });
    
    console.log('Metrics call successful:', result);
    return result.data;
  } catch (error) {
    logDetailedError(error, 'metrics');
    
    if (error instanceof Error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error('Authentication required to fetch metrics');
        }
        if (error.response?.status === 500) {
          throw new Error('Internal server error while fetching metrics');
        }
      }
    }
    
    return {
      totalCachedGames: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      lastRefreshDate: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const initializeCache = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      throw new Error('Not authenticated');
    }

    console.log('Making initialization call...');
    const result = await retryOperation(async () => {
      const response = await makeCacheRequest('initializeCache', idToken);
      
      if (!response.data) {
        throw new Error('No response from initialization');
      }
      return response;
    });
    
    console.log('Cache initialization successful:', result);
    return result.data;
  } catch (error) {
    logDetailedError(error, 'initialization');
    
    if (error instanceof Error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error('Authentication required to initialize cache');
        }
        if (error.response?.status === 500) {
          throw new Error('Internal server error during initialization');
        }
      }
      throw new Error(`Cache initialization failed: ${error.message}`);
    }
    
    throw new Error('Cache initialization failed: Unknown error');
  }
};

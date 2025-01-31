import { httpsCallable } from 'firebase/functions';
import { functions, getFirebaseStatus } from '../config/firebase';
import { CacheMetrics } from '../types/cache';

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

const logFunctionConfig = () => {
  console.log('Firebase Functions Configuration:', {
    region: functions.region,
    customDomain: (functions as any).customDomain,
    app: functions.app?.name,
    projectId: functions.app?.options?.projectId,
    emulator: process.env.FUNCTIONS_EMULATOR ? true : false
  });
};

export const getCacheMetrics = async (): Promise<CacheMetrics> => {
  try {
    const { isInitialized, error } = getFirebaseStatus();
    if (!isInitialized) {
      throw new Error(`Firebase not initialized: ${error?.message || 'Unknown error'}`);
    }

    logFunctionConfig();
    const getMetrics = httpsCallable<object, CacheMetrics>(functions, 'getCacheMetrics');
    
    console.log('Making metrics call...');
    const result = await retryOperation(async () => {
      const response = await getMetrics({});
      if (!response.data) {
        throw new Error('No data returned from metrics call');
      }
      return response;
    });
    
    if (!result.data) {
      throw new Error('No data returned from metrics call');
    }
    
    console.log('Metrics call successful:', result);
    return result.data;
  } catch (error) {
    logDetailedError(error, 'metrics');
    
    // Check for specific Firebase error types
    if (error instanceof Error) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'functions/unauthenticated') {
        throw new Error('Authentication required to fetch metrics');
      }
      if (firebaseError.code === 'functions/internal') {
        throw new Error('Internal server error while fetching metrics');
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
    const { isInitialized, error } = getFirebaseStatus();
    if (!isInitialized) {
      throw new Error(`Firebase not initialized: ${error?.message || 'Unknown error'}`);
    }

    logFunctionConfig();
    console.log('Setting up cache initialization...');
    const initialize = httpsCallable<object, { success: boolean; message: string }>(
      functions,
      'initializeCache',
      { timeout: 300000 } // 5 minutes timeout
    );
    
    console.log('Making initialization call...');
    const result = await retryOperation(async () => {
      const response = await initialize({});
      if (!response.data) {
        throw new Error('No response from initialization');
      }
      return response;
    });
    
    if (!result.data) {
      throw new Error('No response from initialization');
    }
    
    console.log('Cache initialization successful:', result);
    return result.data;
  } catch (error) {
    logDetailedError(error, 'initialization');
    
    // Check for specific Firebase error types
    if (error instanceof Error) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'functions/unauthenticated') {
        throw new Error('Authentication required to initialize cache');
      }
      if (firebaseError.code === 'functions/internal') {
        throw new Error('Internal server error during initialization');
      }
      
      const code = firebaseError.code || 'UNKNOWN';
      throw new Error(`Cache initialization failed: ${error.message} (Code: ${code})`);
    }
    
    throw new Error('Cache initialization failed: Unknown error');
  }
};

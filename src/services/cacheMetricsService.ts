import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { CacheMetrics } from '../types/cache';


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
    logFunctionConfig();
    const getMetrics = httpsCallable<void, CacheMetrics>(functions, 'getCacheMetrics');
    
    console.log('Making metrics call...');
    const result = await getMetrics();
    
    console.log('Metrics call successful:', result);
    return result.data;
  } catch (error) {
    logDetailedError(error, 'metrics');
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
    logFunctionConfig();
    console.log('Setting up cache initialization...');
    const initialize = httpsCallable<void, { success: boolean; message: string }>(
      functions,
      'initializeCache',
      { timeout: 300000 } // 5 minutes timeout
    );
    
    console.log('Making initialization call...');
    const result = await initialize();
    
    console.log('Cache initialization successful:', result);
    return result.data;
  } catch (error) {
    logDetailedError(error, 'initialization');
    if (error instanceof Error) {
      const code = 'code' in error ? (error as { code?: string }).code : 'UNKNOWN';
      throw new Error(`Cache initialization failed: ${error.message} (Code: ${code})`);
    }
    throw new Error('Cache initialization failed: Unknown error');
  }
};

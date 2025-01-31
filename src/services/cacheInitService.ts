import { initializeCache as initializeCacheFunction } from './cacheMetricsService';

export const initializeCache = async (): Promise<void> => {
  try {
    const result = await initializeCacheFunction();
    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to initialize cache:', error);
    throw error;
  }
};

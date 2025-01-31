import { getFunctions, httpsCallable } from 'firebase/functions';
import { CacheMetrics } from '../types/cache';

export const getCacheMetrics = async (): Promise<CacheMetrics> => {
  try {
    const functions = getFunctions();
    const getMetrics = httpsCallable<void, CacheMetrics>(functions, 'getCacheMetrics');
    const result = await getMetrics();
    return result.data;
  } catch (error) {
    console.error('Error fetching cache metrics:', error);
    return {
      totalCachedGames: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      lastRefreshDate: 'Error'
    };
  }
};

export const initializeCache = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const functions = getFunctions();
    const initialize = httpsCallable<void, { success: boolean; message: string }>(
      functions,
      'initializeCache'
    );
    const result = await initialize();
    return result.data;
  } catch (error) {
    console.error('Error initializing cache:', error);
    throw error;
  }
};

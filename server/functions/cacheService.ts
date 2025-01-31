import { getFirestore, DocumentSnapshot } from 'firebase-admin/firestore';

const db = getFirestore();

interface CacheEvent {
  type: string;
  data?: any;
  timestamp: number;
}

export const logApiEvent = async (type: string, data: any) => {
  try {
    await db.collection('cache-events').add({
      type,
      data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error logging cache event:', error);
  }
};

export const calculateCacheHitRate = async (): Promise<number> => {
  try {
    const eventsRef = db.collection('cache-events');
    const last100Events = await eventsRef
      .where('type', 'in', ['cache_hit', 'cache_miss'])
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    if (last100Events.empty) return 0;

    const hits = last100Events.docs.filter(doc => doc.data().type === 'cache_hit').length;
    return (hits / last100Events.size) * 100;
  } catch (error) {
    console.error('Error calculating cache hit rate:', error);
    return 0;
  }
};

export const calculateMemoryUsage = (snapshot: FirebaseFirestore.QuerySnapshot): number => {
  try {
    // Rough estimation of memory usage based on document sizes
    const totalBytes = snapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      return acc + JSON.stringify(data).length;
    }, 0);

    // Convert to megabytes
    return Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
  } catch (error) {
    console.error('Error calculating memory usage:', error);
    return 0;
  }
};

export const getLastRefreshDate = async (): Promise<string> => {
  try {
    const eventsRef = db.collection('cache-events');
    const lastRefresh = await eventsRef
      .where('type', '==', 'cache_refresh')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (lastRefresh.empty) return 'Never';

    return new Date(lastRefresh.docs[0].data().timestamp).toISOString();
  } catch (error) {
    console.error('Error getting last refresh date:', error);
    return 'Error';
  }
};

export const initializeCacheData = async (): Promise<void> => {
  try {
    // Check if cache is already initialized
    const gameDetailsRef = db.collection('game-details');
    const existingGames = await gameDetailsRef.get();
    
    if (existingGames.size > 1) {
      console.log('Cache already contains games, skipping initialization');
      return;
    }

    // Log initialization start
    await logApiEvent('cache_refresh', {
      status: 'started',
      timestamp: Date.now()
    });

    // Initialize cache (implementation would go here)
    // This would typically involve fetching data from BGG API
    // and populating the cache collections

    // Log successful initialization
    await logApiEvent('cache_refresh', {
      status: 'completed',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error initializing cache:', error);
    
    // Log initialization failure
    await logApiEvent('cache_refresh', {
      status: 'failed',
      error: error.message,
      timestamp: Date.now()
    });
    
    throw error;
  }
};

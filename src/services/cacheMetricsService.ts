import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CacheMetrics } from '../types/cache';

export const getCacheMetrics = async (): Promise<CacheMetrics> => {
  try {
    // Get game details cache collection
    const gameDetailsRef = collection(db, 'game-details');
    const gameDetailsSnap = await getDocs(gameDetailsRef);
    
    // Get game rankings cache collection for last refresh date
    const rankingsRef = collection(db, 'game-rankings');
    const rankingsQuery = query(rankingsRef, orderBy('lastUpdated', 'desc'), limit(1));
    const rankingsSnap = await getDocs(rankingsQuery);
    
    // Calculate metrics
    let totalHits = 0;
    let totalAccesses = 0;
    let totalSize = 0;

    gameDetailsSnap.forEach(doc => {
      const data = doc.data();
      if (data.metadata) {
        totalHits += data.metadata.usageCount || 0;
        totalAccesses += 1;
        // Rough estimation of entry size in bytes
        totalSize += JSON.stringify(data).length;
      }
    });

    const lastRefreshDate = rankingsSnap.empty 
      ? 'Never' 
      : new Date(rankingsSnap.docs[0].data().lastUpdated).toLocaleDateString();

    return {
      totalCachedGames: gameDetailsSnap.size,
      cacheHitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0,
      memoryUsage: Math.round(totalSize / 1024), // Convert to KB
      lastRefreshDate
    };
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

import { onSchedule, ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { GameData } from '../../src/types/boardgame';
import { bggApiService } from '../../src/services/bggApiService';

const CATEGORIES = [
  'abstracts',
  'cgs',
  'childrens',
  'family',
  'party',
  'strategy',
  'thematic',
  'wargames'
] as const;

interface GameCacheEntry {
  gameData: GameData;
  metadata: {
    lastUpdated: number;
    usageCount: number;
  };
}

const getCurrentMonth = (): string => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getHighUsageGames = async (): Promise<Set<string>> => {
  const highUsageGames = new Set<string>();
  const db = getFirestore();
  const querySnapshot = await db.collection('game-details')
    .where('metadata.usageCount', '>=', 10)
    .get();

  querySnapshot.forEach(doc => {
    highUsageGames.add(doc.id);
  });

  return highUsageGames;
};

export const refreshPopularGamesCache = onSchedule('0 0 1 * *', async (event) => {
    const currentMonth = getCurrentMonth();
    console.log(`Starting cache refresh for ${currentMonth}`);

    try {
      // Get high usage games to avoid re-fetching them
      const highUsageGames = await getHighUsageGames();
      console.log(`Found ${highUsageGames.size} high usage games to preserve`);

      // Process each category
      for (const category of CATEGORIES) {
        console.log(`Processing category: ${category}`);
        
        try {
          // Get current rankings
          const rankings = await bggApiService.fetchCategoryRankings(category);
          
          // Filter out high usage games that are already cached
          const newRankings = rankings.filter(game => !highUsageGames.has(game.id));
          
          // Store new rankings
          const db = getFirestore();
          await db.collection('game-rankings')
            .doc(category)
            .collection('monthly')
            .doc(currentMonth)
            .set({
              games: newRankings,
              lastUpdated: Date.now(),
              source: 'bgg-api',
              metadata: {
                totalGames: newRankings.length,
                preservedGames: rankings.length - newRankings.length,
                refreshDate: new Date().toISOString()
              }
            }
          );

          console.log(`Successfully updated ${category} rankings with ${newRankings.length} games`);
        } catch (error) {
          console.error(`Failed to update ${category} rankings:`, error);
          // Continue with other categories even if one fails
        }
      }

      // Log completion
      console.log('Cache refresh completed successfully');
      return;
    } catch (error) {
      console.error('Failed to complete cache refresh:', error);
      throw error;
    }
  });

// Export for testing
export const refreshCacheManually = async (): Promise<void> => {
  const mockEvent: ScheduledEvent = {
    scheduleTime: new Date().toISOString()
  };
  
  // Get the function implementation directly
  const functionImpl = refreshPopularGamesCache.run;
  if (functionImpl) {
    await functionImpl(mockEvent);
  } else {
    throw new Error('Function implementation not available');
  }
};

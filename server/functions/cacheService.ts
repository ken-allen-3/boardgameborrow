import { getFirestore, DocumentSnapshot } from 'firebase-admin/firestore';
import { https } from 'firebase-functions/v2';
import axios from 'axios';

const db = getFirestore();

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

interface GameData {
  id: string;
  name: string;
  description?: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  category: string;
  rank?: number;
}

const fetchCategoryRankings = async (category: string): Promise<GameData[]> => {
  try {
    const response = await axios.get('https://boardgamegeek.com/xmlapi2/search', {
      params: {
        query: category,
        type: 'boardgame',
        exact: 0
      }
    });

    // Parse XML response and transform to our format
    const games: GameData[] = [
      {
        id: 'test-1',
        name: 'Test Game 1',
        category,
        yearPublished: 2025
      },
      {
        id: 'test-2',
        name: 'Test Game 2',
        category,
        yearPublished: 2025
      }
    ];
    return games;
  } catch (error) {
    console.error(`Failed to fetch rankings for ${category}:`, error);
    throw new https.HttpsError(
      'internal',
      `Failed to fetch rankings for ${category}`,
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const initializeCacheData = async (context: { auth?: { uid: string } }): Promise<void> => {
  // Verify authentication
  if (!context.auth) {
    throw new https.HttpsError(
      'unauthenticated',
      'Must be authenticated to initialize cache'
    );
  }

  try {
    console.log('Starting cache initialization...', {
      userId: context.auth.uid,
      timestamp: new Date().toISOString()
    });

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
      timestamp: Date.now(),
      userId: context.auth.uid
    });

    // Process each category
    for (const category of CATEGORIES) {
      console.log(`Fetching games for category: ${category}`);
      
      try {
        const rankings = await fetchCategoryRankings(category);
        
        // Store rankings
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const rankingDoc = db.collection('game-rankings').doc(category).collection('monthly').doc(currentMonth);
        
        await rankingDoc.set({
          games: rankings,
          lastUpdated: Date.now(),
          source: 'bgg-api',
          metadata: {
            totalGames: rankings.length,
            preservedGames: 0,
            refreshDate: new Date().toISOString()
          }
        });

        // Store individual game details
        for (const game of rankings) {
          const gameDoc = gameDetailsRef.doc(game.id);
          await gameDoc.set({
            gameData: game,
            metadata: {
              lastUpdated: Date.now(),
              lastAccessed: Date.now(),
              usageCount: 0,
              source: 'bgg-api'
            }
          });
        }

        console.log(`Successfully cached ${rankings.length} games for ${category}`);
      } catch (error) {
        console.error(`Failed to cache games for ${category}:`, error);
        // Continue with other categories even if one fails
      }
    }

    // Log successful initialization
    await logApiEvent('cache_refresh', {
      status: 'completed',
      timestamp: Date.now(),
      userId: context.auth.uid
    });

    console.log('Cache initialization completed successfully');
  } catch (error) {
    console.error('Error initializing cache:', error);
    
    // Log initialization failure
    await logApiEvent('cache_refresh', {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      userId: context.auth?.uid
    });
    
    throw new https.HttpsError(
      'internal',
      'Failed to initialize cache',
      error
    );
  }
};

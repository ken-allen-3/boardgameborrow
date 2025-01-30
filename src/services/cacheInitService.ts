import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { bggApiService } from './bggApiService';

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

export const initializeCache = async (): Promise<void> => {
  try {
    console.log('Starting cache initialization...');
    
    // Check if cache is already initialized
    const gameDetailsRef = collection(db, 'game-details');
    const existingGames = await getDocs(gameDetailsRef);
    
    if (existingGames.size > 1) { // More than just our _test document
      console.log('Cache already contains games, skipping initialization');
      return;
    }

    // Process each category
    for (const category of CATEGORIES) {
      console.log(`Fetching games for category: ${category}`);
      
      try {
        const rankings = await bggApiService.fetchCategoryRankings(category);
        
        // Store rankings
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const rankingDoc = doc(db, 'game-rankings', category, 'monthly', currentMonth);
        
        await setDoc(rankingDoc, {
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
          const gameDoc = doc(gameDetailsRef, game.id);
          await setDoc(gameDoc, {
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

    console.log('Cache initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize cache:', error);
    throw error;
  }
};

import { https } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';
import { JSDOM } from 'jsdom';

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

interface GameData {
  id: string;
  name: string;
  rank: {
    abstracts: number | null;
    cgs: number | null;
    childrens: number | null;
    family: number | null;
    party: number | null;
    strategy: number | null;
    thematic: number | null;
    wargames: number | null;
  };
  image?: string;
  playerCount?: {
    min: number;
    max: number;
  };
  playTime?: {
    min: number;
    max: number;
  };
  description?: string;
}

export const initializeCacheV2 = https.onCall({
  cors: ['https://boardgameborrow.com', 'http://localhost:5174'],
  timeoutSeconds: 300,
  memory: "512MiB",
  minInstances: 0,
  region: 'us-central1'
}, async (request, context) => {
  // Check if user is authenticated and admin
  // @ts-ignore
  if (!context?.auth) {
    throw new https.HttpsError(
      'unauthenticated',
      'Must be authenticated to initialize cache'
    );
  }

  const db = getFirestore();
  // @ts-ignore
  const userRef = db.collection('users').doc(context.auth.uid);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (!userData?.isAdmin) {
    throw new https.HttpsError(
      'permission-denied',
      'Must be an admin to initialize cache'
    );
  }

  try {
    // Process each category
    for (const category of CATEGORIES) {
      console.log(`Processing category: ${category}`);
      
      // Get top games for category from BGG API
      const response = await axios.get(
        `https://boardgamegeek.com/xmlapi2/search?query=${category}&type=boardgame&exact=0`
      );
      
      const dom = new JSDOM(response.data, { contentType: 'text/xml' });
      const xmlDoc = dom.window.document;
      const items = Array.from(xmlDoc.querySelectorAll('item')) as Element[];
      
      const games: GameData[] = [];
      
      // Get details for each game
      for (const item of items.slice(0, 50)) {
        const id = item.getAttribute('id');
        if (!id) continue;

        try {
          const gameResponse = await axios.get(
            `https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`
          );
          const gameDoc = new JSDOM(gameResponse.data, { contentType: 'text/xml' }).window.document;
          const gameItem = gameDoc.querySelector('item');
          
          if (!gameItem) continue;

          const game: GameData = {
            id,
            name: gameItem.querySelector('name[type="primary"]')?.getAttribute('value') || '',
            rank: {
              abstracts: parseRanking(gameDoc, 'abstracts'),
              cgs: parseRanking(gameDoc, 'cgs'),
              childrens: parseRanking(gameDoc, 'childrens'),
              family: parseRanking(gameDoc, 'family'),
              party: parseRanking(gameDoc, 'party'),
              strategy: parseRanking(gameDoc, 'strategy'),
              thematic: parseRanking(gameDoc, 'thematic'),
              wargames: parseRanking(gameDoc, 'wargames')
            },
            image: gameItem.querySelector('image')?.textContent || undefined,
            playerCount: {
              min: parseInt(gameItem.querySelector('minplayers')?.getAttribute('value') || '0'),
              max: parseInt(gameItem.querySelector('maxplayers')?.getAttribute('value') || '0')
            },
            playTime: {
              min: parseInt(gameItem.querySelector('minplaytime')?.getAttribute('value') || '0'),
              max: parseInt(gameItem.querySelector('maxplaytime')?.getAttribute('value') || '0')
            },
            description: gameItem.querySelector('description')?.textContent || undefined
          };

          games.push(game);
          
          // Store individual game details
          await db.collection('game-details').doc(id).set({
            gameData: game,
            metadata: {
              lastUpdated: Date.now(),
              lastAccessed: Date.now(),
              usageCount: 0,
              source: 'bgg-api'
            }
          });
        } catch (error) {
          console.error(`Failed to fetch game ${id}:`, error);
          // Continue with other games
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Store rankings
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      await db.collection('game-rankings')
        .doc(category)
        .collection('monthly')
        .doc(currentMonth)
        .set({
          games,
          lastUpdated: Date.now(),
          source: 'bgg-api',
          metadata: {
            totalGames: games.length,
            preservedGames: 0,
            refreshDate: new Date().toISOString()
          }
        });
    }

    return { success: true, message: 'Cache initialized successfully' };
  } catch (error) {
    console.error('Failed to initialize cache:', error);
    throw new https.HttpsError(
      'internal',
      'Failed to initialize cache'
    );
  }
});

export const getCacheMetricsV2 = https.onCall({
  cors: ['https://boardgameborrow.com', 'http://localhost:5174'],
  timeoutSeconds: 60,
  memory: "256MiB",
  minInstances: 0,
  region: 'us-central1'
}, async (request, context) => {
  // @ts-ignore
  if (!context?.auth) {
    throw new https.HttpsError(
      'unauthenticated',
      'Must be authenticated to get cache metrics'
    );
  }

  try {
    const db = getFirestore();
    
    // Get game details cache collection
    const gameDetailsRef = db.collection('game-details');
    const gameDetailsSnap = await gameDetailsRef.get();
    
    // Get game rankings cache collection for last refresh date
    const rankingsRef = db.collection('game-rankings');
    const rankingsSnap = await rankingsRef
      .orderBy('lastUpdated', 'desc')
      .limit(1)
      .get();
    
    // Calculate metrics
    let totalHits = 0;
    let totalAccesses = 0;
    let totalSize = 0;

    gameDetailsSnap.forEach(doc => {
      const data = doc.data();
      if (data.metadata) {
        totalHits += data.metadata.usageCount || 0;
        totalAccesses += 1;
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
    throw new https.HttpsError(
      'internal',
      'Failed to fetch cache metrics'
    );
  }
});

function parseRanking(xmlDoc: Document, category: string): number | null {
  const rankElement = xmlDoc.querySelector(`rank[friendlyname="${category}"]`);
  const value = rankElement?.getAttribute('value');
  return value && value !== 'Not Ranked' ? parseInt(value) : null;
}

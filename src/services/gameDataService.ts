import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { GameData } from '../types/boardgame';
import axios from 'axios';

interface FirebaseGameCache {
  games: GameData[];
  lastUpdated: number;
  source: 'bgg-api' | 'csv';
  metadata?: {
    totalGames: number;
    preservedGames: number;
    refreshDate: string;
  };
}

let localGameCache: Map<string, GameData[]> = new Map();

export const gameDataService = {
  async initializeCache() {
    console.log('[gameDataService] Initializing cache');
    try {
      // Clear local cache
      localGameCache.clear();
      console.log('[gameDataService] Local cache cleared');
      
      // Use cloud function for cache initialization
      const { initializeCache } = await import('./cacheMetricsService');
      const result = await initializeCache();
      if (!result.success) {
        throw new Error(result.message);
      }
      
      console.log('[gameDataService] Cache initialized via cloud function');
    } catch (error) {
      console.error('[gameDataService] Error initializing cache:', error);
      throw error;
    }
  },

  async fetchFromFirebase(category: string): Promise<GameData[]> {
    const currentMonth = this.getCurrentMonth();
    const monthlyCollection = collection(db, 'game-rankings', category, 'monthly');
    const rankingsDoc = await getDoc(doc(monthlyCollection, currentMonth));

    if (rankingsDoc.exists()) {
      const data = rankingsDoc.data() as FirebaseGameCache;
      return data.games;
    }

    // If Firebase cache miss, fall back to CSV
    console.log('[gameDataService] Firebase cache miss, falling back to CSV');
    return this.fetchFromCSV(category);
  },

  async fetchFromCSV(category: string): Promise<GameData[]> {
    console.log('[gameDataService] Fetching from CSV');
    const response = await fetch('/boardgameranks6.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const games = this.parseCSV(csvText);
    return Object.values(games)
      .filter(game => game.rank[category as keyof GameData['rank']] !== null)
      .sort((a, b) => {
        const rankA = a.rank[category as keyof GameData['rank']] || Infinity;
        const rankB = b.rank[category as keyof GameData['rank']] || Infinity;
        return rankA - rankB;
      });
  },

  parseCSV(csvText: string): { [key: string]: GameData } {
    console.log('[gameDataService] Starting CSV parsing');
    try {
      const lines = csvText.split('\n');
      console.log(`[gameDataService] Processing ${lines.length} lines from CSV`);
      
      const headers = lines[0].split(',');
      const games: { [key: string]: GameData } = {};

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) {
          console.warn(`[gameDataService] Skipping line ${i}: insufficient values`);
          continue;
        }

        const game: GameData = {
          id: values[0],
          name: values[1],
          rank: {
            abstracts: values[2] ? parseInt(values[2]) : null,
            cgs: values[3] ? parseInt(values[3]) : null,
            childrens: values[4] ? parseInt(values[4]) : null,
            family: values[5] ? parseInt(values[5]) : null,
            party: values[6] ? parseInt(values[6]) : null,
            strategy: values[7] ? parseInt(values[7]) : null,
            thematic: values[8] ? parseInt(values[8]) : null,
            wargames: values[9] ? parseInt(values[9]) : null
          }
        };

        games[game.id] = game;
      }

      console.log(`[gameDataService] Successfully parsed ${Object.keys(games).length} games`);
      return games;
    } catch (error) {
      console.error('[gameDataService] Error parsing CSV:', error);
      throw error;
    }
  },

  async fetchGameDetails(gameId: string): Promise<void> {
    try {
      // Check if game details already exist in Firebase
      const gameDoc = await getDoc(doc(db, 'game-details', gameId));
      if (gameDoc.exists()) {
        return;
      }

      // Fetch from BGG API
      const response = await axios.get(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');
      const item = xmlDoc.querySelector('item');

      if (!item) {
        throw new Error('Invalid BGG API response');
      }

      const gameData: GameData = {
        id: gameId,
        name: item.querySelector('name[type="primary"]')?.getAttribute('value') || '',
        rank: {
          abstracts: null,
          cgs: null,
          childrens: null,
          family: null,
          party: null,
          strategy: null,
          thematic: null,
          wargames: null
        },
        image: item.querySelector('image')?.textContent || '',
        playerCount: {
          min: parseInt(item.querySelector('minplayers')?.getAttribute('value') || '0'),
          max: parseInt(item.querySelector('maxplayers')?.getAttribute('value') || '0')
        },
        playTime: {
          min: parseInt(item.querySelector('minplaytime')?.getAttribute('value') || '0'),
          max: parseInt(item.querySelector('maxplaytime')?.getAttribute('value') || '0')
        },
        description: item.querySelector('description')?.textContent || undefined
      };

      // Store in Firebase
      await setDoc(doc(db, 'game-details', gameId), {
        gameData,
        metadata: {
          lastUpdated: Date.now(),
          lastAccessed: Date.now(),
          usageCount: 1,
          source: 'bgg-api'
        }
      });
    } catch (error) {
      console.error(`Failed to fetch details for game ${gameId}:`, error);
      throw error;
    }
  },

  async getTopGamesForCategory(category: keyof GameData['rank'], limit: number = 20): Promise<GameData[]> {
    console.log(`[gameDataService] Getting top ${limit} games for category: ${category}`);
    
    try {
      // Check local cache first
      if (localGameCache.has(category)) {
        console.log('[gameDataService] Found in local cache');
        return localGameCache.get(category)!.slice(0, limit);
      }

      // Fetch from Firebase
      const games = await this.fetchFromFirebase(category);
      
      // Update local cache
      localGameCache.set(category, games);
      
      console.log(`[gameDataService] Returning top ${Math.min(games.length, limit)} games for ${category}`);
      return games.slice(0, limit);
    } catch (error) {
      console.error(`[gameDataService] Error fetching games for ${category}:`, error);
      throw error;
    }
  },

  async getGameById(id: string): Promise<GameData | undefined> {
    try {
      const gameDoc = await getDoc(doc(db, 'game-details', id));
      if (gameDoc.exists()) {
        return gameDoc.data()?.gameData as GameData;
      }
      return undefined;
    } catch (error) {
      console.error(`[gameDataService] Error fetching game ${id}:`, error);
      throw error;
    }
  },

  getCurrentMonth(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
};

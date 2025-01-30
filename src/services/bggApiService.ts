import { db } from '../config/firebase';
import { 
  collection, 
  doc,
  getDoc,
  setDoc,
  runTransaction,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import axios from 'axios';
import { GameData } from '../types/boardgame';

interface CacheMetadata {
  lastUpdated: number;
  lastAccessed: number;
  usageCount: number;
  source: 'bgg-api' | 'csv' | 'ai-vision';
  detectionConfidence?: number;
}

export class BggApiService {
  private static instance: BggApiService;
  private readonly CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly RANKINGS_COLLECTION = 'game-rankings';
  private readonly DETAILS_COLLECTION = 'game-details';

  private constructor() {}

  static getInstance(): BggApiService {
    if (!BggApiService.instance) {
      BggApiService.instance = new BggApiService();
    }
    return BggApiService.instance;
  }

  async fetchGameDetails(gameId: string): Promise<GameData> {
    const cachedGame = await this.checkGameCache(gameId);
    if (cachedGame) {
      await this.incrementUsageCount(gameId);
      return cachedGame;
    }

    try {
      const response = await axios.get(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`);
      const gameData = this.parseGameResponse(response.data);
      await this.cacheGameDetails(gameId, gameData, 'bgg-api');
      return gameData;
    } catch (error) {
      console.error(`Failed to fetch game details for ${gameId}:`, error);
      throw error;
    }
  }

  async fetchCategoryRankings(category: string): Promise<GameData[]> {
    const currentMonth = this.getCurrentMonth();
    const monthlyCollection = collection(db, this.RANKINGS_COLLECTION, category, 'monthly');
    const rankingsRef = doc(monthlyCollection, currentMonth);
    const rankingsDoc = await getDoc(rankingsRef);
    if (rankingsDoc.exists()) {
      const data = rankingsDoc.data();
      if (data && this.isCacheValid(data.lastUpdated as number)) {
        return data.games;
      }
    }

    // If cache miss or invalid, fetch new rankings
    const rankings = await this.fetchRankingsFromBgg(category);
    await this.cacheRankings(category, rankings);
    return rankings;
  }

  private async checkGameCache(gameId: string): Promise<GameData | null> {
    const gameRef = doc(db, this.DETAILS_COLLECTION, gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
      const data = gameDoc.data();
      if (data && this.isCacheValid(data.metadata.lastUpdated as number)) {
        return data.gameData as GameData;
      }
    }
    return null;
  }

  private async cacheGameDetails(
    gameId: string, 
    gameData: GameData, 
    source: CacheMetadata['source'],
    confidence?: number
  ): Promise<void> {
    const metadata: CacheMetadata = {
      lastUpdated: Date.now(),
      lastAccessed: Date.now(),
      usageCount: 1,
      source,
      ...(confidence && { detectionConfidence: confidence })
    };

    await setDoc(
      doc(db, this.DETAILS_COLLECTION, gameId),
      {
        gameData,
        metadata
      });
  }

  private async cacheRankings(category: string, games: GameData[]): Promise<void> {
    const currentMonth = this.getCurrentMonth();
    const monthlyCollection = collection(db, this.RANKINGS_COLLECTION, category, 'monthly');
    await setDoc(
      doc(monthlyCollection, currentMonth),
      {
        games,
        lastUpdated: Date.now(),
        source: 'bgg-api'
      });
  }

  private async incrementUsageCount(gameId: string): Promise<void> {
    const gameRef = doc(db, this.DETAILS_COLLECTION, gameId);
    await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      if (gameDoc.exists()) {
        const data = gameDoc.data();
        if (data) {
          transaction.update(gameRef, {
            'metadata.usageCount': (data.metadata.usageCount || 0) + 1,
            'metadata.lastAccessed': Date.now()
          });
        }
      }
    });
  }

  private parseGameResponse(xmlData: string): GameData {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    const item = xmlDoc.querySelector('item');
    
    if (!item) {
      throw new Error('Invalid BGG API response');
    }

    return {
      id: item.getAttribute('id') || '',
      name: item.querySelector('name[type="primary"]')?.getAttribute('value') || '',
      rank: {
        abstracts: this.parseRanking(xmlDoc, 'abstracts'),
        cgs: this.parseRanking(xmlDoc, 'cgs'),
        childrens: this.parseRanking(xmlDoc, 'childrens'),
        family: this.parseRanking(xmlDoc, 'family'),
        party: this.parseRanking(xmlDoc, 'party'),
        strategy: this.parseRanking(xmlDoc, 'strategy'),
        thematic: this.parseRanking(xmlDoc, 'thematic'),
        wargames: this.parseRanking(xmlDoc, 'wargames')
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
      description: this.decodeHtmlEntities(item.querySelector('description')?.textContent || '') || undefined
    };
  }

  private parseRanking(xmlDoc: Document, category: string): number | null {
    const rankElement = xmlDoc.querySelector(`rank[friendlyname="${category}"]`);
    const value = rankElement?.getAttribute('value');
    return value && value !== 'Not Ranked' ? parseInt(value) : null;
  }

  private async fetchRankingsFromBgg(category: string): Promise<GameData[]> {
    try {
      // First get the top 100 games in the category
      const response = await axios.get(
        `https://boardgamegeek.com/xmlapi2/search?query=${category}&type=boardgame&exact=0`
      );
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      // Get details for each game
      const gamePromises = Array.from(items)
        .slice(0, 50) // Limit to top 50 to avoid rate limiting
        .map(item => {
          const id = item.getAttribute('id');
          if (!id) return null;
          return this.fetchGameDetails(id);
        })
        .filter((p): p is Promise<GameData> => p !== null);

      const games = await Promise.all(gamePromises);
      
      // Sort by rank in the specific category
      return games
        .filter(game => game.rank[category as keyof typeof game.rank] !== null)
        .sort((a, b) => {
          const rankA = a.rank[category as keyof typeof a.rank] || Infinity;
          const rankB = b.rank[category as keyof typeof b.rank] || Infinity;
          return rankA - rankB;
        });
    } catch (error) {
      console.error(`Failed to fetch rankings for ${category}:`, error);
      throw error;
    }
  }

  private getCurrentMonth(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }
}

export const bggApiService = BggApiService.getInstance();

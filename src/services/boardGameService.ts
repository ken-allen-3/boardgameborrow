import { BOARD_GAME_API } from '../config/constants';
import { BoardGame } from '../types/boardgame';
import { makeApiRequest } from './apiService';

import { logError, createAppError, AppError } from '../utils/errorUtils';
import { measurePerformance, trackCacheOperation } from '../utils/performanceUtils';

// Cache configuration
const CACHE_VERSION = '1.0';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100; // Maximum number of games to cache

interface CacheEntry<T> {
  version: string;
  timestamp: number;
  data: T;
}

class PersistentCache<T> {
  private readonly key: string;
  private cache: Map<string, CacheEntry<T>>;

  constructor(key: string) {
    this.key = key;
    this.cache = new Map();
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error(`Error loading cache ${this.key}:`, error);
      this.cache = new Map();
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving cache ${this.key}:`, error);
    }
  }

  get(key: string, cacheName: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      trackCacheOperation(cacheName, 'miss', { key });
      return null;
    }

    // Check version and TTL
    if (entry.version !== CACHE_VERSION || 
        Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      this.saveToStorage();
      trackCacheOperation(cacheName, 'evict', { key, reason: 'expired' });
      return null;
    }

    trackCacheOperation(cacheName, 'hit', { key });
    return entry.data;
  }

  set(key: string, data: T, cacheName: string) {
    // Enforce cache size limit
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      const oldestEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, Math.ceil(MAX_CACHE_SIZE * 0.2)); // Remove 20% of oldest entries

      oldestEntries.forEach(([key]) => {
        this.cache.delete(key);
        trackCacheOperation(cacheName, 'evict', { key, reason: 'size_limit' });
      });
    }

    trackCacheOperation(cacheName, 'set', { key });
    this.cache.set(key, {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data
    });
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    this.saveToStorage();
  }
}

// Initialize caches
const searchCache = new PersistentCache<BoardGame[]>('bgb-search-cache');
const gameCache = new PersistentCache<BoardGame>('bgb-game-cache');
const popularGamesCache = new PersistentCache<BoardGame[]>('bgb-popular-cache');

const BATCH_SIZE = 10;
const POPULAR_GAMES_IDS = [
  '174430', // Gloomhaven
  '161936', // Pandemic Legacy: Season 1
  '167791', // Terraforming Mars
  '266192', // Spirit Island
  '342942', // Ark Nova
  '233078', // Wingspan
  '224517', // Brass Birmingham
  '291457', // Gloomhaven: Jaws of the Lion
  '162886', // Viticulture
  '220308'  // Root
];

const BATCH_DELAY = 1000; // 1 second delay between batches

interface SearchResults {
  items: BoardGame[];
  hasMore: boolean;
}

async function parseXML(text: string): Promise<Document> {
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/xml');
}

async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  batchSize = BATCH_SIZE,
  delay = BATCH_DELAY
): Promise<any[]> {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults.filter(Boolean));
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

export async function getGameById(id: string): Promise<BoardGame> {
  return measurePerformance('get-game-details', async () => {
    // Check cache first
    const cachedGame = gameCache.get(id, 'game-details');
    if (cachedGame) {
      console.log('[BGG] Returning cached game details:', id);
      return cachedGame;
    }

    try {
      const xmlText = await makeApiRequest(BOARD_GAME_API.THING_ENDPOINT, {
        id,
        stats: '1',
        versions: '0'  // Exclude version info to reduce response size
      });
      
      const doc = await parseXML(xmlText);
      const item = doc.querySelector('item');

      if (!item) {
        throw createAppError('Game not found', 'NOT_FOUND_ERROR', { id });
      }

      const name = item.querySelector('name[type="primary"]')?.getAttribute('value') || '';
      const yearPublished = item.querySelector('yearpublished')?.getAttribute('value');
      const image = item.querySelector('image')?.textContent || '/board-game-placeholder.png';
      const thumbnail = item.querySelector('thumbnail')?.textContent || '/board-game-placeholder.png';
      const description = item.querySelector('description')?.textContent || '';
      const minPlayers = item.querySelector('minplayers')?.getAttribute('value');
      const maxPlayers = item.querySelector('maxplayers')?.getAttribute('value');
      const minPlaytime = item.querySelector('minplaytime')?.getAttribute('value');
      const maxPlaytime = item.querySelector('maxplaytime')?.getAttribute('value');
      const minAge = item.querySelector('minage')?.getAttribute('value');
      
      // Get ranking information
      const rankNode = item.querySelector('rank[type="subtype"][name="boardgame"]');
      const rank = rankNode?.getAttribute('value');
      const numericRank = rank && rank !== 'Not Ranked' ? parseInt(rank) : 0;

      // Get rating information
      const ratingNode = item.querySelector('ratings average');
      const rating = ratingNode?.getAttribute('value');
      const numericRating = rating ? parseFloat(rating) : 0;

      const game: BoardGame = {
        id,
        name,
        year_published: yearPublished ? parseInt(yearPublished) : 0,
        min_players: minPlayers ? parseInt(minPlayers) : 1,
        min_age: minAge ? parseInt(minAge) : 0,
        max_players: maxPlayers ? parseInt(maxPlayers) : 4,
        min_playtime: minPlaytime ? parseInt(minPlaytime) : 0,
        max_playtime: maxPlaytime ? parseInt(maxPlaytime) : 0,
        thumb_url: thumbnail,
        image_url: image,
        description,
        rank: numericRank,
        average_user_rating: numericRating,
        mechanics: [],
        categories: [],
        publishers: [],
        designers: [],
        developers: [],
        artists: [],
        names: [],
        num_user_ratings: 0,
        historical_low_prices: [],
        primary_publisher: { id: "", score: 0, url: "" },
        primary_designer: { id: "", score: 0, url: "" },
        related_to: [],
        related_as: [],
        weight_amount: 0,
        weight_units: "",
        size_height: 0,
        size_depth: 0,
        size_units: "",
        active: true,
        num_user_complexity_votes: 0,
        average_learning_complexity: 0,
        average_strategy_complexity: 0,
        visits: 0,
        lists: 0,
        mentions: 0,
        links: 0,
        plays: 0,
        type: "boardgame",
        sku: "",
        upc: "",
        price: "",
        price_ca: "",
        price_uk: "",
        price_au: "",
        msrp: 0,
        discount: "",
        handle: "",
        url: `https://boardgamegeek.com/boardgame/${id}`,
        rules_url: "",
        official_url: "",
        commentary: "",
        faq: ""
      };

      gameCache.set(id, game, 'game-details');
      return game;
    } catch (error: any) {
      const appError = new Error('Error fetching game details') as AppError;
      appError.name = 'AppError';
      appError.code = 'GAME_FETCH_ERROR';
      appError.context = {
        id,
        error: error.message,
        originalError: error
      };
      logError(appError);
      throw createAppError('Failed to fetch game details', 'GAME_FETCH_ERROR', { id });
    }
  });
}

export async function getPopularGames(): Promise<BoardGame[]> {
  return measurePerformance('get-popular-games', async () => {
    const cached = popularGamesCache.get('popular', 'popular-games');
    if (cached) {
      return cached;
    }

    try {
      const games = await processBatch(
        POPULAR_GAMES_IDS,
        id => getGameById(id)
      );
      
      // Sort by rank
      const sortedGames = games.sort((a, b) => (a.rank || 999999) - (b.rank || 999999));
      popularGamesCache.set('popular', sortedGames, 'popular-games');
      
      return sortedGames;
    } catch (error) {
      console.error('Failed to fetch popular games:', error);
      return [];
    }
  });
}

export async function searchGames(query: string, page: number = 1): Promise<SearchResults> {
  return measurePerformance('search-games', async () => {
    // Check cache first
    const cacheKey = `${query.toLowerCase()}-${page}`;
    const cachedSearch = searchCache.get(cacheKey, 'search-results');
    if (cachedSearch) {
      return {
        items: cachedSearch,
        hasMore: page < 3 // Limit to 3 pages total
      };
    }

    try {
      // Try exact match first
      const xmlText = await makeApiRequest(BOARD_GAME_API.SEARCH_ENDPOINT, {
      query,
      type: 'boardgame',
      exact: '1'
    });
    
    const doc = await parseXML(xmlText);
    const items = Array.from(doc.getElementsByTagName('item'));
    const gameIds = items
      .map(item => item.getAttribute('id'))
      .filter((id): id is string => typeof id === 'string');
    
    // If no exact matches found, try regular search
    if (gameIds.length === 0) {
      const regularXmlText = await makeApiRequest(BOARD_GAME_API.SEARCH_ENDPOINT, {
        query,
        type: 'boardgame'
      });
      
      const regularDoc = await parseXML(regularXmlText);
      const regularItems = Array.from(regularDoc.getElementsByTagName('item'));
      gameIds.push(...regularItems
        .map(item => item.getAttribute('id'))
        .filter((id): id is string => typeof id === 'string')
      );
    }
    
    if (gameIds.length === 0) {
      return { items: [], hasMore: false };
    }
    
    // Process game IDs in batches to avoid rate limiting
    const games = await processBatch(
      gameIds,
      id => getGameById(id)
    );
    
    // Sort results with exact matches first
    const exactMatches = new RegExp(`^${query}$`, 'i');
    const sortedGames = games.sort((a, b) => {
      // Exact matches first
      const aExact = exactMatches.test(a.name);
      const bExact = exactMatches.test(b.name);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by rank (unranked at end)
      if (a.rank !== 0 && b.rank !== 0) return a.rank - b.rank;
      if (a.rank === 0 && b.rank !== 0) return 1;
      if (a.rank !== 0 && b.rank === 0) return -1;
      
      // Then by rating
      if (a.average_user_rating !== b.average_user_rating) {
        return b.average_user_rating - a.average_user_rating;
      }
      
      // Finally alphabetically
      return a.name.localeCompare(b.name);
    });
    
    // Paginate the sorted results
    const startIdx = (page - 1) * 10;
    const endIdx = startIdx + 10;
    const pageResults = sortedGames.slice(startIdx, endIdx);
    
    // Cache the page results
    searchCache.set(cacheKey, pageResults, 'search-results');
    
    // Cache individual games for faster retrieval
    pageResults.forEach(game => {
      gameCache.set(game.id, game, 'game-details');
    });
    
    return {
      items: pageResults,
      hasMore: endIdx < sortedGames.length
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while searching games';
    const appError = new Error('Error searching games') as AppError;
    appError.name = 'AppError';
    appError.code = 'SEARCH_ERROR';
    appError.context = {
      error: errorMessage,
      query
    };
    logError(appError);
    
      throw createAppError(
        'An error occurred while fetching game data. Please try again.',
        'SEARCH_ERROR',
        { query }
      );
    }
  });
}

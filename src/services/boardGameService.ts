import { BOARD_GAME_API } from '../config/constants';
import { BoardGame } from '../types/boardgame';
import { makeApiRequest } from './apiService';

import { logError, createAppError } from '../utils/errorUtils';

// Cache for storing game search results
const searchCache = new Map<string, BoardGame[]>();
const gameCache = new Map<string, BoardGame>();

const BATCH_SIZE = 10;
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

export async function searchGames(query: string, page: number = 1): Promise<SearchResults> {
  // Check cache first
  const cacheKey = `${query.toLowerCase()}-${page}`;
  if (searchCache.has(cacheKey)) {
    return {
      items: searchCache.get(cacheKey)!,
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
    const gameIds = items.map(item => item.getAttribute('id')).filter(Boolean);
    
    // If no exact matches found, try regular search
    if (gameIds.length === 0) {
      const regularXmlText = await makeApiRequest(BOARD_GAME_API.SEARCH_ENDPOINT, {
        query,
        type: 'boardgame'
      });
      
      const regularDoc = await parseXML(regularXmlText);
      const regularItems = Array.from(regularDoc.getElementsByTagName('item'));
      gameIds.push(...regularItems.map(item => item.getAttribute('id')).filter(Boolean));
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
    searchCache.set(cacheKey, pageResults);
    
    return {
      items: pageResults,
      hasMore: endIdx < sortedGames.length
    };
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while searching games';
    logError({
      message: 'Error searching games',
      code: 'SEARCH_ERROR',
      context: {
        error: errorMessage,
        query
      }
    });
    
    throw createAppError(
      'An error occurred while fetching game data. Please try again.',
      'SEARCH_ERROR',
      { query }
    );
  }
}

export async function getGameById(id: string): Promise<BoardGame> {
  // Check cache first
  if (gameCache.has(id)) {
    console.log('[BGG] Returning cached game details:', id);
    return gameCache.get(id)!;
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
      year_published: yearPublished ? parseInt(yearPublished) : undefined,
      min_players: minPlayers ? parseInt(minPlayers) : 1,
      max_players: maxPlayers ? parseInt(maxPlayers) : 4,
      min_playtime: minPlaytime ? parseInt(minPlaytime) : undefined,
      max_playtime: maxPlaytime ? parseInt(maxPlaytime) : undefined,
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

    gameCache.set(id, game);
    return game;
  } catch (error: any) {
    logError({
      message: 'Error fetching game details',
      code: 'GAME_FETCH_ERROR',
      context: {
        id,
        error: error.message,
        originalError: error
      }
    });
    throw createAppError('Failed to fetch game details', 'GAME_FETCH_ERROR', { id });
  }
}
import axios from 'axios';

export interface GameData {
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

interface CachedGameData {
  games: { [key: string]: GameData };
  lastUpdated: number;
}

const CACHE_KEY = 'bgb_game_cache';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

let gameCache: CachedGameData = {
  games: {},
  lastUpdated: 0
};

export const gameDataService = {
  async initializeCache() {
    console.log('[gameDataService] Initializing cache');
    try {
      // Try to load existing cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        console.log('[gameDataService] Found existing cache');
        const parsedCache = JSON.parse(cached);
        if (Date.now() - parsedCache.lastUpdated < CACHE_DURATION) {
          console.log('[gameDataService] Cache is still valid, using cached data');
          gameCache = parsedCache;
          return;
        }
        console.log('[gameDataService] Cache expired, refreshing');
      } else {
        console.log('[gameDataService] No cache found, creating new cache');
      }

      // Cache needs refresh - parse CSV
      await this.refreshCache();
    } catch (error) {
      console.error('[gameDataService] Error initializing cache:', error);
      throw error;
    }
  },

  async refreshCache() {
    console.log('[gameDataService] Starting cache refresh');
    try {
      console.log('[gameDataService] Fetching CSV file');
      const response = await fetch('/boardgameranks6.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('[gameDataService] CSV file fetched, parsing data');
      const games = this.parseCSV(csvText);
      console.log(`[gameDataService] Parsed ${Object.keys(games).length} games from CSV`);
      
      // Update cache with basic game data
      gameCache = {
        games,
        lastUpdated: Date.now()
      };

      // Save to localStorage
      console.log('[gameDataService] Saving cache to localStorage');
      localStorage.setItem(CACHE_KEY, JSON.stringify(gameCache));
      console.log('[gameDataService] Cache refresh complete');
    } catch (error) {
      console.error('[gameDataService] Failed to refresh game cache:', error);
      throw error;
    }
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

  // Fetch details only when needed for a specific game
  async fetchGameDetails(gameId: string) {
    try {
      const game = gameCache.games[gameId];
      if (!game) return;

      // Skip if we already have details
      if (game.image || game.playerCount || game.playTime || game.description) {
        return;
      }

      const response = await axios.get(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');

      // Extract image
      const imageElement = xmlDoc.querySelector('image');
      if (imageElement) {
        game.image = imageElement.textContent || undefined;
      }

      // Extract player count
      const minPlayers = xmlDoc.querySelector('minplayers');
      const maxPlayers = xmlDoc.querySelector('maxplayers');
      if (minPlayers && maxPlayers) {
        game.playerCount = {
          min: parseInt(minPlayers.getAttribute('value') || '0'),
          max: parseInt(maxPlayers.getAttribute('value') || '0')
        };
      }

      // Extract play time
      const minTime = xmlDoc.querySelector('minplaytime');
      const maxTime = xmlDoc.querySelector('maxplaytime');
      if (minTime && maxTime) {
        game.playTime = {
          min: parseInt(minTime.getAttribute('value') || '0'),
          max: parseInt(maxTime.getAttribute('value') || '0')
        };
      }

      // Extract description
      const description = xmlDoc.querySelector('description');
      if (description) {
        game.description = description.textContent || undefined;
      }

      // Update localStorage with new details
      localStorage.setItem(CACHE_KEY, JSON.stringify(gameCache));
    } catch (error) {
      console.error(`Failed to fetch details for game ${gameId}:`, error);
    }
  },

  getTopGamesForCategory(category: keyof GameData['rank'], limit: number = 20): GameData[] {
    console.log(`[gameDataService] Getting top ${limit} games for category: ${category}`);
    
    if (!gameCache.games || Object.keys(gameCache.games).length === 0) {
      console.warn('[gameDataService] Cache is empty, returning empty array');
      return [];
    }
    
    const games = Object.values(gameCache.games);
    console.log(`[gameDataService] Found ${games.length} total games in cache`);
    
    const filteredGames = games.filter(game => game.rank[category] !== null);
    console.log(`[gameDataService] ${filteredGames.length} games have rankings for ${category}`);
    
    const sortedGames = filteredGames
      .sort((a, b) => {
        const rankA = a.rank[category] || Infinity;
        const rankB = b.rank[category] || Infinity;
        return rankA - rankB;
      })
      .slice(0, limit);
    
    console.log(`[gameDataService] Returning top ${sortedGames.length} games for ${category}`);
    return sortedGames;
  },

  getGameById(id: string): GameData | undefined {
    return gameCache.games[id];
  }
};

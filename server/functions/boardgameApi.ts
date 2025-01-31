import { Request, Response } from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { logApiEvent } from './cacheService';
import axios from 'axios';

const db = getFirestore();
const BGG_API_BASE = 'https://boardgamegeek.com/xmlapi2';

// CORS headers middleware
const setCorsHeaders = (res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.set('Access-Control-Max-Age', '3600');
};

export const searchGames = async (req: Request, res: Response) => {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    // Check cache first
    const cacheRef = db.collection('game-details')
      .where('searchQuery', '==', query)
      .limit(1);
    
    const cacheSnapshot = await cacheRef.get();
    
    if (!cacheSnapshot.empty) {
      const cachedData = cacheSnapshot.docs[0].data();
      await logApiEvent('cache_hit', { query });
      res.json(cachedData.results);
      return;
    }

    // Cache miss - fetch from BGG API
    await logApiEvent('cache_miss', { query });
    
    const response = await axios.get(`${BGG_API_BASE}/search`, {
      params: {
        query,
        type: 'boardgame',
        exact: 0
      }
    });

    // Parse XML response and transform to our format
    const results = []; // Add XML parsing logic here
    
    // Cache the results
    await db.collection('game-details').add({
      searchQuery: query,
      results,
      timestamp: Date.now()
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search games' });
  }
};

export const getGameDetails = async (req: Request, res: Response) => {
  setCorsHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { gameId } = req.query;
    if (!gameId) {
      res.status(400).json({ error: 'Game ID is required' });
      return;
    }

    // Check cache first
    const cacheRef = db.collection('game-details').doc(gameId.toString());
    const cachedGame = await cacheRef.get();
    
    if (cachedGame.exists) {
      const gameData = cachedGame.data();
      if (!gameData) {
        throw new Error('Cached game data is missing');
      }
      
      await logApiEvent('cache_hit', { gameId });
      
      // Update access metadata
      await cacheRef.update({
        'metadata.lastAccessed': Date.now(),
        'metadata.usageCount': (gameData.metadata?.usageCount || 0) + 1
      });
      
      res.json(gameData.gameData);
      return;
    }

    // Cache miss - fetch from BGG API
    await logApiEvent('cache_miss', { gameId });
    
    const response = await axios.get(`${BGG_API_BASE}/thing`, {
      params: {
        id: gameId,
        stats: 1
      }
    });

    // Parse XML response and transform to our format
    const gameData = {}; // Add XML parsing logic here
    
    // Cache the results
    await cacheRef.set({
      gameData,
      metadata: {
        lastUpdated: Date.now(),
        lastAccessed: Date.now(),
        usageCount: 1,
        source: 'bgg-api'
      }
    });

    res.json(gameData);
  } catch (error) {
    console.error('Game details error:', error);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
};

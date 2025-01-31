import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import { GameDetectionService } from '../services/gameDetection';
import { logApiEvent, calculateCacheHitRate, calculateMemoryUsage, getLastRefreshDate, initializeCacheData } from './cacheService';
import { searchGames, getGameDetails } from './boardgameApi';

// CORS middleware
const setCorsHeaders = (res: functions.Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.set('Access-Control-Max-Age', '3600');
};

// Handle CORS preflight requests
const handleCors = (req: functions.Request, res: functions.Response) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
};

// Initialize Firebase Admin
initializeApp();

// Initialize Firestore
export const db = getFirestore();

// Initialize services
const gameDetectionService = new GameDetectionService();

// Log function initialization
logApiEvent('function_init', { timestamp: Date.now() });

// Cache metrics endpoint
export const getCacheMetrics = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB" as const,
    minInstances: 0
  })
  .https.onRequest(async (req, res) => {
    if (handleCors(req, res)) return;

    try {
      const gameDetailsRef = db.collection('game-details');
      const gameRankingsRef = db.collection('game-rankings');

      const [gameDetailsSnapshot, gameRankingsSnapshot] = await Promise.all([
        gameDetailsRef.get(),
        gameRankingsRef.get()
      ]);

      const metrics = {
        totalCachedGames: gameDetailsSnapshot.size,
        cacheHitRate: await calculateCacheHitRate(),
        memoryUsage: calculateMemoryUsage(gameDetailsSnapshot),
        lastRefreshDate: await getLastRefreshDate()
      };

      res.json(metrics);
    } catch (error) {
      console.error('Error fetching cache metrics:', error);
      res.status(500).json({ error: 'Failed to fetch cache metrics' });
    }
  });

// Initialize cache endpoint
export const initializeCache = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "512MB" as const,
    minInstances: 0
  })
  .https.onRequest(async (req, res) => {
    if (handleCors(req, res)) return;

    try {
      await initializeCacheData();
      res.json({ success: true, message: 'Cache initialized successfully' });
    } catch (error) {
      console.error('Error initializing cache:', error);
      res.status(500).json({ success: false, message: 'Failed to initialize cache' });
    }
  });

// BGG API endpoints
export const bggSearch = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB" as const,
    minInstances: 0
  })
  .https.onRequest(searchGames);

export const bggGameDetails = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB" as const,
    minInstances: 0
  })
  .https.onRequest(getGameDetails);

// Vision API endpoint
export const analyzeImage = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    const annotations = [{
      description: image,
      boundingPoly: null,
      confidence: 1
    }];

    const games = await gameDetectionService.processAnnotations(annotations);
    res.json({ rawResponse: games });
  } catch (error: any) {
    console.error('Vision API Error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message || 'Unknown error'
    });
  }
});

// Scheduled cache cleanup
export const cleanupExpiredCache = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    try {
      // Cleanup game details cache
      const gameDetailsSnapshot = await db
        .collection('game-details')
        .where('metadata.lastAccessed', '<', now - CACHE_TTL)
        .where('metadata.usageCount', '<', 10) // Preserve frequently used games
        .get();

      // Cleanup game rankings cache
      const gameRankingsSnapshot = await db
        .collection('game-rankings')
        .where('lastUpdated', '<', now - CACHE_TTL)
        .get();

      const batch = db.batch();

      // Add game details to batch
      gameDetailsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Add game rankings to batch
      gameRankingsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      logApiEvent('cache_cleanup', {
        gameDetailsRemoved: gameDetailsSnapshot.size,
        gameRankingsRemoved: gameRankingsSnapshot.size,
        timestamp: now
      });
    } catch (error) {
      logApiEvent('cache_cleanup_error', {
        error,
        timestamp: now
      });
    }
  });

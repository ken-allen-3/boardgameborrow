import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import { GameDetectionService } from '../services/gameDetection';
import { logApiEvent, calculateCacheHitRate, calculateMemoryUsage, getLastRefreshDate, initializeCacheData } from './cacheService';
import { searchGames, getGameDetails } from './boardgameApi';

// Diagnostic helper functions
const checkCollection = async (collectionName: string) => {
  try {
    const snapshot = await db.collection(collectionName).count().get();
    return {
      exists: true,
      documentCount: snapshot.data().count,
      lastAccessed: new Date().toISOString()
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const getEnvironmentInfo = () => ({
  region: process.env.FUNCTION_REGION || 'unknown',
  projectId: process.env.GCLOUD_PROJECT || 'unknown',
  functionName: process.env.FUNCTION_NAME || 'unknown',
  environment: process.env.FUNCTIONS_EMULATOR ? 'emulator' : 'production',
  nodeVersion: process.version,
  timestamp: new Date().toISOString()
});

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

// Initialize Firebase Admin with diagnostic logging
const app = initializeApp();
console.log('Firebase Admin initialized with config:', {
  projectId: app.options.projectId,
  databaseURL: app.options.databaseURL,
  storageBucket: app.options.storageBucket
});

// Initialize Firestore
export const db = getFirestore();

// Initialize services
const gameDetectionService = new GameDetectionService();

// Log function initialization with environment info
const envInfo = getEnvironmentInfo();
logApiEvent('function_init', { timestamp: Date.now(), environment: envInfo });

// Diagnostic endpoint
export const diagnoseCacheSystem = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB" as const,
    minInstances: 0
  })
  .https.onRequest(async (req, res) => {
    if (handleCors(req, res)) return;

    try {
      const diagnostics = {
        environment: getEnvironmentInfo(),
        collections: {
          gameDetails: await checkCollection('game-details'),
          gameRankings: await checkCollection('game-rankings'),
          cacheEvents: await checkCollection('cache-events')
        },
        cacheMetrics: {
          hitRate: await calculateCacheHitRate(),
          lastRefresh: await getLastRefreshDate()
        },
        cors: {
          origin: req.headers.origin || 'not provided',
          method: req.method,
          headers: req.headers
        }
      };

      res.json(diagnostics);
    } catch (error) {
      console.error('Diagnostic error:', error);
      res.status(500).json({
        error: 'Diagnostic check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

// Cache metrics endpoint
export const getCacheMetrics = functions
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB" as const,
    minInstances: 0
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    try {
      console.log('Fetching cache metrics...', {
        userId: context.auth.uid,
        timestamp: new Date().toISOString()
      });

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

      console.log('Cache metrics fetched successfully:', metrics);
      return metrics;
    } catch (error) {
      console.error('Error fetching cache metrics:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch cache metrics',
        error
      );
    }
  });

// Initialize cache endpoint
export const initializeCache = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "512MB" as const,
    minInstances: 0
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    try {
      console.log('Initializing cache...', {
        userId: context.auth.uid,
        timestamp: new Date().toISOString()
      });

      await initializeCacheData(context);
      
      console.log('Cache initialized successfully');
      return { success: true, message: 'Cache initialized successfully' };
    } catch (error) {
      console.error('Error initializing cache:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to initialize cache',
        error
      );
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

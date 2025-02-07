import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { https } from 'firebase-functions/v2';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as cors from 'cors';
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

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  timeoutSeconds: 60,
  memory: "256MiB",
  region: "us-central1"
});

// Initialize CORS middleware with specific origin
const corsHandler = cors({ 
  origin: ['http://localhost:5174', 'https://boardgameborrow.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
});

// Initialize Firebase Admin with diagnostic logging
const app = initializeApp();
console.log('Firebase Admin initialized with config:', {
  projectId: app.options.projectId,
  databaseURL: app.options.databaseURL,
  storageBucket: app.options.storageBucket
});

// Initialize Firebase Admin services
export const db = getFirestore();
export const auth = getAuth();

// CORS headers helper
const setCorsHeaders = (res: any) => {
  res.set('Access-Control-Allow-Origin', ['http://localhost:5174', 'https://boardgameborrow.com']);
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.set('Access-Control-Max-Age', '3600');
};

// Initialize services
const gameDetectionService = new GameDetectionService();

// Log function initialization with environment info
const envInfo = getEnvironmentInfo();
logApiEvent('function_init', { timestamp: Date.now(), environment: envInfo });

// Diagnostic endpoint
export const diagnoseCacheSystem = https.onRequest(
  { 
    timeoutSeconds: 60,
    memory: "256MiB",
    minInstances: 0
  },
  async (req, res) => {
    // Use the CORS middleware
    await new Promise((resolve) => corsHandler(req, res, resolve));

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
export const getCacheMetrics = https.onRequest(
  { 
    timeoutSeconds: 60,
    memory: "256MiB",
    minInstances: 0
  },
  async (req, res) => {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Verify auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      // Verify the token
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      console.log('Fetching cache metrics...', {
        userId: decodedToken.uid,
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
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching cache metrics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch metrics',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

// Initialize cache endpoint
export const initializeCache = https.onRequest(
  { 
    timeoutSeconds: 300,
    memory: "512MiB",
    minInstances: 0
  },
  async (req, res) => {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Verify auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      // Verify the token
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      console.log('Initializing cache...', {
        userId: decodedToken.uid,
        timestamp: new Date().toISOString()
      });

      await initializeCacheData({ 
        auth: { 
          uid: decodedToken.uid
        }
      });
      
      console.log('Cache initialized successfully');
      res.json({ success: true, message: 'Cache initialized successfully' });
    } catch (error) {
      console.error('Error initializing cache:', error);
      res.status(500).json({ 
        error: 'Failed to initialize cache',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

// BGG API endpoints
export const bggSearch = https.onRequest(
  { 
    timeoutSeconds: 60,
    memory: "256MiB",
    minInstances: 0
  },
  async (req, res) => {
    await new Promise((resolve) => corsHandler(req, res, resolve));
    return searchGames(req, res);
  }
);

export const bggGameDetails = https.onRequest(
  { 
    timeoutSeconds: 60,
    memory: "256MiB",
    minInstances: 0
  },
  async (req, res) => {
    await new Promise((resolve) => corsHandler(req, res, resolve));
    return getGameDetails(req, res);
  }
);

// Vision API endpoint
export const analyzeImage = https.onRequest(
  { 
    timeoutSeconds: 60,
    memory: "256MiB",
    minInstances: 0
  },
  async (req, res) => {
    await new Promise((resolve) => corsHandler(req, res, resolve));

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
export const cleanupExpiredCache = onSchedule(
  {
    schedule: 'every 24 hours',
    timeoutSeconds: 60,
    memory: "256MiB"
  },
  async () => {
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

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import { GameDetectionService } from '../services/gameDetection';
import { searchGames, getGameDetails } from './boardgameApi';
import { logApiEvent } from './cacheService';

// Initialize Firebase Admin
initializeApp();

// Initialize Firestore
export const db = getFirestore();

// Initialize services
const gameDetectionService = new GameDetectionService();

// Log function initialization
logApiEvent('function_init', { timestamp: Date.now() });

// Export the functions with configuration
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
      const snapshot = await db
        .collection('api-cache')
        .where('timestamp', '<', now - CACHE_TTL)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      logApiEvent('cache_cleanup', {
        entriesRemoved: snapshot.size,
        timestamp: now
      });
    } catch (error) {
      logApiEvent('cache_cleanup_error', {
        error,
        timestamp: now
      });
    }
  });

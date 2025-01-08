import { onRequest, HttpsOptions } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { searchGames, getGameDetails } from './boardgameApi';
import { GameDetectionService } from '../services/gameDetection';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize services
const gameDetectionService = new GameDetectionService();

// Export the functions
export const bggSearch = searchGames;
export const bggGameDetails = getGameDetails;

const functionConfig: HttpsOptions = {
  timeoutSeconds: 60,
  memory: '1GiB',
  region: 'us-central1'
};

// Vision API endpoint
export const analyzeImage = onRequest(functionConfig, async (req, res) => {
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

// Add rate limiting middleware
export const rateLimiter = onRequest({
  timeoutSeconds: 30,
  memory: '256MiB',
  region: 'us-central1'
}, async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const ip = req.ip || req.headers['x-forwarded-for'];
  const key = `ratelimit_${ip}`;
  
  try {
    const doc = await admin.firestore().collection('ratelimits').doc(key).get();
    const now = Date.now();
    const windowSize = 60 * 1000; // 1 minute
    const maxRequests = 30; // 30 requests per minute
    
    let requests = doc.exists ? doc.data()!.requests.filter((time: number) => time > now - windowSize) : [];
    
    if (requests.length >= maxRequests) {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
      return;
    }
    
    requests.push(now);
    await admin.firestore().collection('ratelimits').doc(key).set({ requests });
    
    // Continue to the actual function
    res.status(200).send('Rate limit check passed');
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow the request if rate limiting fails
    res.status(200).send('Rate limit check passed (error fallback)');
  }
});

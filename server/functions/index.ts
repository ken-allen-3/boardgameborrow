import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { searchGames, getGameDetails } from './boardgameApi';

// Initialize Firebase Admin
admin.initializeApp();

// Export the functions
export const bggSearch = searchGames;
export const bggGameDetails = getGameDetails;

// Add rate limiting middleware
export const rateLimiter = functions.runWith({
  timeoutSeconds: 30,
  memory: '256MB'
}).https.onRequest(async (req, res) => {
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
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow the request if rate limiting fails
    return true;
  }
});

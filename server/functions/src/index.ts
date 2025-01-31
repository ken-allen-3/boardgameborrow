import { initializeApp } from 'firebase-admin/app';
import { searchGames, getGameDetails } from './boardgameApi';
import { initializeCache, getCacheMetrics } from './cacheOperations';

// Initialize Firebase Admin
initializeApp();

// Export Cloud Functions
export {
  searchGames,
  getGameDetails,
  initializeCache,
  getCacheMetrics
};

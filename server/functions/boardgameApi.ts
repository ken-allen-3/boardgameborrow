import * as functions from 'firebase-functions';
import * as cors from 'cors';
import axios from 'axios';
import { handleCachedApiRequest } from './cacheService';

const corsHandler = cors({ origin: true });
const BGG_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

export const searchGames = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
      }

      const { query, type = 'boardgame', exact } = request.query;
      
      if (!query) {
        return response.status(400).json({ error: 'Query parameter is required' });
      }

      const xmlData = await handleCachedApiRequest(
        'search',
        { query, type, exact },
        async () => {
          const bggResponse = await axios.get(`${BGG_BASE_URL}/search`, {
            params: { query, type, exact }
          });
          return bggResponse.data;
        }
      );

      response.set('Content-Type', 'application/xml');
      response.send(xmlData);
    } catch (error: any) {
      console.error('BGG API Error:', error);
      response.status(500).json({
        error: 'Failed to fetch data from BoardGameGeek',
        details: error.message
      });
    }
  });
});

export const getGameDetails = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    try {
      if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
      }

      const { id } = request.query;
      
      if (!id) {
        return response.status(400).json({ error: 'Game ID is required' });
      }

      const xmlData = await handleCachedApiRequest(
        'game-details',
        { id, stats: 1, versions: 0 },
        async () => {
          const bggResponse = await axios.get(`${BGG_BASE_URL}/thing`, {
            params: { id, stats: 1, versions: 0 }
          });
          return bggResponse.data;
        }
      );

      response.set('Content-Type', 'application/xml');
      response.send(xmlData);
    } catch (error: any) {
      console.error('BGG API Error:', error);
      response.status(500).json({
        error: 'Failed to fetch game details from BoardGameGeek',
        details: error.message
      });
    }
  });
});

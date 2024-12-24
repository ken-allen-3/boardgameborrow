import * as functions from 'firebase-functions';
import * as cors from 'cors';
import axios from 'axios';

const corsHandler = cors({ origin: true });

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds
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

      // Make request to BGG API
      const bggResponse = await axios.get(`${BGG_BASE_URL}/search`, {
        params: {
          query,
          type,
          exact
        }
      });

      // Set cache headers
      response.set('Cache-Control', `public, max-age=${CACHE_DURATION}`);
      
      // Return the XML response
      response.set('Content-Type', 'application/xml');
      response.send(bggResponse.data);
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

      // Make request to BGG API
      const bggResponse = await axios.get(`${BGG_BASE_URL}/thing`, {
        params: {
          id,
          stats: 1,
          versions: 0
        }
      });

      // Set cache headers
      response.set('Cache-Control', `public, max-age=${CACHE_DURATION}`);
      
      // Return the XML response
      response.set('Content-Type', 'application/xml');
      response.send(bggResponse.data);
    } catch (error: any) {
      console.error('BGG API Error:', error);
      response.status(500).json({
        error: 'Failed to fetch game details from BoardGameGeek',
        details: error.message
      });
    }
  });
});

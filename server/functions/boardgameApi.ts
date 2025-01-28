import { onRequest, HttpsOptions } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';
import * as cors from 'cors';
import axios from 'axios';
import { handleCachedApiRequest, logApiEvent } from './cacheService';

const corsHandler = cors({ origin: true });
const BGG_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

const functionConfig: HttpsOptions = {
  timeoutSeconds: 60,
  memory: '256MiB',
  minInstances: 0
};

// Add timeout to BGG API requests
const BGG_REQUEST_TIMEOUT = 10000; // 10 seconds

export const searchGames = onRequest(functionConfig, async (request: Request, response: Response) => {
  return corsHandler(request, response, async () => {
    const startTime = Date.now();
    try {
      if (request.method !== 'GET') {
        logApiEvent('api_error', { 
          error: 'Method not allowed',
          method: request.method
        });
        return response.status(405).json({ error: 'Method not allowed' });
      }

      const query = request.query.query as string;
      const type = (request.query.type as string) || 'boardgame';
      const exact = request.query.exact as string;
      
      if (!query) {
        logApiEvent('api_error', { 
          error: 'Missing query parameter'
        });
        return response.status(400).json({ error: 'Query parameter is required' });
      }

      const xmlData = await handleCachedApiRequest(
        'search',
        { query, type, exact },
        async () => {
          const bggResponse = await axios.get(`${BGG_BASE_URL}/search`, {
            params: { query, type, exact },
            timeout: BGG_REQUEST_TIMEOUT
          });
          return bggResponse.data;
        }
      );

      response.set('Content-Type', 'application/xml');
      const duration = Date.now() - startTime;
      logApiEvent('api_success', {
        operation: 'searchGames',
        duration,
        query
      });
      response.send(xmlData);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const failedQuery = request.query.query as string;
      logApiEvent('api_error', {
        operation: 'searchGames',
        duration,
        error: error.message,
        query: failedQuery
      });
      console.error('BGG API Error:', error);
      response.status(500).json({
        error: 'Failed to fetch data from BoardGameGeek',
        details: error.message
      });
    }
  });
});

export const getGameDetails = onRequest(functionConfig, async (request: Request, response: Response) => {
  return corsHandler(request, response, async () => {
    const startTime = Date.now();
    try {
      if (request.method !== 'GET') {
        logApiEvent('api_error', { 
          error: 'Method not allowed',
          method: request.method
        });
        return response.status(405).json({ error: 'Method not allowed' });
      }

      const id = request.query.id as string;
      
      if (!id) {
        logApiEvent('api_error', { 
          error: 'Missing game ID'
        });
        return response.status(400).json({ error: 'Game ID is required' });
      }

      const xmlData = await handleCachedApiRequest(
        'game-details',
        { id, stats: 1, versions: 0 },
        async () => {
          const bggResponse = await axios.get(`${BGG_BASE_URL}/thing`, {
            params: { id, stats: 1, versions: 0 },
            timeout: BGG_REQUEST_TIMEOUT
          });
          return bggResponse.data;
        }
      );

      response.set('Content-Type', 'application/xml');
      const duration = Date.now() - startTime;
      logApiEvent('api_success', {
        operation: 'getGameDetails',
        duration,
        gameId: id as string
      });
      response.send(xmlData);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const failedId = request.query.id as string;
      logApiEvent('api_error', {
        operation: 'getGameDetails',
        duration,
        error: error.message,
        gameId: failedId
      });
      console.error('BGG API Error:', error);
      response.status(500).json({
        error: 'Failed to fetch game details from BoardGameGeek',
        details: error.message
      });
    }
  });
});

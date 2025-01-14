import { BoardGame } from '../types/boardgame';
import { searchGames } from './boardGameService';
import { visionClient } from '../config/vision';

const API_URL = import.meta.env.VITE_API_URL;
const CONFIDENCE_THRESHOLD = 0.6; // 60% confidence threshold for automatic inclusion

export interface DetectedGame {
  title: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  status?: 'pending' | 'confirmed' | 'rejected';
  matches?: BoardGame[];
}

export class VisionServiceError extends Error {
  constructor(
    public code: 'VISION_API_ERROR' | 'NETWORK_ERROR' | 'NO_GAMES_DETECTED' | 'LOW_CONFIDENCE' | 'VALIDATION_ERROR',
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VisionServiceError';
  }
}

export async function analyzeShelfImage(base64Image: string): Promise<DetectedGame[]> {
  try {
    // Validate input
    if (!base64Image || typeof base64Image !== 'string') {
      throw createVisionError('VALIDATION_ERROR', 'Invalid image data provided');
    }

    // Use the enhanced visionClient for text detection
    const result = await visionClient.textDetection({
      image: { content: base64Image }
    });
    
    console.log('Vision API Result:', result);
    
    if (!result || !Array.isArray(result) || !result[0] || !result[0].detectedGames) {
      console.error('Invalid result structure:', result);
      throw createVisionError('VISION_API_ERROR', 'Invalid response from Vision API');
    }

    // Filter and process detected games
    const games = result[0].detectedGames
      .map((game: DetectedGame) => ({
        ...game,
        status: game.confidence >= CONFIDENCE_THRESHOLD ? 'pending' : undefined,
      }))
      .sort((a: DetectedGame, b: DetectedGame) => b.confidence - a.confidence); // Sort by confidence

    if (games.length === 0) {
      throw createVisionError('NO_GAMES_DETECTED', 'No games were detected in the image');
    }

    const lowConfidenceGames = games.filter((g: DetectedGame) => g.confidence < CONFIDENCE_THRESHOLD);
    if (lowConfidenceGames.length === games.length) {
      throw createVisionError('LOW_CONFIDENCE', 'All detected games had low confidence scores');
    }

    console.log('Processed Games:', games);
    return games;
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw createVisionError(
        'NETWORK_ERROR',
        `Network Error:\n` +
        `URL: ${API_URL}/analyzeImage\n` +
        `Status: Failed to connect\n` +
        `Details: The request failed to reach the server. This could be due to:\n` +
        `- No internet connection\n` +
        `- Server is down\n` +
        `- CORS configuration issue\n` +
        `- Invalid API URL`
      );
    }
    throw error instanceof VisionServiceError ? error : createVisionError('VISION_API_ERROR', error.message);
  }
}

export async function findMatchingGames(detectedGames: DetectedGame[]): Promise<DetectedGame[]> {
  // Validate input
  if (!Array.isArray(detectedGames)) {
    throw createVisionError('VALIDATION_ERROR', 'Invalid games array provided');
  }

  // Process games in parallel with rate limiting
  const batchSize = 3;
  const processedGames: DetectedGame[] = [];

  for (let i = 0; i < detectedGames.length; i += batchSize) {
    const batch = detectedGames.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (game) => {
        try {
          const { items } = await searchGames(game.title);
          const status: DetectedGame['status'] = 
            game.status || (game.confidence >= CONFIDENCE_THRESHOLD ? 'pending' : undefined);
          
          return {
            ...game,
            matches: items,
            status
          } as DetectedGame;
        } catch (error) {
          console.error(`Error finding matches for ${game.title}:`, error);
          const failedGame: DetectedGame = {
            ...game,
            matches: [],
            status: 'rejected'
          };
          return failedGame;
        }
      })
    );
    
    processedGames.push(...results);

    // Add small delay between batches to avoid rate limiting
    if (i + batchSize < detectedGames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return processedGames;
}

export async function manualGameSearch(query: string): Promise<BoardGame[]> {
  try {
    if (!query || typeof query !== 'string' || query.length < 2) {
      throw createVisionError('VALIDATION_ERROR', 'Search query must be at least 2 characters');
    }

    const { items } = await searchGames(query);
    return items;
  } catch (error: any) {
    throw createVisionError('VISION_API_ERROR', `Manual search failed: ${error.message}`);
  }
}

function createVisionError(
  code: VisionServiceError['code'],
  message: string,
  details?: any
): VisionServiceError {
  return new VisionServiceError(code, message, details);
}

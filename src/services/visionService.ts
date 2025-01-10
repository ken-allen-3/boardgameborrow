import { BoardGame } from '../types/boardgame';
import { searchGames } from './boardGameService';
import { visionClient } from '../config/vision';

const API_URL = import.meta.env.VITE_API_URL;

export interface DetectedGame {
  title: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export async function analyzeShelfImage(base64Image: string): Promise<DetectedGame[]> {
  try {
    // Use the enhanced visionClient instead of direct fetch
    const result = await visionClient.textDetection({
      image: { content: base64Image }
    });
    
    if (!result || !result[0] || !result[0].detectedGames) {
      throw new Error('No results from vision API');
    }

    return result[0].detectedGames;
  } catch (error: any) {
    // Ensure error message contains debug info
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
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
    throw error;
  }
}

export async function findMatchingGames(detectedGames: DetectedGame[]): Promise<Map<string, BoardGame[]>> {
  const matches = new Map<string, BoardGame[]>();
  
  // Process games in parallel with rate limiting
  const batchSize = 3;
  for (let i = 0; i < detectedGames.length; i += batchSize) {
    const batch = detectedGames.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (game) => {
        try {
          const { items } = await searchGames(game.title);
          return { title: game.title, matches: items };
        } catch (error) {
          console.error(`Error finding matches for ${game.title}:`, error);
          return { title: game.title, matches: [] };
        }
      })
    );
    
    results.forEach(({ title, matches: gameMatches }) => {
      matches.set(title, gameMatches);
    });

    // Add small delay between batches to avoid rate limiting
    if (i + batchSize < detectedGames.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return matches;
}

export async function searchGamesByImage(imageUrl: string): Promise<BoardGame[]> {
  // For testing, return mock data instead of making API call
  return Promise.resolve([{
    id: "13",
    name: "Catan",
    year_published: 1995,
    min_players: 3,
    max_players: 4,
    min_playtime: 60,
    max_playtime: 60,
    min_age: 10,
    thumb_url: "https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg",
    image_url: "https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__original/img/A-0yDJkve0avEicYQ4HoNO-HkK8=/0x0/filters:format(jpeg)/pic2419375.jpg",
    description: "Classic game of resource management and trading",
    rank: 374,
    mechanics: [],
    categories: [],
    publishers: [],
    designers: [],
    developers: [],
    artists: [],
    names: [],
    num_user_ratings: 0,
    average_user_rating: 0,
    historical_low_prices: [],
    primary_publisher: { id: "1", score: 0, url: "" },
    primary_designer: { id: "1", score: 0, url: "" },
    related_to: [],
    related_as: [],
    weight_amount: 0,
    weight_units: "",
    size_height: 0,
    size_depth: 0,
    size_units: "",
    active: true,
    num_user_complexity_votes: 0,
    average_learning_complexity: 0,
    average_strategy_complexity: 0,
    visits: 0,
    lists: 0,
    mentions: 0,
    links: 0,
    plays: 0,
    type: "boardgame",
    sku: "",
    upc: "",
    price: "",
    price_ca: "",
    price_uk: "",
    price_au: "",
    msrp: 0,
    discount: "",
    handle: "",
    url: "https://boardgamegeek.com/boardgame/13",
    rules_url: "",
    official_url: "",
    commentary: "",
    faq: ""
  }]);
}

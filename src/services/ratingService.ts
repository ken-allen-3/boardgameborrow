import { getDatabase, ref, set, get } from 'firebase/database';
import { storeRating as storeRatingForRecommendations } from './recommendationService';

export interface GameRating {
  gameId: string;
  rating: number;
  updatedAt: string;
}

export async function rateGame(
  userEmail: string,
  gameId: string,
  rating: number
): Promise<void> {
  if (!userEmail) throw new Error('User email is required');
  if (rating < 0 || rating > 5) throw new Error('Rating must be between 0 and 5');

  const db = getDatabase();
  const userKey = userEmail.replace(/\./g, ',');
  const gamesRef = ref(db, `games/${userKey}`);
  
  try {
    // Get current games array
    const snapshot = await get(gamesRef);
    if (!snapshot.exists()) {
      throw new Error('Game collection not found');
    }

    const games = snapshot.val();
    if (!Array.isArray(games)) {
      throw new Error('Invalid games data structure');
    }

    // Update the rating for the specific game
    const gameIndex = parseInt(gameId);
    if (isNaN(gameIndex) || gameIndex < 0 || gameIndex >= games.length) {
      throw new Error('Invalid game ID');
    }

    // Update the rating directly on the game object
    games[gameIndex] = {
      ...games[gameIndex],
      rating: rating // Store rating directly on the game
    };

    // Save rating to both locations
    await Promise.all([
      // Save to game object for display
      set(gamesRef, games),
      // Save to ratings collection for recommendations
      storeRatingForRecommendations(userEmail, gameId, rating)
    ]);
  } catch (error) {
    console.error('Error rating game:', error);
    throw new Error('Failed to update game rating');
  }
}

export async function getGameRating(
  userEmail: string,
  gameId: string
): Promise<number | null> {
  if (!userEmail) return null;

  const db = getDatabase();
  const userKey = userEmail.replace(/\./g, ',');
  const gamesRef = ref(db, `games/${userKey}`);

  try {
    const snapshot = await get(gamesRef);
    if (!snapshot.exists()) return null;

    const games = snapshot.val();
    if (!Array.isArray(games)) return null;

    const gameIndex = parseInt(gameId);
    if (isNaN(gameIndex) || gameIndex < 0 || gameIndex >= games.length) return null;

    return games[gameIndex]?.rating || 0;
  } catch (error) {
    console.error('Error getting game rating:', error);
    return null;
  }
}

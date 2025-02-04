import { getDatabase, ref, get, set } from 'firebase/database';
import { Game } from './gameService';

interface GameRating {
  gameId: string;
  rating: number;
}

export async function getUserRatings(userEmail: string): Promise<GameRating[]> {
  const db = getDatabase();
  const userKey = userEmail.replace(/\./g, ',');
  const ratingsRef = ref(db, `ratings/${userKey}`);
  
  try {
    const snapshot = await get(ratingsRef);
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val()).map(([gameId, rating]) => ({
      gameId,
      rating: rating as number
    }));
  } catch (error) {
    console.error('Failed to get user ratings:', error);
    return [];
  }
}

export async function getRecommendedGames(
  userEmail: string,
  limit: number = 5
): Promise<Game[]> {
  // Get user's ratings
  const userRatings = await getUserRatings(userEmail);
  
  if (userRatings.length === 0) {
    return []; // Not enough data to make recommendations
  }

  // Get all games from the database
  const db = getDatabase();
  const gamesRef = ref(db, 'games');
  const snapshot = await get(gamesRef);
  
  if (!snapshot.exists()) {
    return [];
  }

  const allGames = snapshot.val();
  const recommendations: Game[] = [];
  
  // TODO: Implement more sophisticated recommendation algorithm
  // For now, just recommend games with similar categories to highly rated games
  
  // Get types of games rated 4 or higher
  const highlyRatedGameIds = userRatings
    .filter(rating => rating.rating >= 4)
    .map(rating => rating.gameId);
    
  const highlyRatedTypes = new Set<string>();
  
  for (const gameId of highlyRatedGameIds) {
    const game = allGames[gameId];
    if (game?.type) {
      highlyRatedTypes.add(game.type);
    }
  }
  
  // Find games of similar types that the user hasn't rated
  const ratedGameIds = new Set(userRatings.map(r => r.gameId));
  
  for (const [gameId, game] of Object.entries(allGames)) {
    const typedGame = game as Game;
    if (
      !ratedGameIds.has(gameId) && // User hasn't rated this game
      typedGame.type && // Game has a type
      highlyRatedTypes.has(typedGame.type) && // Type matches user's interests
      recommendations.length < limit // Haven't reached limit yet
    ) {
      recommendations.push(typedGame);
    }
  }
  
  return recommendations;
}

export async function storeRating(
  userEmail: string,
  gameId: string,
  rating: number
): Promise<void> {
  const db = getDatabase();
  const userKey = userEmail.replace(/\./g, ',');
  const ratingRef = ref(db, `ratings/${userKey}/${gameId}`);
  
  try {
    await set(ratingRef, rating);
  } catch (error) {
    console.error('Failed to store rating:', error);
    throw error;
  }
}

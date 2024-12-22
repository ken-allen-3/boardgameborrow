import { getDatabase, ref, set, get } from 'firebase/database';

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
  const ratingRef = ref(
    db,
    `games/${userEmail.replace(/\./g, ',')}/ratings/${gameId}`
  );

  await set(ratingRef, {
    rating,
    updatedAt: new Date().toISOString()
  });
}

export async function getGameRating(
  userEmail: string,
  gameId: string
): Promise<number | null> {
  if (!userEmail) return null;

  const db = getDatabase();
  const ratingRef = ref(
    db,
    `games/${userEmail.replace(/\./g, ',')}/ratings/${gameId}`
  );

  const snapshot = await get(ratingRef);
  return snapshot.exists() ? snapshot.val().rating : null;
}
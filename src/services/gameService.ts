import { getDatabase, ref, get, set } from 'firebase/database';
import { BoardGame } from '../types/boardgame';
import { seedDataService } from './seedDataService';

export interface Game {
  id: string;
  title: string;
  image: string;
  status: 'available' | 'borrowed';
  borrower?: string;
  rating?: number;
  minPlayers?: number;
  maxPlayers?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  type?: string;
  ratings?: {
    [gameId: string]: {
      rating: number;
      updatedAt: string;
    }
  };
}

export async function loadUserGames(userEmail: string): Promise<Game[]> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  try {
    const db = getDatabase();
    const gamesRef = ref(db, `games/${userEmail.replace(/\./g, ',')}`);
    
    const snapshot = await get(gamesRef);
    if (!snapshot.exists()) {
      return [];
    }

    const gamesData = snapshot.val();

    return Array.isArray(gamesData) ? gamesData.map((game: any, index: number) => ({
      id: index.toString(),
      title: game.title || 'Untitled Game',
      image: game.image || 'https://images.unsplash.com/photo-1606503153255-59d5e417dbf0?auto=format&fit=crop&q=80&w=400',
      status: game.status || 'available',
      borrower: game.borrower,
      rating: game.rating || 0,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      minPlaytime: game.minPlaytime,
      maxPlaytime: game.maxPlaytime,
      type: game.type
    })) : [];
  } catch (err) {
    console.error('Error loading games:', err);
    throw err;
  }
}

export async function addGame(userEmail: string, game: BoardGame): Promise<void> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  if (seedDataService.isSeededContent(game.id)) {
    throw new Error('Cannot add sample content to your collection');
  }

  try {
    const db = getDatabase();
    const gamesRef = ref(db, `games/${userEmail.replace(/\./g, ',')}`);
    
    const snapshot = await get(gamesRef);
    const currentGames = snapshot.exists() ? snapshot.val() : [];
    
    const newGame = {
      title: game.name,
      image: game.image_url || 'https://images.unsplash.com/photo-1606503153255-59d5e417dbf0?auto=format&fit=crop&q=80&w=400',
      status: 'available',
      minPlayers: game.min_players,
      maxPlayers: game.max_players,
      minPlaytime: game.min_playtime,
      maxPlaytime: game.max_playtime,
      type: game.type || 'boardgame',
      ratings: {}
    };

    await set(gamesRef, Array.isArray(currentGames) ? [...currentGames, newGame] : [newGame]);
  } catch (err) {
    console.error('Error adding game:', err);
    throw err;
  }
}

export async function deleteGame(userEmail: string, gameId: string): Promise<void> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  try {
    const db = getDatabase();
    const gamesRef = ref(db, `games/${userEmail.replace(/\./g, ',')}`);
    
    const snapshot = await get(gamesRef);
    if (!snapshot.exists()) {
      return;
    }

    const currentGames = snapshot.val();
    if (!Array.isArray(currentGames)) {
      return;
    }

    const updatedGames = currentGames.filter((_: any, index: number) => index.toString() !== gameId);
    await set(gamesRef, updatedGames);
  } catch (err) {
    console.error('Error deleting game:', err);
    throw err;
  }
}

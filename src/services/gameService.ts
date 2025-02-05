import { getDatabase, ref, get, set } from 'firebase/database';
import { GameData } from '../types/boardgame';
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
  minAge?: number;
  type?: string;
  description?: string;
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
    console.log('Raw games data from Firebase:', gamesData);

    return Array.isArray(gamesData) ? gamesData.map((game: any, index: number) => {
      console.log('Processing game:', {
        index,
        title: game.title,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        minPlaytime: game.minPlaytime,
        maxPlaytime: game.maxPlaytime,
        minAge: game.minAge
      });
      return {
        id: index.toString(),
        title: game.title || 'Untitled Game',
        image: game.image || '/board-game-placeholder.png',
        status: game.status || 'available',
        borrower: game.borrower,
        rating: game.rating || 0,
        minPlayers: game.minPlayers || null,
        maxPlayers: game.maxPlayers || null,
        minPlaytime: game.minPlaytime || null,
        maxPlaytime: game.maxPlaytime || null,
        minAge: game.minAge || null,
        type: game.type,
        description: game.description
      };
    }).reverse() : [];
  } catch (err) {
    console.error('Error loading games:', err);
    throw err;
  }
}

export async function addGame(userEmail: string, game: GameData): Promise<{id: string}> {
  if (!userEmail) {
    throw new Error('User email is required');
  }

  if (seedDataService.isSeededContent(game.id)) {
    throw new Error('Cannot add sample content to your collection');
  }

  // Validate game data
  if (!game.name) {
    console.error('Invalid game data: Missing name', game);
    throw new Error('Game name is required');
  }

  try {
    const db = getDatabase();
    const gamesRef = ref(db, `games/${userEmail.replace(/\./g, ',')}`);
    
    const snapshot = await get(gamesRef);
    const currentGames = snapshot.exists() ? snapshot.val() : [];
    
    console.log('Adding game with data:', {
      id: game.id,
      name: game.name,
      playerCount: game.playerCount,
      playTime: game.playTime,
      age: game.age
    });

    // Validate numeric fields before creating newGame object
    const validateNumber = (value: any): number | undefined => {
      const num = Number(value);
      return !isNaN(num) ? num : undefined;
    };

    const minPlayers = validateNumber(game.playerCount?.min);
    const maxPlayers = validateNumber(game.playerCount?.max);
    const minPlaytime = validateNumber(game.playTime?.min);
    const maxPlaytime = validateNumber(game.playTime?.max);
    const minAge = validateNumber(game.age?.min);

    console.log('Validated numeric values:', {
      minPlayers,
      maxPlayers,
      minPlaytime,
      maxPlaytime,
      minAge
    });

    const newGame = {
      title: game.name,
      image: game.image || '/board-game-placeholder.png',
      status: 'available',
      minPlayers: minPlayers ?? null,
      maxPlayers: maxPlayers ?? null,
      minPlaytime: minPlaytime ?? null,
      maxPlaytime: maxPlaytime ?? null,
      minAge: minAge ?? null,
      type: game.type || 'boardgame',
      description: game.description || '',
      ratings: {}
    };

    console.log('Saving new game to Firebase:', newGame);
    
    // Validate currentGames is an array
    if (!Array.isArray(currentGames)) {
      console.error('Current games is not an array:', currentGames);
      throw new Error('Invalid games data structure');
    }

    const updatedGames = [...currentGames, newGame];
    await set(gamesRef, updatedGames);
    console.log('Game saved successfully');
    return { id: (updatedGames.length - 1).toString() };
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

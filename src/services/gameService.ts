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
  // Log incoming data
  console.log('addGame called with data:', {
    userEmail: userEmail ? 'provided' : 'missing',
    gameId: game?.id,
    gameName: game?.name,
    playerCount: game?.playerCount,
    playTime: game?.playTime,
    age: game?.age
  });

  // Validate user email
  if (!userEmail) {
    console.error('addGame validation failed: Missing user email');
    throw new Error('User email is required');
  }

  // Validate game object
  if (!game) {
    console.error('addGame validation failed: Game object is null or undefined');
    throw new Error('Game data is required');
  }

  if (seedDataService.isSeededContent(game.id)) {
    console.error('addGame validation failed: Attempted to add seeded content', { gameId: game.id });
    throw new Error('Cannot add sample content to your collection');
  }

  // Validate required game data
  if (!game.name) {
    console.error('addGame validation failed: Missing game name', game);
    throw new Error('Game name is required');
  }

  if (!game.id) {
    console.error('addGame validation failed: Missing game ID', game);
    throw new Error('Game ID is required');
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

    // Create the game object with strict type checking
    const newGame = {
      title: game.name,
      image: game.image || '/board-game-placeholder.png',
      status: 'available',
      minPlayers: typeof minPlayers === 'number' ? minPlayers : null,
      maxPlayers: typeof maxPlayers === 'number' ? maxPlayers : null,
      minPlaytime: typeof minPlaytime === 'number' ? minPlaytime : null,
      maxPlaytime: typeof maxPlaytime === 'number' ? maxPlaytime : null,
      minAge: typeof minAge === 'number' ? minAge : null,
      type: game.type || 'boardgame',
      description: game.description || '',
      ratings: {},
      gameId: game.id // Store the original game ID for reference
    };

    console.log('Prepared game data for Firebase:', {
      title: newGame.title,
      minPlayers: newGame.minPlayers,
      maxPlayers: newGame.maxPlayers,
      minPlaytime: newGame.minPlaytime,
      maxPlaytime: newGame.maxPlaytime,
      minAge: newGame.minAge,
      type: newGame.type,
      gameId: newGame.gameId
    });
    
    // Validate currentGames is an array
    if (!Array.isArray(currentGames)) {
      console.error('Current games is not an array:', currentGames);
      throw new Error('Invalid games data structure');
    }

    const updatedGames = [...currentGames, newGame];
    
    try {
      await set(gamesRef, updatedGames);
      console.log('Game saved successfully to Firebase', {
        gameId: game.id,
        arrayIndex: updatedGames.length - 1
      });
      return { id: (updatedGames.length - 1).toString() };
    } catch (err: any) {
      console.error('Firebase set operation failed:', {
        error: err.message,
        code: err.code,
        stack: err.stack,
        gameId: game.id
      });
      throw new Error(`Failed to save game to Firebase: ${err.message}`);
    }
  } catch (err: any) {
    console.error('Error in addGame:', {
      error: err.message,
      code: err.code,
      stack: err.stack,
      gameId: game?.id
    });
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

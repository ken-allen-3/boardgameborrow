import { BoardGame, GameData } from '../types/boardgame';

export function convertBoardGameToGameData(game: BoardGame): GameData {
  // Validate input object
  if (!game) {
    console.error('convertBoardGameToGameData: Input game object is null or undefined');
    throw new Error('Invalid input: game object is required');
  }

  // Log the raw input data with type information
  console.log('Raw BoardGame data:', {
    id: { value: game.id, type: typeof game.id },
    name: { value: game.name, type: typeof game.name },
    min_players: { value: game.min_players, type: typeof game.min_players },
    max_players: { value: game.max_players, type: typeof game.max_players },
    min_playtime: { value: game.min_playtime, type: typeof game.min_playtime },
    max_playtime: { value: game.max_playtime, type: typeof game.max_playtime },
    age: { value: game.age?.min, type: typeof game.age?.min },
    type: { value: game.type, type: typeof game.type }
  });

  // Validate required fields with detailed error messages
  if (!game.id) {
    console.error('convertBoardGameToGameData: Missing game ID');
    throw new Error('Game ID is required');
  }
  if (!game.name) {
    console.error('convertBoardGameToGameData: Missing game name');
    throw new Error('Game name is required');
  }

  // Safe number parsing function
  const parseNumberSafely = (value: any, fieldName: string): number | undefined => {
    if (typeof value === 'number') {
      return isNaN(value) ? undefined : value;
    }
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        console.warn(`convertBoardGameToGameData: Invalid ${fieldName} value:`, value);
        return undefined;
      }
      return parsed;
    }
    if (value === null || value === undefined) {
      console.warn(`convertBoardGameToGameData: ${fieldName} is null or undefined`);
      return undefined;
    }
    console.warn(`convertBoardGameToGameData: Unexpected ${fieldName} type:`, typeof value);
    return undefined;
  };

  // Parse numeric fields with validation
  const min_players = parseNumberSafely(game.min_players, 'min_players');
  const max_players = parseNumberSafely(game.max_players, 'max_players');
  const min_playtime = parseNumberSafely(game.min_playtime, 'min_playtime');
  const max_playtime = parseNumberSafely(game.max_playtime, 'max_playtime');
  const min_age = parseNumberSafely(game.age?.min, 'min_age');

  // Log parsed and validated numeric values
  console.log('Validated numeric values:', {
    min_players: { raw: game.min_players, parsed: min_players, valid: typeof min_players === 'number' },
    max_players: { raw: game.max_players, parsed: max_players, valid: typeof max_players === 'number' },
    min_playtime: { raw: game.min_playtime, parsed: min_playtime, valid: typeof min_playtime === 'number' },
    max_playtime: { raw: game.max_playtime, parsed: max_playtime, valid: typeof max_playtime === 'number' },
    min_age: { raw: game.age?.min, parsed: min_age, valid: typeof min_age === 'number' }
  });

  // Validate player count consistency
  if (min_players !== undefined && max_players !== undefined && min_players > max_players) {
    console.warn('convertBoardGameToGameData: Invalid player count range:', { min_players, max_players });
  }

  // Validate playtime consistency
  if (min_playtime !== undefined && max_playtime !== undefined && min_playtime > max_playtime) {
    console.warn('convertBoardGameToGameData: Invalid playtime range:', { min_playtime, max_playtime });
  }

  const gameData: GameData = {
    id: game.id.trim(),
    name: game.name.trim(),
    rank: {
      abstracts: null,
      cgs: null,
      childrens: null,
      family: null,
      party: null,
      strategy: null,
      thematic: null,
      wargames: null
    },
    image: game.image_url || '/board-game-placeholder.png',
    playerCount: min_players !== undefined || max_players !== undefined ? {
      min: min_players ?? 1, // Default to 1 if undefined
      max: max_players ?? (min_players ?? 4) // Default to min_players or 4 if both undefined
    } : undefined,
    playTime: min_playtime !== undefined || max_playtime !== undefined ? {
      min: min_playtime ?? 0,
      max: max_playtime ?? (min_playtime ?? 30) // Default to min_playtime or 30 if both undefined
    } : undefined,
    age: min_age !== undefined ? {
      min: min_age
    } : undefined,
    description: game.description?.trim() || '',
    type: (game.type || 'boardgame').trim()
  };

  // Log the final transformed data with validation status
  console.log('Transformed GameData:', {
    id: { value: gameData.id, valid: gameData.id.length > 0 },
    name: { value: gameData.name, valid: gameData.name.length > 0 },
    playerCount: { 
      value: gameData.playerCount,
      valid: gameData.playerCount ? 
        gameData.playerCount.min <= gameData.playerCount.max : true
    },
    playTime: {
      value: gameData.playTime,
      valid: gameData.playTime ? 
        gameData.playTime.min <= gameData.playTime.max : true
    },
    age: {
      value: gameData.age,
      valid: gameData.age ? gameData.age.min >= 0 : true
    }
  });

  return gameData;
}

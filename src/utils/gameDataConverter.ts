import { BoardGame, GameData } from '../types/boardgame';

export function convertBoardGameToGameData(game: BoardGame): GameData {
  // Log the raw input data
  console.log('Raw BoardGame data:', {
    id: game.id,
    name: game.name,
    min_players: game.min_players,
    max_players: game.max_players,
    min_playtime: game.min_playtime,
    max_playtime: game.max_playtime,
    age: game.age,
    type: game.type,
    description: game.description?.substring(0, 100) + '...' // Truncate for logging
  });

  // Validate required fields
  if (!game.id || !game.name) {
    console.error('Missing required fields in BoardGame:', { id: game.id, name: game.name });
    throw new Error('Missing required fields in BoardGame data');
  }

  // Validate and transform numeric fields
  const min_players = typeof game.min_players === 'number' ? game.min_players : parseInt(game.min_players as any);
  const max_players = typeof game.max_players === 'number' ? game.max_players : parseInt(game.max_players as any);
  const min_playtime = typeof game.min_playtime === 'number' ? game.min_playtime : parseInt(game.min_playtime as any);
  const max_playtime = typeof game.max_playtime === 'number' ? game.max_playtime : parseInt(game.max_playtime as any);
  const min_age = typeof game.age?.min === 'number' ? game.age.min : parseInt(game.age?.min as any);

  console.log('Parsed numeric values:', {
    min_players: { raw: game.min_players, parsed: min_players },
    max_players: { raw: game.max_players, parsed: max_players },
    min_playtime: { raw: game.min_playtime, parsed: min_playtime },
    max_playtime: { raw: game.max_playtime, parsed: max_playtime },
    min_age: { raw: game.age?.min, parsed: min_age }
  });

  const gameData: GameData = {
    id: game.id,
    name: game.name,
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
    image: game.image_url,
    playerCount: !isNaN(min_players) && !isNaN(max_players) ? {
      min: min_players,
      max: max_players
    } : undefined,
    playTime: !isNaN(min_playtime) && !isNaN(max_playtime) ? {
      min: min_playtime,
      max: max_playtime
    } : undefined,
    age: !isNaN(min_age) ? {
      min: min_age
    } : undefined,
    description: game.description,
    type: game.type
  };

  // Log the final transformed data
  console.log('Transformed GameData:', {
    id: gameData.id,
    name: gameData.name,
    playerCount: gameData.playerCount,
    playTime: gameData.playTime,
    age: gameData.age
  });

  return gameData;
}

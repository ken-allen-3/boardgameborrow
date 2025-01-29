import { BoardGame, GameData } from '../types/boardgame';

export function convertBoardGameToGameData(game: BoardGame): GameData {
  return {
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
    playerCount: {
      min: game.min_players,
      max: game.max_players
    },
    playTime: {
      min: game.min_playtime,
      max: game.max_playtime
    },
    age: {
      min: game.age.min
    },
    description: game.description,
    type: game.type
  };
}

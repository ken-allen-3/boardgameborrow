import React from 'react';
import { Trash2, ImageOff, Users, Clock, Star, Tag } from 'lucide-react';
import { Game } from '../services/gameService';
import StarRating from './StarRating';

interface GameListProps {
  games: Game[];
  onDeleteGame: (gameId: string) => void;
  onRateGame?: (gameId: string, rating: number) => void;
}

const GameList: React.FC<GameListProps> = ({ games, onDeleteGame, onRateGame }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageOff className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No games in your collection yet.</p>
        <p className="text-sm text-gray-500">Add your first game using the button above.</p>
      </div>
    );
  }

  const formatPlaytime = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min === max) return `${min} min`;
    if (!max) return `${min}+ min`;
    if (!min) return `Up to ${max} min`;
    return `${min}-${max} min`;
  };

  const formatPlayers = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min === max) return `${min} players`;
    if (!max) return `${min}+ players`;
    if (!min) return `Up to ${max} players`;
    return `${min}-${max} players`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {games.map((game) => (
        <div key={game.id} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative aspect-square">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/board-game-placeholder.png';
              }}
            />
            <div className="absolute top-2 right-2">
              <button 
                onClick={() => onDeleteGame(game.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
                title="Delete game"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1" title={game.title}>
              {game.title}
            </h3>
            
            <div className="flex flex-wrap gap-3 mb-3">
              {formatPlayers(game.minPlayers, game.maxPlayers) && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{formatPlayers(game.minPlayers, game.maxPlayers)}</span>
                </div>
              )}
              
              {formatPlaytime(game.minPlaytime, game.maxPlaytime) && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatPlaytime(game.minPlaytime, game.maxPlaytime)}</span>
                </div>
              )}
              
              {game.category && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Tag className="h-4 w-4" />
                  <span>{game.category}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <StarRating
                  rating={game.rating || 0}
                  onChange={onRateGame ? (rating) => onRateGame(game.id, rating) : undefined}
                  readonly={!onRateGame}
                  size="sm"
                />
              </div>
              
              <span className={`px-3 py-1 rounded-full text-sm ${
                game.status === 'available' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {game.status === 'available' ? 'Available' : `Borrowed by ${game.borrower}`}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameList;

import React from 'react';
import { X, Users, Clock, Tag } from 'lucide-react';
import StarRating from './StarRating';
import { Game } from '../services/gameService';

interface FullScreenGameCardProps {
  game: Game;
  onClose: () => void;
  onDelete?: (gameId: string) => void;
  onRate?: (gameId: string, rating: number) => void;
}

const FullScreenGameCard: React.FC<FullScreenGameCardProps> = ({
  game,
  onClose,
  onDelete,
  onRate,
}) => {
  console.log('FullScreenGameCard received game:', game);
  console.log('Game description in FullScreenGameCard:', game.description);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="aspect-video w-full">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/board-game-placeholder.png';
              }}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-gray-900">{game.title}</h2>
            {onDelete && (
              <button
                onClick={() => onDelete(game.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove Game
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex flex-col gap-4 mb-6">
                {formatPlayers(game.minPlayers, game.maxPlayers) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span className="text-lg">{formatPlayers(game.minPlayers, game.maxPlayers)}</span>
                  </div>
                )}
                
                {formatPlaytime(game.minPlaytime, game.maxPlaytime) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg">{formatPlaytime(game.minPlaytime, game.maxPlaytime)}</span>
                  </div>
                )}
                
                {game.type && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-5 w-5" />
                    <span className="text-lg">{game.type.replace('boardgame', '').trim() || 'Board Game'}</span>
                  </div>
                )}
              </div>

              {onRate && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Rate this game</h3>
                  <StarRating
                    rating={game.rating || 0}
                    onChange={(rating) => onRate(game.id, rating)}
                    size="lg"
                  />
                </div>
              )}

              {game.status && (
                <div className="mb-6">
                  <span className={`px-4 py-2 rounded-lg text-lg inline-block ${
                    game.status === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {game.status === 'available' ? 'Available' : `Borrowed by ${game.borrower}`}
                  </span>
                </div>
              )}
            </div>

            <div>
              {game.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">About this game</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{game.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenGameCard;

import React, { useState, useEffect } from 'react';
import { X, Users, Clock, Share2, Info, Star, ChevronDown, ChevronUp, Loader, Baby } from 'lucide-react';
import StarRating from './StarRating';
import { Game } from '../services/gameService';

interface FullScreenGameCardProps {
  game: Game;
  onClose: () => void;
  onDelete?: (gameId: string) => void;
  onRate?: (gameId: string, rating: number) => void;
}

const MAX_DESCRIPTION_LENGTH = 300;

const FullScreenGameCard: React.FC<FullScreenGameCardProps> = ({
  game,
  onClose,
  onDelete,
  onRate,
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  useEffect(() => {
    // Reset states when game changes
    setIsImageLoading(true);
    setIsDescriptionExpanded(false);
  }, [game]);

  const shouldTruncateDescription = game.description && game.description.length > MAX_DESCRIPTION_LENGTH;

  const formatPlaytime = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min === max) return `${min} min`;
    if (!max) return `${min}+ min`;
    if (!min) return `Up to ${max} min`;
    return `${min}-${max} min`;
  };

  const formatPlayers = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    if (min === max) return `${min} players`;
    if (!max) return `${min}+ players`;
    if (!min) return `Up to ${max} players`;
    return `${min}-${max} players`;
  };

  const formatAge = (min?: number | null) => {
    if (!min) return null;
    return `Ages ${min}+`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="relative bg-gradient-to-b from-black/40 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all hover:scale-105 z-10"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="aspect-video w-full relative">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            )}
            <img
              src={game.image}
              alt={game.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isImageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setIsImageLoading(false)}
              onError={(e) => {
                setIsImageLoading(false);
                e.currentTarget.src = '/board-game-placeholder.png';
              }}
            />
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6 gap-4">
            <h2 className="text-3xl font-bold text-gray-900">{game.title}</h2>
            <div className="flex gap-3">
              <button
                onClick={() => window.navigator.share?.({ 
                  title: game.title,
                  text: `Check out ${game.title} on BoardGameBorrow!`
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2"
                title="Share game"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(game.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Remove Game
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {game.status && (
                <div className="mb-6">
                  <span className={`px-6 py-3 rounded-lg text-lg inline-flex items-center gap-2 ${
                    game.status === 'available' 
                      ? 'bg-green-100 text-green-800 border-2 border-green-200'
                      : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      game.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    {game.status === 'available' ? 'Available' : `Borrowed by ${game.borrower}`}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-4 mb-6 bg-gray-50 p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
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
                
                {formatAge(game.minAge) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Baby className="h-5 w-5" />
                    <span className="text-lg">{formatAge(game.minAge)}</span>
                  </div>
                )}

              </div>

              {onRate && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Rate to Get Similar Game Recommendations
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Rate your games to help us suggest other games you'll love
                  </p>
                  <div className="group relative">
                    <StarRating
                      rating={game.rating || 0}
                      onChange={(rating) => onRate(game.id, rating)}
                      size="lg"
                    />
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-8 bg-gray-800 text-white text-xs rounded px-2 py-1 w-64">
                      Your ratings help us understand your taste in games to make personalized recommendations
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {game.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    About this game
                  </h3>
                  <div className="relative">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {shouldTruncateDescription && !isDescriptionExpanded
                        ? `${game.description.slice(0, MAX_DESCRIPTION_LENGTH)}...`
                        : game.description}
                    </p>
                    {shouldTruncateDescription && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        aria-label={isDescriptionExpanded ? "Show less" : "Read more"}
                      >
                        {isDescriptionExpanded ? (
                          <>
                            Show less
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Read more
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
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

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, ImageOff, Users, Clock, Baby } from 'lucide-react';
import { Game } from '../services/gameService';
import StarRating from './StarRating';
import FullScreenGameCard from './FullScreenGameCard';

interface GameListProps {
  games: Game[];
  onDeleteGame: (gameId: string) => void;
  onRateGame?: (gameId: string, rating: number) => void;
  mostRecentGameId?: string;
}

const GameList: React.FC<GameListProps> = ({ games, onDeleteGame, onRateGame, mostRecentGameId }) => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const recentGameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mostRecentGameId && recentGameRef.current) {
      recentGameRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, [mostRecentGameId]);

  const handleGameSelect = (game: Game) => {
    console.log('Selected game data:', game);
    console.log('Game description:', game.description);
    setSelectedGame(game);
  };

  const handleDelete = (gameId: string) => {
    setSelectedGame(null); // Close fullscreen view
    onDeleteGame(gameId);
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageOff className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No games in your collection yet.</p>
        <p className="text-sm text-gray-500">Add your first game using the button above.</p>
      </div>
    );
  }

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
    <>
      {selectedGame && (
        <FullScreenGameCard
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onDelete={handleDelete}
          onRate={onRateGame}
        />
      )}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
        {games.map((game) => (
          <div 
            key={game.id} 
            ref={game.id === mostRecentGameId ? recentGameRef : null}
            className="bg-white rounded-xl shadow-md overflow-hidden min-w-[300px] snap-center cursor-pointer"
            onClick={() => handleGameSelect(game)}
          >
            <div className="relative w-full aspect-[4/3]">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(game.id);
                  }}
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
                
                {formatAge(game.minAge) && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Baby className="h-4 w-4" />
                    <span>{formatAge(game.minAge)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <StarRating
                    rating={game.rating || 0}
                    onChange={onRateGame ? (rating) => {
                      onRateGame(game.id, rating);
                    } : undefined}
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
    </>
  );
};

export default GameList;

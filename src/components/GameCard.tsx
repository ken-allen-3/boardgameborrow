import React from 'react';
import { Users } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  image: string;
  owner: {
    email: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  available: boolean;
  minPlayers?: number;
  maxPlayers?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  category?: string;
  distance?: number;
  isFriend?: boolean;
}

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  requestStatus?: string;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect, requestStatus }) => {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/board-game-placeholder.png';
          }}
        />
        {game.isFriend && (
          <div className="absolute top-2 right-2 bg-indigo-100 p-1 rounded-full">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
        )}
        {game.distance && (
          <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-sm">
            {Math.round(game.distance)}km
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1" title={game.title}>
          {game.title}
        </h3>
        <div className="flex items-center gap-2 mb-4">
          {game.owner.photoUrl ? (
            <img
              src={game.owner.photoUrl}
              alt={`${game.owner.firstName} ${game.owner.lastName}`}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600">
              {game.owner.firstName[0]}
            </div>
          )}
          <p className="text-gray-600 line-clamp-1">
            {game.owner.firstName} {game.owner.lastName}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
          {game.category && (
            <span className="bg-gray-100 px-2 py-1 rounded-lg">{game.category}</span>
          )}
          {formatPlayers(game.minPlayers, game.maxPlayers) && (
            <span className="bg-gray-100 px-2 py-1 rounded-lg">
              {formatPlayers(game.minPlayers, game.maxPlayers)}
            </span>
          )}
          {formatPlaytime(game.minPlaytime, game.maxPlaytime) && (
            <span className="bg-gray-100 px-2 py-1 rounded-lg">
              {formatPlaytime(game.minPlaytime, game.maxPlaytime)}
            </span>
          )}
        </div>
        
        {requestStatus ? (
          <div className={`text-center py-2 rounded-lg ${
            requestStatus === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : requestStatus === 'approved'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            Request {requestStatus}
          </div>
        ) : (
          <button
            onClick={() => onSelect(game)}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Request to Borrow
          </button>
        )}
      </div>
    </div>
  );
};

export default GameCard;

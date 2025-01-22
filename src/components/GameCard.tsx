import React from 'react';
import { Users, Clock, Tag } from 'lucide-react';
import { SampleContentTag } from './SampleContentTag';

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
  isDemo?: boolean;
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden min-w-[300px] snap-center">
      <div className="relative w-full aspect-[4/3]">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `/board-game-placeholder-${(Math.floor(Math.random() * 4) + 1)}.webp`;
          }}
        />
        {game.isDemo ? (
          <SampleContentTag />
        ) : game.isFriend && (
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
        <div className="flex items-center gap-2 mb-3">
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
            onClick={() => !game.isDemo && onSelect(game)}
            className={`w-full px-4 py-2 rounded-lg transition ${
              game.isDemo 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            disabled={game.isDemo}
            title={game.isDemo ? "Sample games cannot be borrowed" : undefined}
          >
            {game.isDemo ? "Sample Game" : "Request to Borrow"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GameCard;

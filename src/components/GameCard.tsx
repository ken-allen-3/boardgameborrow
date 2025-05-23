import React, { useState } from 'react';
import { Users, Clock, ChevronDown, ChevronUp, Baby } from 'lucide-react';
import { SampleContentTag } from './SampleContentTag';
import { Game as ServiceGame } from '../services/gameService';
import FullScreenGameCard from './FullScreenGameCard';

export interface Game extends Omit<ServiceGame, 'status'> {
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
  category?: string;
  distance?: number;
  isFriend: boolean;
  isDemo?: boolean;
}

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  requestStatus?: string;
  onSendFriendRequest?: (toUserEmail: string) => void;
}

const GameCard = ({ game, onSelect, requestStatus, onSendFriendRequest }: GameCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  const formatAge = (min?: number) => {
    if (!min) return null;
    return `Ages ${min}+`;
  };

  const gameForFullScreen: ServiceGame = {
    ...game,
    status: 'available'
  };

  return (
    <>
      {isFullScreen && (
        <FullScreenGameCard
          game={gameForFullScreen}
          onClose={() => setIsFullScreen(false)}
        />
      )}
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden min-w-[300px] snap-center cursor-pointer" 
        onClick={() => setIsFullScreen(true)}
      >
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
          ) : game.isFriend ? (
            <div className="absolute top-2 right-2 bg-indigo-100 p-1 rounded-full">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
          ) : (
            // Overlay banner for non-friend games
            <div className="absolute top-2 left-2 right-2 bg-blue-100 px-2 py-1 rounded text-xs text-blue-800 font-medium text-center">
              👥 Add {game.owner.firstName} to borrow this game!
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
            {formatAge(game.minAge) && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Baby className="h-4 w-4" />
                <span>{formatAge(game.minAge)}</span>
              </div>
            )}
          </div>

          {isExpanded && game.description && (
            <div className="mt-3 border-t pt-3">
              <div className="text-sm text-gray-600">
                <h4 className="font-semibold mb-1">About this game:</h4>
                <p className="line-clamp-4">{game.description}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mt-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
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
              onClick={(e) => {
                e.stopPropagation();
                if (game.isDemo) return;
                
                if (!game.isFriend && onSendFriendRequest) {
                  onSendFriendRequest(game.owner.email);
                } else {
                  onSelect(game);
                }
              }}
              className={`w-full px-4 py-2 rounded-lg transition ${
                game.isDemo 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : !game.isFriend
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              disabled={game.isDemo}
              title={
                game.isDemo 
                  ? "Sample games cannot be borrowed" 
                  : !game.isFriend
                  ? "Add friend to borrow this game"
                  : undefined
              }
            >
              {game.isDemo 
                ? "Sample Game" 
                : !game.isFriend
                ? "Add Friend"
                : "Request to Borrow"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GameCard;

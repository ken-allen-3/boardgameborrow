import React, { useState } from 'react';
import { Calendar, MapPin, Users, Dice6, Clock } from 'lucide-react';
import { GameNight } from '../../types/gameNight';
import { Game } from '../../services/gameService';
import { suggestGamesForGameNight } from '../../services/gameNightService';
import InviteUsersModal from './InviteUsersModal';
import SuggestGamesModal from './SuggestGamesModal';

interface GameNightCardProps {
  gameNight: GameNight;
  games: Game[];
  currentUserEmail: string;
  onRespond: (status: 'going' | 'maybe' | 'declined') => void;
  onInviteUsers?: (invitees: { email: string; canInviteOthers: boolean }[]) => Promise<void>;
  onSuggestGames: (gameIds: string[]) => Promise<void>;
  onCancel?: () => void;
}

function GameNightCard({ 
  gameNight, 
  games,
  currentUserEmail,
  onRespond,
  onInviteUsers,
  onSuggestGames: handleSuggestGames,
  onCancel 
}: GameNightCardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuggestGamesModal, setShowSuggestGamesModal] = useState(false);
  const userKey = currentUserEmail.replace(/\./g, ',');
  const isHost = gameNight.hostId === userKey;
  const userResponse = gameNight.attendees[userKey]?.status;
  const attendeeCounts = {
    going: Object.values(gameNight.attendees).filter(a => a.status === 'going').length,
    invited: Object.values(gameNight.attendees).filter(a => !a.status || a.status === 'pending').length,
    declined: Object.values(gameNight.attendees).filter(a => a.status === 'declined').length
  };
  const canInviteOthers = isHost || (gameNight.inviteSettings?.allowInvites && gameNight.attendees[userKey]?.canInviteOthers);
  const defaultCover = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=400';
  const suggestedGames = Array.isArray(gameNight.suggestedGames) ? gameNight.suggestedGames : [];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-green-100 text-green-800';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="aspect-[2/1] relative">
        <img
          src={gameNight.coverImage || defaultCover}
          alt={gameNight.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-semibold text-white">{gameNight.title}</h3>
          {userResponse && (
            <span className={`mt-2 inline-block px-2 py-1 rounded-full text-sm ${getStatusColor(userResponse)}`}>
              {userResponse.charAt(0).toUpperCase() + userResponse.slice(1)}
            </span>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span>{formatDate(gameNight.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span>{gameNight.location}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5 text-gray-400" />
            <span>
              {attendeeCounts.going} going
              {attendeeCounts.invited > 0 && `, ${attendeeCounts.invited} invited`}
              {attendeeCounts.declined > 0 && `, ${attendeeCounts.declined} declined`}
              {gameNight.maxPlayers && (
                <span className="text-gray-400 ml-1">
                  (max {gameNight.maxPlayers})
                </span>
              )}
            </span>
          </div>

          {suggestedGames.length > 0 && (
            <div className="flex items-start gap-2 text-gray-600">
              <Dice6 className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <div className="font-medium mb-1">Suggested Games:</div>
                <ul className="list-disc list-inside space-y-1">
                  {suggestedGames.map(gameId => {
                    const game = games.find(g => g.id === gameId);
                    return game && (
                      <li key={gameId} className="text-sm">
                        {game.title}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {!userResponse && (
          <div className="flex gap-2">
            <button
              onClick={() => onRespond('going')}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Going
            </button>
            <button
              onClick={() => onRespond('maybe')}
              className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Maybe
            </button>
            <button
              onClick={() => onRespond('declined')}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Can't Go
            </button>
          </div>
        )}

        {suggestedGames.length === 0 && (
          <button
            onClick={() => setShowSuggestGamesModal(true)}
            className="w-full mt-4 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
          >
            <Dice6 className="h-5 w-5" />
            Suggest Games
          </button>
        )}

        {isHost && onCancel && (
          <button
            onClick={onCancel}
            className="w-full mt-4 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
          >
            Cancel Game Night
          </button>
        )}
      </div>

      {showSuggestGamesModal && (
        <SuggestGamesModal
          onClose={() => setShowSuggestGamesModal(false)}
          games={games.filter(g => g.status === 'available')}
          onSubmit={async (selectedGames) => {
            try {
              if (handleSuggestGames) {
                await handleSuggestGames(selectedGames);
                setShowSuggestGamesModal(false);
              }
            } catch (error) {
              console.error('Failed to suggest games:', error);
            }
          }}
        />
      )}

      {showInviteModal && (
        <InviteUsersModal
          onClose={() => setShowInviteModal(false)}
          onInvite={onInviteUsers}
          existingAttendees={Object.keys(gameNight.attendees).map(key => key.replace(/,/g, '.'))}
          defaultInvitePermission={gameNight.inviteSettings?.defaultInvitePermission ?? false}
        />
      )}
    </div>
  );
}

export default GameNightCard;
import React, { useState, useEffect } from 'react';
import { Plus, Dice6 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent, trackSocialInteraction } from '../services/analyticsService';
import { Game, loadUserGames } from '../services/gameService';
import { GameNight } from '../types/gameNight';
import {
  createGameNight,
  getUserGameNights,
  updateAttendance,
  cancelGameNight,
  inviteUsers,
  suggestGamesForGameNight,
  getAvailableGamesForGameNight,
  updateGameNight
} from '../services/gameNightService';
import CreateGameNightModal from '../components/gameNight/CreateGameNightModal';
import GameNightCard from '../components/gameNight/GameNightCard';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import SuggestGamesModal from '../components/gameNight/SuggestGamesModal';

function GameNights() {
  const [gameNights, setGameNights] = useState<GameNight[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser?.email) return;

    try {
      const [nights, games] = await Promise.all([
        getUserGameNights(currentUser.email),
        loadUserGames(currentUser.email)
      ]);
      
      setGameNights(nights);
      setUserGames(games);
      setError(null);
    } catch (err) {
      setError('Failed to load game nights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGameNight = async (data: {
    title: string;
    date: string;
    location: string;
    description?: string;
    maxPlayers?: number;
    suggestedGames: string[];
    invitees: { email: string; canInviteOthers: boolean }[];
    inviteSettings: {
      allowInvites: boolean;
      defaultInvitePermission: boolean;
    };
  }) => {
    if (!currentUser?.email) return;

    try {
      const gameNightId = await createGameNight(currentUser.email, data);
      
      // Track game night creation
      trackEvent('Game Night Created', {
        gameNightId,
        title: data.title,
        date: data.date,
        location: data.location,
        maxPlayers: data.maxPlayers,
        suggestedGamesCount: data.suggestedGames.length,
        inviteesCount: data.invitees.length
      });
      
      // Send invites
      if (data.invitees.length > 0) {
        await inviteUsers(gameNightId, data.invitees);
        trackSocialInteraction('Game Night Invite', {
          gameNightId,
          inviteCount: data.invitees.length
        });
      }
      
      await loadData();
      setSuccess('Game night created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create game night');
    }
  };

  const handleRespond = async (gameNightId: string, status: 'going' | 'maybe' | 'declined') => {
    if (!currentUser?.email) return;

    try {
      await updateAttendance(gameNightId, currentUser.email, status);
      trackSocialInteraction('Game Night Response', {
        gameNightId,
        response: status
      });
      await loadData();
      setSuccess('Response updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update response. Please try again.');
    }
  };

  const handleEdit = async (gameNightId: string, updates: Partial<GameNight>) => {
    if (!currentUser?.email) return;

    try {
      await updateGameNight(gameNightId, currentUser.email, updates);
      await loadData();
      setSuccess('Game night updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update game night');
    }
  };

  const handleCancel = async (gameNightId: string) => {
    if (!currentUser?.email || !window.confirm('Are you sure you want to cancel this game night?')) {
      return;
    }

    try {
      await cancelGameNight(gameNightId, currentUser.email);
      trackEvent('Game Night Cancelled', {
        gameNightId
      });
      await loadData();
      setSuccess('Game night cancelled successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel game night');
    }
  };

  const handleInviteUsers = async (gameNightId: string, invitees: { email: string; canInviteOthers: boolean }[]) => {
    console.log('[GameNights] Sending invites:', {
      gameNightId,
      inviteeCount: invitees.length,
      invitees
    });

    try {
      await inviteUsers(gameNightId, invitees);
      await loadData();
      setSuccess('Invites sent successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[GameNights] Invite error:', {
        error: err,
        message: err.message,
        gameNightId,
        invitees
      });
      setError(err.message || 'Failed to send invites. Please try again.');
    }
  };

  const handleSuggestGames = async (gameNightId: string, gameIds: string[]) => {
    try {
      await suggestGamesForGameNight(gameNightId, gameIds);
      trackEvent('Games Suggested', {
        gameNightId,
        gamesCount: gameIds.length
      });
      setSuccess('Games suggested successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to suggest games. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const upcomingGameNights = gameNights.filter(
    night => new Date(night.date) >= new Date()
  );

  const pastGameNights = gameNights.filter(
    night => new Date(night.date) < new Date()
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Game Nights</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Plan Game Night</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}
      </div>

      {showCreateModal && (
        <CreateGameNightModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGameNight}
          userGames={userGames}
        />
      )}

      {upcomingGameNights.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Upcoming Game Nights</h2>
          <div className="grid gap-6">
            {upcomingGameNights.map((night) => (
              <GameNightCard
                key={night.id}
                gameNight={night}
                games={userGames}
                currentUserEmail={currentUser!.email!}
                onRespond={(status) => handleRespond(night.id, status)}
                onInviteUsers={
                  new Date(night.date) > new Date()
                    ? (invitees) => handleInviteUsers(night.id, invitees)
                    : undefined
                }
                onSuggestGames={async (gameIds) => {
                  try {
                    const availableGames = await getAvailableGamesForGameNight(night.id);
                    setAvailableGames(availableGames);
                    await handleSuggestGames(night.id, gameIds);
                  } catch (err: any) {
                    setError(err.message || 'Failed to load available games');
                  }
                }}
                onCancel={
                  night.hostId === currentUser!.email!.replace(/\./g, ',')
                    ? () => handleCancel(night.id)
                    : undefined
                }
                onEdit={
                  night.hostId === currentUser!.email!.replace(/\./g, ',')
                    ? (updates) => handleEdit(night.id, updates)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {pastGameNights.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Game Nights</h2>
          <div className="grid gap-6 opacity-75">
            {pastGameNights.map((night) => (
              <GameNightCard
                key={night.id}
                gameNight={night}
                games={userGames}
                currentUserEmail={currentUser!.email!}
                onRespond={(status) => handleRespond(night.id, status)}
                onSuggestGames={async (gameIds) => {
                  try {
                    const availableGames = await getAvailableGamesForGameNight(night.id);
                    setAvailableGames(availableGames);
                    await handleSuggestGames(night.id, gameIds);
                  } catch (err: any) {
                    setError(err.message || 'Failed to load available games');
                  }
                }}
                onEdit={
                  night.hostId === currentUser!.email!.replace(/\./g, ',')
                    ? (updates) => handleEdit(night.id, updates)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {gameNights.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dice6 className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Game Nights Yet</h3>
          <p className="text-gray-600 mb-6">
            Plan your first game night and invite friends to join!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Plan Game Night</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default GameNights;

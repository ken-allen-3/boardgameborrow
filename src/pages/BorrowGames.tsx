import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { sendBorrowRequestEmail } from '../services/email';
import BorrowRequestModal from '../components/BorrowRequestModal';
import ErrorMessage from '../components/ErrorMessage';

interface Game {
  id: string;
  title: string;
  image: string;
  owner: {
    email: string;
    name: string;
  };
  available: boolean;
  minPlayers?: number;
  maxPlayers?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
}

interface BorrowRequest {
  gameId: string;
  startDate: string;
  duration: number;
  message: string;
}

function BorrowGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [requestStatus, setRequestStatus] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    loadAllGames();
  }, [currentUser]);

  const loadAllGames = async () => {
    const db = getDatabase();
    const gamesRef = ref(db, 'games');
    const usersRef = ref(db, 'users');
    
    try {
      const [gamesSnapshot, usersSnapshot] = await Promise.all([
        get(gamesRef),
        get(usersRef)
      ]);

      const allGames: Game[] = [];
      const users = usersSnapshot.val() || {};
      
      if (gamesSnapshot.exists()) {
        Object.entries(gamesSnapshot.val()).forEach(([userKey, userGames]) => {
          const userEmail = userKey.replace(/,/g, '.');
          if (userEmail === currentUser.email) return;

          const games = userGames as any[];
          const userInfo = users[userKey] || {};
          
          games.forEach((game, index) => {
            if (game.status === 'available') {
              allGames.push({
                id: `${userKey}-${index}`,
                title: game.title,
                image: game.image || '/board-game-placeholder.png',
                owner: {
                  email: userEmail,
                  name: userInfo.name || userEmail.split('@')[0]
                },
                available: true,
                minPlayers: game.minPlayers,
                maxPlayers: game.maxPlayers,
                minPlaytime: game.minPlaytime,
                maxPlaytime: game.maxPlaytime
              });
            }
          });
        });
      }
      
      setGames(allGames);
      setError(null);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Failed to load available games. Please try again.');
    }
  };

  const handleBorrowRequest = async (request: BorrowRequest) => {
    const game = games.find(g => g.id === request.gameId);
    if (!game) return;
    
    try {
      // Send email notification to game owner
      await sendBorrowRequestEmail({
        ownerEmail: game.owner.email,
        borrowerName: currentUser?.email?.split('@')[0] || 'A user',
        gameName: game.title,
        startDate: request.startDate,
        duration: request.duration,
        message: request.message
      });

      // Update UI state
      setRequestStatus(prev => ({
        ...prev,
        [request.gameId]: 'pending'
      }));
    } catch (err) {
      console.error('Failed to send borrow request:', err);
      setError('Failed to send borrow request. Please try again.');
    }
  };

  const filteredGames = games.filter(game => 
    game.available && (
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Available Games</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games or owners..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
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
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1" title={game.title}>
                {game.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-1">Owned by {game.owner.name}</p>
              
              <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
                {formatPlayers(game.minPlayers, game.maxPlayers) && (
                  <span>{formatPlayers(game.minPlayers, game.maxPlayers)}</span>
                )}
                {formatPlaytime(game.minPlaytime, game.maxPlaytime) && (
                  <span>• {formatPlaytime(game.minPlaytime, game.maxPlaytime)}</span>
                )}
              </div>
              
              {requestStatus[game.id] ? (
                <div className={`text-center py-2 rounded-lg ${
                  requestStatus[game.id] === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : requestStatus[game.id] === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Request {requestStatus[game.id]}
                </div>
              ) : (
                <button
                  onClick={() => setSelectedGame(game)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Request to Borrow
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedGame && (
        <BorrowRequestModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSubmit={handleBorrowRequest}
        />
      )}

      {filteredGames.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No available games found matching your search.</p>
        </div>
      )}
    </div>
  );
}

export default BorrowGames;
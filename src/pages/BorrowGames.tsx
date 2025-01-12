import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, TrendingUp, Filter } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { createBorrowRequest, getUserBorrowRequests, BorrowRequest } from '../services/borrowRequestService';
import { sendBorrowRequestEmail } from '../services/email';
import { getFriendsList } from '../services/friendService';
import { getUserProfile } from '../services/userService';
import BorrowRequestModal from '../components/BorrowRequestModal';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import GameCard from '../components/GameCard';

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

interface Filters {
  playerCount?: number;
  minPlaytime?: number;
  maxPlaytime?: number;
  category?: string;
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'friends' | 'distance' | 'popularity';
}

interface BorrowRequestInput {
  gameId: string;
  startDate: string;
  duration: number;
  message: string;
}

function BorrowGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    availability: 'available',
    sortBy: 'friends'
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      loadAllGames(),
      loadBorrowRequests()
    ]);
  }, [currentUser]);

  const loadBorrowRequests = async () => {
    if (!currentUser?.email) return;
    
    try {
      const requests = await getUserBorrowRequests(currentUser.email);
      setBorrowRequests(requests);
    } catch (err) {
      console.error('Error loading borrow requests:', err);
      setError('Failed to load your borrow requests');
    }
  };

  const loadAllGames = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    
    const db = getDatabase();
    const gamesRef = ref(db, 'games');
    const usersRef = ref(db, 'users');
    
    try {
      const [gamesSnapshot, usersSnapshot, friendsList, currentUserProfile] = await Promise.all([
        get(gamesRef),
        get(usersRef),
        getFriendsList(currentUser.email.replace(/\./g, ',')),
        getUserProfile(currentUser.email)
      ]);

      const allGames: Game[] = [];
      const users = usersSnapshot.val() || {};
      const friendEmails = new Set(friendsList.map(friend => friend.email));
      const userCoordinates = currentUserProfile.coordinates;
      
      if (gamesSnapshot.exists()) {
        // Convert the games object to an array of entries and iterate
        Object.entries(gamesSnapshot.val()).forEach(([userKey, userGames]) => {
          const userEmail = userKey.replace(/,/g, '.');
          if (userEmail === currentUser.email) return; // Skip current user's games

          const games = userGames as any[];
          const userInfo = users[userKey] || {};
          const isFriend = friendEmails.has(userEmail);
          
          if (Array.isArray(games)) {
            games.forEach((game, index) => {
              if (game.status === 'available') {
                // Calculate distance if both user and owner have coordinates
                let distance: number | undefined;
                if (userCoordinates && userInfo.coordinates) {
                  const R = 6371; // Earth's radius in km
                  const lat1 = userCoordinates.latitude * Math.PI / 180;
                  const lat2 = userInfo.coordinates.latitude * Math.PI / 180;
                  const dLat = (userInfo.coordinates.latitude - userCoordinates.latitude) * Math.PI / 180;
                  const dLon = (userInfo.coordinates.longitude - userCoordinates.longitude) * Math.PI / 180;
                  
                  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  distance = R * c;
                }

                allGames.push({
                  id: `${userKey}-${index}`,
                  title: game.title,
                  image: game.image || '/board-game-placeholder.png',
                  owner: {
                    email: userEmail,
                    firstName: userInfo.firstName || '',
                    lastName: userInfo.lastName || userEmail.split('@')[0],
                    photoUrl: userInfo.photoUrl,
                    coordinates: userInfo.coordinates
                  },
                  available: true,
                  minPlayers: game.minPlayers,
                  maxPlayers: game.maxPlayers,
                  minPlaytime: game.minPlaytime,
                  maxPlaytime: game.maxPlaytime,
                  category: game.category,
                  distance,
                  isFriend
                });
              }
            });
          }
        });
      }
      
      setGames(allGames);
      setError(null);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Failed to load available games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowRequest = async (request: BorrowRequestInput) => {
    const game = games.find(g => g.id === request.gameId);
    if (!game || !currentUser?.email) {
      setError('Unable to process request. Please try again.');
      return;
    }
    
    try {
      setError(null);
      
      // Create borrow request in database
      await createBorrowRequest({
        gameId: game.id,
        borrowerId: currentUser.email,
        ownerId: game.owner.email,
        gameName: game.title,
        startDate: request.startDate,
        duration: request.duration,
        message: request.message,
        status: 'pending'
      });

      // Send email notification to game owner
      const emailSent = await sendBorrowRequestEmail({
        ownerEmail: game.owner.email,
        borrowerName: currentUser.email.split('@')[0],
        gameName: game.title,
        startDate: request.startDate,
        duration: request.duration,
        message: request.message
      });

      if (!emailSent) {
        console.warn('Failed to send email notification, but request was created');
      }

      await loadBorrowRequests();
      setSuccess('Borrow request sent successfully!');
      setSelectedGame(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to send borrow request:', err);
      setError(err instanceof Error ? err.message : 'Failed to send borrow request. Please try again.');
    }
  };

  const applyFilters = (games: Game[]) => {
    return games.filter(game => {
      // Search filter
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${game.owner.firstName} ${game.owner.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Availability filter
      const matchesAvailability = 
        filters.availability === 'all' ||
        (filters.availability === 'available' && game.available) ||
        (filters.availability === 'unavailable' && !game.available);
      
      // Player count filter
      const matchesPlayerCount = !filters.playerCount ||
        (game.minPlayers && game.maxPlayers &&
          filters.playerCount >= game.minPlayers &&
          filters.playerCount <= game.maxPlayers);
      
      // Playtime filter
      const matchesPlaytime = 
        (!filters.minPlaytime || (game.maxPlaytime && game.maxPlaytime >= filters.minPlaytime)) &&
        (!filters.maxPlaytime || (game.minPlaytime && game.minPlaytime <= filters.maxPlaytime));
      
      // Category filter
      const matchesCategory = !filters.category || game.category === filters.category;
      
      return matchesSearch && matchesAvailability && matchesPlayerCount && 
             matchesPlaytime && matchesCategory;
    });
  };

  const sortGames = (games: Game[]) => {
    return [...games].sort((a, b) => {
      switch (filters.sortBy) {
        case 'friends':
          if (a.isFriend === b.isFriend) {
            return (a.distance || Infinity) - (b.distance || Infinity);
          }
          return a.isFriend ? -1 : 1;
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'popularity':
          // For now, sort by distance as a placeholder for popularity
          return (a.distance || Infinity) - (b.distance || Infinity);
        default:
          return 0;
      }
    });
  };

  const filteredGames = sortGames(applyFilters(games));

  const friendsGames = filteredGames.filter(game => game.isFriend);
  const nearbyGames = filteredGames.filter(game => game.distance && game.distance <= 10); // Games within 10km
  const allGames = filteredGames.filter(game => !game.isFriend && (!game.distance || game.distance > 10));

  const getGameRequestStatus = (gameId: string) => {
    return borrowRequests.find(req => req.gameId === gameId)?.status;
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
      {success && <SuccessMessage message={success} />}

      {/* Active Requests Section */}
      {borrowRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Borrow Requests</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {borrowRequests.map((request) => {
              const game = games.find(g => g.id === request.gameId);
              if (!game) return null;

              return (
                <GameCard
                  key={request.id}
                  game={game}
                  onSelect={setSelectedGame}
                  requestStatus={request.status}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as Filters['sortBy'] })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="friends">Friends First</option>
          <option value="distance">Distance</option>
          <option value="popularity">Popularity</option>
        </select>

        <select
          value={filters.availability}
          onChange={(e) => setFilters({ ...filters, availability: e.target.value as Filters['availability'] })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Games</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <input
          type="number"
          placeholder="Player Count"
          value={filters.playerCount || ''}
          onChange={(e) => setFilters({ ...filters, playerCount: e.target.value ? Number(e.target.value) : undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <input
          type="number"
          placeholder="Min Playtime (min)"
          value={filters.minPlaytime || ''}
          onChange={(e) => setFilters({ ...filters, minPlaytime: e.target.value ? Number(e.target.value) : undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <input
          type="number"
          placeholder="Max Playtime (min)"
          value={filters.maxPlaytime || ''}
          onChange={(e) => setFilters({ ...filters, maxPlaytime: e.target.value ? Number(e.target.value) : undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Friends' Games Section */}
      {friendsGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Friends' Games
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {friendsGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={setSelectedGame}
                requestStatus={getGameRequestStatus(game.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Games Near You Section */}
      {nearbyGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Games Near You
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nearbyGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={setSelectedGame}
                requestStatus={getGameRequestStatus(game.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Games Section */}
      {allGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            All Games (Popular)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={setSelectedGame}
                requestStatus={getGameRequestStatus(game.id)}
              />
            ))}
          </div>
        </div>
      )}

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

import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, TrendingUp, Filter } from 'lucide-react';
import RecommendedGames from '../components/RecommendedGames';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { createBorrowRequest, getUserBorrowRequests, BorrowRequest } from '../services/borrowRequestService';
import { sendBorrowRequestEmail } from '../services/email';
import { getFriendsList } from '../services/friendService';
import { getUserProfile } from '../services/userService';
import BorrowRequestModal from '../components/BorrowRequestModal';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import BorrowGames from '../components/BorrowGames';
import GameCard from '../components/GameCard';
import { Game } from '../components/GameCard';

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

function BorrowGamesPage() {
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
      // Remove any existing error message if the requests loaded successfully
      setError(null);
    } catch (err) {
      console.error('Error loading borrow requests:', err);
      // Check if it's a permission error
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Permission denied')) {
        // For permission errors, just set empty requests without showing an error
        setBorrowRequests([]);
        setError(null);
      } else {
        setError('Failed to load your borrow requests');
      }
    }
  };

  const loadAllGames = async () => {
    if (!currentUser?.email) return;
    setLoading(true);
    
    const db = getDatabase();
    const gamesRef = ref(db, 'games');
    const usersRef = ref(db, 'users');
    
    try {
      // Get games and users data first
      const [gamesSnapshot, usersSnapshot] = await Promise.all([
        get(gamesRef),
        get(usersRef)
      ]);
      
      // Try to get friends list and user profile, but handle errors gracefully
      let friendsList: any[] = [];
      let currentUserProfile: any = {};
      
      try {
        friendsList = await getFriendsList(currentUser.email.replace(/\./g, ','));
      } catch (err) {
        console.error('Error getting friends list:', err);
        // Just use an empty friends list on error
        friendsList = [];
      }
      
      try {
        currentUserProfile = await getUserProfile(currentUser.email);
      } catch (err) {
        console.error('Error getting user profile:', err);
        // Use an empty profile on error
        currentUserProfile = {};
      }

      const allGames: Game[] = [];
      const users = usersSnapshot.val() || {};
      const friendEmails = new Set(friendsList.map(friend => friend.email));
      const userCoordinates = currentUserProfile?.coordinates;
      
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
                  isFriend: isFriend || false
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
      // Check if it's a permission error
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Permission denied')) {
        // For permission errors, just set empty games without showing an error
        setGames([]);
        setError(null);
      } else {
        setError('Failed to load available games. Please try again.');
      }
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

    if (!game.isFriend) {
      setError('You can only borrow games from friends. Send a friend request first!');
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

  const handleGameSelect = (game: Game) => {
    if (!game.isFriend) {
      setError('You can only borrow games from friends. Send a friend request first!');
      return;
    }
    setSelectedGame(game);
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
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Recommended Games Section */}
      {currentUser?.email && (
        <RecommendedGames
          userEmail={currentUser.email}
          onSelectGame={handleGameSelect}
        />
      )}

      {/* Active Requests Section */}
      {borrowRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">My Borrow Requests</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
            {borrowRequests.map((request) => {
              const game = games.find(g => g.id === request.gameId);
              if (!game) return null;

              return (
                <GameCard
                  key={request.id}
                  game={game}
                  onSelect={handleGameSelect}
                  requestStatus={request.status}
                />
              );
            })}
          </div>
        </div>
      )}

      <BorrowGames 
        userGames={filteredGames}
        onSelectGame={handleGameSelect}
      />

      {selectedGame && (
        <BorrowRequestModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSubmit={handleBorrowRequest}
        />
      )}
    </div>
  );
}

export default BorrowGamesPage;

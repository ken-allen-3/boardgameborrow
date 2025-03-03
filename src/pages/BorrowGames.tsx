import React, { useState, useEffect } from 'react';
import { Search, Users, MapPin, TrendingUp, Filter, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import RecommendedGames from '../components/RecommendedGames';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import { createBorrowRequest, getUserBorrowRequests, BorrowRequest } from '../services/borrowRequestService';
import { sendBorrowRequestEmail } from '../services/email';
import { getFriendsList, sendFriendRequest } from '../services/friendService';
import { getUserProfile } from '../services/userService';
import { loadUserGames } from '../services/gameService';
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

// Empty state component for users with no friends
const EmptyFriendsState = ({ onFindFriends }: { onFindFriends: () => void }) => (
  <div className="mb-8 bg-blue-50 rounded-xl p-6">
    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-blue-900">
      <Users className="h-5 w-5" />
      Your Friends' Games
    </h2>
    <p className="text-blue-700 mb-4">
      📣 Your friends' games will appear here! Add friends to see what you can borrow.
    </p>
    <button
      onClick={onFindFriends}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      <UserPlus size={18} />
      Find Friends & Invite
    </button>
  </div>
);

// View toggle component
const ViewToggle = ({ 
  view, 
  onViewChange,
  hasFriends
}: { 
  view: 'friends' | 'public',
  onViewChange: (view: 'friends' | 'public') => void,
  hasFriends: boolean
}) => (
  <div className="flex items-center justify-end mb-4">
    <span className="text-sm text-gray-600 mr-2">Showing:</span>
    <div className="flex rounded-lg overflow-hidden border border-gray-200">
      <button
        onClick={() => onViewChange('friends')}
        disabled={!hasFriends}
        className={`px-3 py-1 text-sm ${
          view === 'friends'
            ? 'bg-indigo-600 text-white'
            : hasFriends
            ? 'bg-white text-gray-700 hover:bg-gray-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Friends' Games
      </button>
      <button
        onClick={() => onViewChange('public')}
        className={`px-3 py-1 text-sm ${
          view === 'public'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Public Games
      </button>
    </div>
  </div>
);

function BorrowGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFriends, setHasFriends] = useState(false);
  const [viewMode, setViewMode] = useState<'friends' | 'public'>('public');
  const [filters, setFilters] = useState<Filters>({
    availability: 'available',
    sortBy: 'friends'
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('BorrowGamesPage useEffect - currentUser:', currentUser?.email);
    if (!currentUser) {
      console.log('No user is authenticated, cannot load games');
      return;
    }
    
    // Check if we can access the database directly
    const testDatabaseAccess = async () => {
      try {
        const db = getDatabase();
        console.log('Testing direct database access...');
        
        // Try to access the user's own games
        if (!currentUser.email) {
          console.log('User email is null, cannot access games');
          return;
        }
        const userGamesRef = ref(db, `games/${currentUser.email.replace(/\./g, ',')}`);
        const userGamesSnapshot = await get(userGamesRef);
        console.log('User games access result:', {
          exists: userGamesSnapshot.exists(),
          data: userGamesSnapshot.exists() ? 'Data found' : 'No data'
        });
        
        // Try to access all users
        const usersRef = ref(db, 'users');
        const usersSnapshot = await get(usersRef);
        console.log('Users access result:', {
          exists: usersSnapshot.exists(),
          userCount: usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0
        });
      } catch (err) {
        console.error('Error testing database access:', err);
      }
    };
    
    testDatabaseAccess();
    
    Promise.all([
      loadAllGames(),
      loadBorrowRequests(),
      checkHasFriends()
    ]);
  }, [currentUser]);

  const checkHasFriends = async () => {
    if (!currentUser?.email) return;
    
    try {
      const friendsList = await getFriendsList(currentUser.email.replace(/\./g, ','));
      const hasFriends = friendsList.length > 0;
      setHasFriends(hasFriends);
      
      // If user has friends, default to friends view, otherwise public
      setViewMode(hasFriends ? 'friends' : 'public');
    } catch (err) {
      console.error('Error checking friends:', err);
      setHasFriends(false);
    }
  };

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
    
    // Check if we're connected to Firebase
    console.log('Firebase database instance:', db);
    
    // Try to list all top-level paths in the database to see if 'games' exists
    try {
      const rootRef = ref(db, '/');
      const rootSnapshot = await get(rootRef);
      if (rootSnapshot.exists()) {
        console.log('Database root paths:', Object.keys(rootSnapshot.val()));
      } else {
        console.log('Database root is empty or not accessible');
      }
    } catch (err) {
      console.error('Error accessing database root:', err);
    }
    
    // We can't read all games at once due to permission rules
    // Instead, we need to read users first, then read each user's games individually
    const usersRef = ref(db, 'users');
    
    try {
      console.log('Starting to load games from Firebase...');
      
      // Get users data first
      const usersSnapshot = await get(usersRef);
      
      console.log('Users snapshot exists:', usersSnapshot.exists());
      
      if (!usersSnapshot.exists()) {
        console.log('No users found in database');
        setGames([]);
        setLoading(false);
        return;
      }
      
      // Try to get friends list and user profile, but handle errors gracefully
      let friendsList: any[] = [];
      let currentUserProfile: any = {};
      
      try {
        friendsList = await getFriendsList(currentUser.email.replace(/\./g, ','));
        setHasFriends(friendsList.length > 0);
      } catch (err) {
        console.error('Error getting friends list:', err);
        // Just use an empty friends list on error
        friendsList = [];
        setHasFriends(false);
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
      // If user doesn't have coordinates, add mock coordinates for testing
      let userCoordinates = currentUserProfile?.coordinates;
      if (!userCoordinates) {
        userCoordinates = {
          latitude: 37.7749, // San Francisco coordinates
          longitude: -122.4194
        };
        console.log('Added mock user coordinates for testing:', userCoordinates);
      } else {
        console.log('User coordinates:', userCoordinates);
      }
      
      // Process each user's games individually
      let gameCount = 0;
      const userKeys = Object.keys(users);
      console.log(`Found ${userKeys.length} users to process`);
      
      // Process each user's games sequentially to avoid too many parallel requests
      for (const userKey of userKeys) {
        if (userKey === currentUser.email.replace(/\./g, ',')) continue; // Skip current user's games
        
        try {
          // Get this user's games
          const userGamesRef = ref(db, `games/${userKey}`);
          const userGamesSnapshot = await get(userGamesRef);
          
          if (!userGamesSnapshot.exists()) {
            console.log(`No games found for user ${userKey}`);
            continue;
          }
          
          const userGames = userGamesSnapshot.val();
          console.log(`Processing games for user ${userKey.replace(/,/g, '.')}:`, 
            Array.isArray(userGames) ? `${userGames.length} games` : 'Not an array');
          const userEmail = userKey.replace(/,/g, '.');
          const userInfo = users[userKey] || {};
          const isFriend = friendEmails.has(userEmail);
          
          if (Array.isArray(userGames)) {
            console.log(`User ${userEmail} has ${userGames.length} games`);
            userGames.forEach((game, index) => {
              gameCount++;
              if (game.status === 'available') {
                // Calculate distance if both user and owner have coordinates
                let distance: number | undefined;
                // If owner doesn't have coordinates, add mock coordinates for testing
                if (!userInfo.coordinates) {
                  // Generate random coordinates within ~30km of the user
                  const randomLat = userCoordinates.latitude + (Math.random() - 0.5) * 0.5;
                  const randomLng = userCoordinates.longitude + (Math.random() - 0.5) * 0.5;
                  userInfo.coordinates = {
                    latitude: randomLat,
                    longitude: randomLng
                  };
                  console.log('Added mock owner coordinates for testing:', userInfo.coordinates);
                }
                
                if (userCoordinates && userInfo.coordinates) {
                  console.log('Owner coordinates for', userEmail, ':', userInfo.coordinates);
                  
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
                  
                  // Debug calculated distance
                  console.log('Calculated distance for', game.title, ':', distance, 'km');
                } else {
                  console.log('Missing coordinates for distance calculation:', 
                    userCoordinates ? 'User has coordinates' : 'User missing coordinates',
                    userInfo.coordinates ? 'Owner has coordinates' : 'Owner missing coordinates');
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
        } catch (err) {
          console.error(`Error loading games for user ${userKey}:`, err);
        }
      }
      
      console.log(`Processed ${gameCount} total games, added ${allGames.length} to display list`);
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
      // Instead of showing an error, we'll handle this in the UI by showing an "Add Friend" button
      handleSendFriendRequest(game.owner.email);
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
    if (!game.isFriend && !game.isDemo) {
      // Instead of showing an error, we'll handle this in the UI by showing an "Add Friend" button
      handleSendFriendRequest(game.owner.email);
      return;
    }
    setSelectedGame(game);
  };

  const handleSendFriendRequest = async (toUserEmail: string) => {
    if (!currentUser?.email) {
      setError('You must be logged in to send friend requests.');
      return;
    }

    try {
      const fromUserId = currentUser.email.replace(/\./g, ',');
      const toUserId = toUserEmail.replace(/\./g, ',');
      
      await sendFriendRequest(fromUserId, toUserId);
      setSuccess(`Friend request sent to ${toUserEmail.split('@')[0]}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to send friend request:', err);
      setError('Failed to send friend request. Please try again.');
    }
  };

  const handleFindFriends = () => {
    // Navigate to the Friends page
    window.location.href = '/friends';
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

  // Categorize games based on friendship status and distance
  const friendsGames = filteredGames.filter(game => game.isFriend);
  const nearbyGames = filteredGames.filter(game => !game.isFriend && game.distance !== undefined && game.distance <= 50); // Games within 50km (increased from 10km)
  const featuredGames = filteredGames.filter(game => !game.isFriend && (!game.distance || game.distance > 50));
  
  // Debug game categorization
  console.log('Total games:', filteredGames.length);
  console.log('Friends games:', friendsGames.length);
  console.log('Nearby games:', nearbyGames.length);
  console.log('Featured games:', featuredGames.length);
  
  // Debug nearby games
  if (nearbyGames.length > 0) {
    console.log('Nearby games details:', nearbyGames.map(game => ({
      title: game.title,
      distance: game.distance,
      owner: game.owner.email
    })));
  } else {
    console.log('No nearby games found. Checking all games distances:');
    console.log('Games with distance:', filteredGames.filter(game => game.distance !== undefined).length);
    console.log('Games with distance <= 10km:', filteredGames.filter(game => game.distance !== undefined && game.distance <= 10).length);
    console.log('Games that are not from friends:', filteredGames.filter(game => !game.isFriend).length);
  }

  const getGameRequestStatus = (gameId: string) => {
    return borrowRequests.find(req => req.gameId === gameId)?.status;
  };

  return (
    <div>
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Empty State for Users with No Friends */}
      {!hasFriends && (
        <EmptyFriendsState onFindFriends={handleFindFriends} />
      )}

      {/* View Toggle */}
      <ViewToggle 
        view={viewMode} 
        onViewChange={setViewMode}
        hasFriends={hasFriends}
      />

  {/* Active Requests Section */}
  {(() => {
    // Filter requests to only include those with matching games
    const validRequests = borrowRequests.filter(request => 
      games.some(g => g.id === request.gameId)
    );
    
    // Only render if there are valid requests
    if (validRequests.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Borrow Requests</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
          {validRequests.map((request) => {
            const game = games.find(g => g.id === request.gameId);
            // This check should always pass due to our filter above
            if (!game) return null;

            return (
              <GameCard
                key={request.id}
                game={game}
                onSelect={handleGameSelect}
                requestStatus={request.status}
                onSendFriendRequest={handleSendFriendRequest}
              />
            );
          })}
        </div>
      </div>
    );
  })()}

      {/* Show different game sections based on view mode */}
      {viewMode === 'friends' ? (
        // Friends' Games View
        hasFriends ? (
          <BorrowGames 
            userGames={friendsGames}
            onSelectGame={handleGameSelect}
            onSendFriendRequest={handleSendFriendRequest}
            viewMode={viewMode}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>You don't have any friends yet. Add friends to see their games here!</p>
          </div>
        )
      ) : (
        // Public Games View
        <BorrowGames 
          userGames={filteredGames}
          friendsGames={friendsGames}
          nearbyGames={nearbyGames}
          featuredGames={featuredGames}
          onSelectGame={handleGameSelect}
          onSendFriendRequest={handleSendFriendRequest}
          viewMode={viewMode}
        />
      )}

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

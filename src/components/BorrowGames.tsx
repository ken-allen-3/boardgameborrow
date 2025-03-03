import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import GameCard from './GameCard';
import { seedDataService } from '../services/seedDataService';

import { Game } from './GameCard';

interface BorrowGamesProps {
  userGames: Game[];
  onSelectGame: (game: Game) => void;
  onSendFriendRequest?: (toUserEmail: string) => void;
  viewMode?: 'friends' | 'public';
  friendsGames?: Game[];
  nearbyGames?: Game[];
  featuredGames?: Game[];
}

const GAME_CATEGORIES = [
  'All',
  'Strategy',
  'Family Game',
  'Party Game',
  'Card Game',
  'Adventure',
  'Fantasy',
  'Economic',
  'Science Fiction',
  'Abstract',
  'Cooperative'
];

// Section header component
const SectionHeader = ({ 
  title, 
  icon 
}: { 
  title: string, 
  icon?: React.ReactNode 
}) => (
  <div className="flex items-center gap-2 mb-4">
    {icon}
    <h2 className="text-2xl font-bold">{title}</h2>
  </div>
);

const BorrowGames: React.FC<BorrowGamesProps> = ({ 
  userGames, 
  onSelectGame, 
  onSendFriendRequest,
  viewMode = 'public',
  friendsGames = [],
  nearbyGames = [],
  featuredGames = []
}) => {
  const [seededGames, setSeededGames] = useState<Game[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Turn off demo game data as requested
    setSeededGames([]);
  }, []);

  const filteredSeededGames = useMemo(() => {
    if (selectedCategory === 'All') return seededGames;
    return seededGames.filter(game => 
      game.category && game.category === selectedCategory
    );
  }, [seededGames, selectedCategory]);

  const filteredUserGames = useMemo(() => {
    if (selectedCategory === 'All') return userGames;
    return userGames.filter(game => 
      game.category && game.category === selectedCategory
    );
  }, [userGames, selectedCategory]);

  // Determine which games to show based on view mode
  const gamesToShow = viewMode === 'friends' ? filteredUserGames : filteredUserGames;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
        <div className="flex overflow-x-auto gap-2 pb-2 snap-x snap-mandatory whitespace-nowrap">
          {GAME_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors snap-start shrink-0
                ${selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'public' ? (
        // Public Games View
        <>

          {/* Nearby Games Section */}
          <div className="mb-12">
            <SectionHeader 
              title="Nearby Games" 
              icon={<MapPin className="h-6 w-6 text-green-500" />} 
            />
            {nearbyGames && nearbyGames.length > 0 ? (
              <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
                {nearbyGames
                  .filter(game => selectedCategory === 'All' || game.category === selectedCategory)
                  .map(game => (
                    <div key={game.id} className="w-72 shrink-0 snap-start">
                      <GameCard
                        game={game}
                        onSelect={onSelectGame}
                        onSendFriendRequest={onSendFriendRequest}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No nearby games found. Try expanding your search area or check back later.
              </p>
            )}
          </div>

          {/* Featured Games Section */}
          {featuredGames && featuredGames.length > 0 && (
            <div className="mb-12">
              <SectionHeader title="Featured Games" />
              <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
                {featuredGames
                  .filter(game => selectedCategory === 'All' || game.category === selectedCategory)
                  .map(game => (
                    <div key={game.id} className="w-72 shrink-0 snap-start">
                      <GameCard
                        game={game}
                        onSelect={onSelectGame}
                        onSendFriendRequest={onSendFriendRequest}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // Friends' Games View
        <div>
          <SectionHeader title="Friends' Games" />
          {filteredUserGames.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
              {filteredUserGames.map(game => (
                <div key={game.id} className="w-72 shrink-0 snap-start">
                  <GameCard
                    game={game}
                    onSelect={onSelectGame}
                    onSendFriendRequest={onSendFriendRequest}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No games available from your friends matching the selected filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowGames;

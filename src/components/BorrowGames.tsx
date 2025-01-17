import React, { useState, useEffect, useMemo } from 'react';
import GameCard from './GameCard';
import { seedDataService } from '../services/seedDataService';

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

interface BorrowGamesProps {
  userGames: Game[];
  onSelectGame: (game: Game) => void;
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

const BorrowGames: React.FC<BorrowGamesProps> = ({ userGames, onSelectGame }) => {
  const [seededGames, setSeededGames] = useState<Game[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Transform seeded games to match Game interface
    const transformedGames = seedDataService.getSeededGames().map((game, index) => ({
      id: game.id,
      title: game.name,
      // Cycle through the 4 placeholder images
      image: `/board-game-placeholder-${(index % 4) + 1}.webp`,
      owner: {
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        photoUrl: 'https://source.unsplash.com/random/400x400/?person'
      },
      available: true,
      minPlayers: game.min_players,
      maxPlayers: game.max_players,
      minPlaytime: game.min_playtime,
      maxPlaytime: game.max_playtime,
      category: game.categories[0],
      isDemo: true
    }));
    setSeededGames(transformedGames);
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
      {/* Popular Games Section */}
      {filteredSeededGames.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Games</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
            {filteredSeededGames.map(game => (
              <div key={game.id} className="w-72 shrink-0 snap-start">
                <GameCard
                  game={game}
                  onSelect={onSelectGame}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Games Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Games</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
          {filteredUserGames.map(game => (
              <div key={game.id} className="w-72 shrink-0 snap-start">
                <GameCard
                  game={game}
                  onSelect={onSelectGame}
                />
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BorrowGames;

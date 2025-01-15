import React, { useState, useEffect } from 'react';
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

const BorrowGames: React.FC<BorrowGamesProps> = ({ userGames, onSelectGame }) => {
  const [seededGames, setSeededGames] = useState<Game[]>([]);

  useEffect(() => {
    // Transform seeded games to match Game interface
    const transformedGames = seedDataService.getSeededGames().map(game => ({
      id: game.id,
      title: game.name,
      image: game.image_url,
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Popular Games Section */}
      {seededGames.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {seededGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={onSelectGame}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Games Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onSelect={onSelectGame}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BorrowGames;

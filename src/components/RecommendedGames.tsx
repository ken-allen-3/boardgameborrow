import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Game } from './GameCard';
import { getRecommendedGames } from '../services/recommendationService';
import GameCard from './GameCard';

interface RecommendedGamesProps {
  userEmail: string;
  userGameCount?: number;
  onSelectGame: (game: Game) => void;
  onSendFriendRequest?: (toUserEmail: string) => void;
}

const RecommendedGames: React.FC<RecommendedGamesProps> = ({
  userEmail,
  userGameCount = 0,
  onSelectGame,
  onSendFriendRequest
}) => {
  const [recommendations, setRecommendations] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userEmail]);

  const loadRecommendations = async () => {
    try {
      const recommendedGames = await getRecommendedGames(userEmail);
      // Transform the games to match the BorrowGames interface
      const games = recommendedGames.map(game => ({
        id: game.id,
        title: game.title,
        image: game.image || '/board-game-placeholder.png',
        owner: {
          email: game.status === 'borrowed' ? game.borrower! : '',
          firstName: '',
          lastName: '',
        },
        available: game.status === 'available',
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        minPlaytime: game.minPlaytime,
        maxPlaytime: game.maxPlaytime,
        type: game.type,
        isFriend: false // Recommended games are not necessarily from friends
      }));
      setRecommendations(games);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      // Just set empty recommendations on error - don't show an error message
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[300px] h-[400px] bg-gray-200 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    const progressPercentage = Math.min(100, (userGameCount / 10) * 100);
    
    return (
      <div className="mb-8 bg-indigo-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-indigo-900">
          <Sparkles className="h-5 w-5" />
          Get Personalized Recommendations
        </h2>
        <p className="text-indigo-700 mb-3">
          Add {10 - userGameCount > 0 ? `${10 - userGameCount} more` : 'more'} games to your collection to unlock personalized recommendations!
        </p>
        <div className="w-full bg-indigo-100 rounded-full h-4">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-indigo-500 mt-1 text-right">
          {userGameCount}/10 games
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        Recommended for You
      </h2>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
        {recommendations.map((game) => (
          <div key={game.id} className="relative">
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full z-10 shadow-md">
              Recommended
            </div>
            <GameCard
              game={game}
              onSelect={onSelectGame}
              onSendFriendRequest={onSendFriendRequest}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedGames;

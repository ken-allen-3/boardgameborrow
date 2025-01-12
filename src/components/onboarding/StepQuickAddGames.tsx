import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { addGame } from '../../services/gameService';
import { getGamesByCategory, getCategoryId } from '../../services/boardGameService';
import { BoardGame } from '../../types/boardgame';

interface Game {
  id: string;
  name: string;
  image: string;
  category: string;
  min_players?: number;
  max_players?: number;
  min_playtime?: number;
  max_playtime?: number;
  type?: string;
}

interface Props {
  selectedCategories: string[];
  onComplete: (selectedGames: string[]) => void;
  currentStep: number;
  totalSteps: number;
}

const StepQuickAddGames: React.FC<Props> = ({ 
  selectedCategories, 
  onComplete,
  currentStep,
  totalSteps
}) => {
  const { currentUser } = useAuth();
  const [gamesByCategory, setGamesByCategory] = useState<Record<string, Game[]>>({});
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [categoryExamples, setCategoryExamples] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchGamesForCategories = async () => {
      setLoading(true);
      const gamesMap: Record<string, Game[]> = {};
      const errors: string[] = [];

      await Promise.all(
        selectedCategories.map(async (category) => {
          try {
            const categoryId = getCategoryId(category);
            if (!categoryId) {
              console.error(`No BGG category ID found for ${category}`);
              return;
            }

            const games = await getGamesByCategory(categoryId);
            gamesMap[category] = games.map((game: BoardGame) => ({
              id: game.id,
              name: game.name,
              image: game.image_url,
              category,
              min_players: game.min_players,
              max_players: game.max_players,
              min_playtime: game.min_playtime,
              max_playtime: game.max_playtime,
              type: game.type
            }));
          } catch (error) {
            console.error(`Error fetching games for ${category}:`, error);
            errors.push(category);
          }
        })
      );

      setGamesByCategory(gamesMap);
      setLoading(false);
    };

    const fetchAndCacheGames = async () => {
      if (selectedCategories.length === 0) return;
      
      setLoading(true);
      const gamesMap: Record<string, Game[]> = {};
      const examplesMap: Record<string, string[]> = {};
      const errors: string[] = [];

      await Promise.all(
        selectedCategories.map(async (category) => {
          try {
            const categoryId = getCategoryId(category);
            if (!categoryId) {
              console.error(`No BGG category ID found for ${category}`);
              return;
            }

            const games = await getGamesByCategory(categoryId);
            // Ensure exactly 20 games per category
            const categoryGames = games.slice(0, 20);
            gamesMap[category] = categoryGames.map((game: BoardGame) => ({
              id: game.id,
              name: game.name,
              image: game.image_url,
              category,
              min_players: game.min_players,
              max_players: game.max_players,
              min_playtime: game.min_playtime,
              max_playtime: game.max_playtime,
              type: game.type
            }));

            // Store top 3 games as examples
            examplesMap[category] = categoryGames.slice(0, 3).map(g => g.name);
          } catch (error) {
            console.error(`Error fetching games for ${category}:`, error);
            errors.push(category);
          }
        })
      );

      setGamesByCategory(gamesMap);
      setCategoryExamples(examplesMap);
      setLoading(false);
    };

    fetchAndCacheGames();
  }, [selectedCategories]);

  const toggleGameSelection = (gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleComplete = async () => {
    if (selectedGames.length > 0 && currentUser?.email) {
      setIsAdding(true);
      try {
        // Get all selected games
        const selectedGameObjects = Object.values(gamesByCategory)
          .flat()
          .filter(game => selectedGames.includes(game.id));

        // Process all selected games in parallel
        const results = await Promise.allSettled(
          selectedGameObjects.map(async game => {
            const boardGame: BoardGame = {
              id: game.id,
              name: game.name,
              handle: game.name.toLowerCase().replace(/\s+/g, '-'),
              url: '',
              price: '0',
              price_ca: '0',
              price_uk: '0',
              price_au: '0',
              msrp: 0,
              discount: '0',
              year_published: new Date().getFullYear(),
              min_players: game.min_players || 1,
              max_players: game.max_players || 4,
              min_playtime: game.min_playtime || 30,
              max_playtime: game.max_playtime || 60,
              min_age: 13,
              description: '',
              commentary: '',
              faq: '',
              thumb_url: game.image,
              image_url: game.image,
              mechanics: [],
              categories: [],
              publishers: [],
              designers: [],
              primary_publisher: { id: '0', score: 0, url: '' },
              primary_designer: { id: '0', score: 0, url: '' },
              developers: [],
              related_to: [],
              related_as: [],
              artists: [],
              names: [game.name],
              rules_url: '',
              official_url: '',
              weight_amount: 0,
              weight_units: 'lbs',
              size_height: 0,
              size_depth: 0,
              size_units: 'inches',
              num_user_ratings: 0,
              average_user_rating: 0,
              historical_low_prices: [],
              active: true,
              num_user_complexity_votes: 0,
              average_learning_complexity: 0,
              average_strategy_complexity: 0,
              visits: 0,
              lists: 0,
              mentions: 0,
              links: 0,
              plays: 0,
              rank: 0,
              type: game.type || game.category,
              sku: '',
              upc: ''
            };
            return addGame(currentUser.email!, boardGame);
          })
        );

        onComplete(selectedGames);
      } catch (error) {
        console.error('Error adding games:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsAdding(false);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Add games to your collection</h2>
        <p className="text-gray-600">Select games you own or would like to share with others.</p>
      </div>

      {/* Games by Category */}
      <div className="space-y-6 mb-6">
        {Object.entries(gamesByCategory).map(([category, games]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold capitalize">{category}</h3>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {games.map(game => (
                  <div 
                    key={game.id}
                    className="flex-shrink-0 w-48"
                  >
                    <button
                      onClick={() => toggleGameSelection(game.id)}
                      className={`w-full rounded-lg border-2 p-2 transition-all ${
                        selectedGames.includes(game.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <img 
                        src={game.image} 
                        alt={game.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedGames.includes(game.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedGames.includes(game.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-sm">{game.name}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={selectedGames.length === 0 || isAdding}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          selectedGames.length > 0 && !isAdding
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isAdding ? 'Adding Games...' : 'Add Selected Games'}
      </button>
    </div>
  );
};

export default StepQuickAddGames;

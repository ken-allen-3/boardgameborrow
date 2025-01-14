import React, { useEffect, useState } from 'react';
import { gameDataService, type GameData } from '../../services/gameDataService';
import { addGames } from '../../services/gameService';
import { useAuth } from '../../contexts/AuthContext';

interface StepQuickAddGamesProps {
  selectedCategories: string[];
  onComplete: (selectedGames: GameData[]) => void;
  currentStep: number;
  totalSteps: number;
}

type CategoryKey = keyof GameData['rank'];

const categories: Array<{ key: CategoryKey; label: string }> = [
  { key: 'strategy', label: 'Strategy Games' },
  { key: 'family', label: 'Family Games' },
  { key: 'party', label: 'Party Games' },
  { key: 'thematic', label: 'Thematic Games' },
  { key: 'abstracts', label: 'Abstract Games' },
  { key: 'wargames', label: 'War Games' },
  { key: 'childrens', label: "Children's Games" }
];

function StepQuickAddGames({ selectedCategories, onComplete, currentStep, totalSteps }: StepQuickAddGamesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  // Filter categories to only show selected ones from previous step
  const filteredCategories = categories.filter(cat => selectedCategories.includes(cat.key));

  useEffect(() => {
    const loadGames = async () => {
      await gameDataService.initializeCache();
      
      // Pre-fetch details for all games in selected categories
      for (const category of filteredCategories) {
        const games = gameDataService.getTopGamesForCategory(category.key, 20);
        for (const game of games) {
          await gameDataService.fetchGameDetails(game.id);
        }
      }
      
      setIsLoading(false);
    };
    loadGames();
  }, []);

  const toggleGameSelection = (gameId: string) => {
    setSelectedGames(prev => {
      const index = prev.indexOf(gameId);
      if (index === -1) {
        return [...prev, gameId];
      } else {
        return prev.filter(id => id !== gameId);
      }
    });
  };

  const getTopGames = (category: CategoryKey) => {
    return gameDataService.getTopGamesForCategory(category, 20);
  };

  const formatPlayTime = (game: ReturnType<typeof gameDataService.getGameById>) => {
    if (!game?.playTime) return 'N/A';
    const { min, max } = game.playTime;
    return min === max ? `${min} min` : `${min}-${max} min`;
  };

  const formatPlayerCount = (game: ReturnType<typeof gameDataService.getGameById>) => {
    if (!game?.playerCount) return 'N/A';
    const { min, max } = game.playerCount;
    return min === max ? `${min} players` : `${min}-${max} players`;
  };

  const { currentUser } = useAuth();
  
  const handleComplete = async () => {
    if (!currentUser?.email) {
      console.error('No user email found');
      return;
    }

    // Get full game data for selected games
    const selectedGameData = selectedGames.map(id => gameDataService.getGameById(id)).filter(Boolean) as GameData[];
    
    try {
      // Add all games in a single operation
      await addGames(currentUser.email!, selectedGameData.map(game => ({
        name: game.name,
        image_url: game.image || '',
        min_players: game.playerCount?.min || 1,
        max_players: game.playerCount?.max || 1,
        min_playtime: game.playTime?.min || 0,
        max_playtime: game.playTime?.max || 0,
        type: 'boardgame'
      })));
      onComplete(selectedGameData);
    } catch (error) {
      console.error('Failed to save games:', error);
    }
  };

  return (
    <div className="quick-add-games relative min-h-screen">
      <div className="px-4 pb-32">
        <h2 className="text-2xl font-bold mb-3">Kickstart Your Game Library</h2>
        <p className="text-gray-600 mb-6">Let's add some games you already own to help you start borrowing and lending faster! We've pulled popular games from your favorite categories below. Select any you own, and we'll add them to your library.</p>
        <p className="text-gray-500 text-sm mb-6">No pressure to add everything now—you can update your library anytime!</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map(category => (
              <div key={category.key} className="category-section">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{category.label}</h3>
                  <div className="text-sm text-gray-500">Scroll to see more →</div>
                </div>
                
                <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mx-4 px-4">
                  {getTopGames(category.key).map(game => (
                    <div 
                      key={game.id}
                      className={`game-card flex-none w-72 border rounded-lg p-4 cursor-pointer transition-all duration-200 snap-start hover:shadow-md ${
                        selectedGames.includes(game.id) 
                          ? 'border-brand-blue-600 bg-brand-blue-50 ring-2 ring-brand-blue-600' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => toggleGameSelection(game.id)}
                    >
                      <div className="aspect-w-4 aspect-h-3 mb-3 relative">
                        <img 
                          src={game.image || '/board-game-placeholder.png'}
                          alt={game.name}
                          className="object-cover rounded"
                        />
                        {selectedGames.includes(game.id) && (
                          <div className="absolute top-2 right-2 bg-brand-blue-600 text-white rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-medium mb-2 line-clamp-1">{game.name}</h4>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>🎮 {formatPlayerCount(game)}</p>
                        <p>⏱️ {formatPlayTime(game)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed bottom bar - outside of loading condition */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {selectedGames.length === 0 ? (
            <button
              disabled
              className="bg-gray-100 text-gray-400 px-8 py-3 rounded-lg text-lg font-medium cursor-not-allowed"
            >
              Select Games to Continue
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="bg-brand-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-blue-700 transition-colors duration-200"
            >
              Add {selectedGames.length} {selectedGames.length === 1 ? 'Game' : 'Games'} to Collection
            </button>
          )}
          <div className="text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepQuickAddGames;

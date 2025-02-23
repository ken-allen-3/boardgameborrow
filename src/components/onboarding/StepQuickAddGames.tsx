import React, { useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { addGame } from '../../services/gameService';
import { useAuth } from '../../contexts/AuthContext';
import onboardingGames from '../../config/onboardingGames.json';

interface GameData {
  id: string;
  name: string;
  image: string;
  playerCount: {
    min: number;
    max: number;
  };
  playTime: {
    min: number;
    max: number;
  };
}

interface StepQuickAddGamesProps {
  selectedCategories: string[];
  onComplete: (selectedGames: GameData[]) => void;
  currentStep: number;
  totalSteps: number;
}

const categories = [
  { key: 'strategy', label: 'Strategy Games' },
  { key: 'family', label: 'Family Games' },
  { key: 'party', label: 'Party Games' },
  { key: 'thematic', label: 'Thematic Games' },
  { key: 'abstracts', label: 'Abstract Games' },
  { key: 'wargames', label: 'War Games' }
];

function StepQuickAddGames({ selectedCategories, onComplete, currentStep, totalSteps }: StepQuickAddGamesProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  // Filter categories to only show selected ones from previous step
  const filteredCategories = categories.filter(cat => selectedCategories.includes(cat.key));

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

  const getTopGames = (category: string): GameData[] => {
    return onboardingGames[category as keyof typeof onboardingGames] || [];
  };

  const formatPlayTime = (game: GameData): string => {
    const { min, max } = game.playTime;
    return min === max ? `${min} min` : `${min}-${max} min`;
  };

  const formatPlayerCount = (game: GameData): string => {
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
    const selectedGameData = selectedGames.map(id => {
      for (const category of Object.values(onboardingGames)) {
        const game = category.find(g => g.id === id);
        if (game) return game;
      }
      return null;
    }).filter((game): game is GameData => game !== null);
    
    try {
      // Add games one at a time
      await Promise.all(selectedGameData.map(game => 
        addGame(currentUser.email!, {
          name: game.name,
          image_url: game.image || '',
          min_players: game.playerCount?.min || 1,
          max_players: game.playerCount?.max || 1,
          min_playtime: game.playTime?.min || 0,
          max_playtime: game.playTime?.max || 0,
          type: 'boardgame'
        } as any)
      ));
      onComplete(selectedGameData);
    } catch (error) {
      console.error('Failed to save games:', error);
    }
  };

  return (
    <div className="quick-add-games relative min-h-screen">
      <div className="pb-32">
        <div className="px-4">
          <h2 className="text-2xl font-bold mb-3">Kickstart Your Game Library</h2>
          <p className="text-gray-600 mb-6">Here are some popular games right now. Tap to select any of the games you already own.</p>
          <p className="text-gray-500 text-sm mb-6">No pressure to add everything now—you can update your library anytime!</p>
        </div>
        
          <div className="space-y-12">
            {filteredCategories.map(category => (
              <div key={category.key} className="category-section">
                <div className="flex items-center justify-between mb-4 px-4">
                  <h3 className="text-xl font-semibold">{category.label}</h3>
                  <div className="text-sm text-gray-500">Scroll to see more →</div>
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-4 px-4">
                  {getTopGames(category.key).map(game => (
                    <div 
                      key={game.id}
                      className={`game-card flex-none w-[200px] bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedGames.includes(game.id) 
                          ? 'ring-2 ring-brand-blue-600' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => toggleGameSelection(game.id)}
                    >
                      <div className="relative w-full aspect-[4/3]">
                        <img 
                          src={game.image || '/board-game-placeholder.png'}
                          alt={game.name}
                          className="w-full h-full object-cover rounded"
                        />
                        {selectedGames.includes(game.id) && (
                          <div className="absolute top-2 right-2 bg-brand-blue-600 text-white rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-lg font-semibold mb-2 line-clamp-1">{game.name}</h4>
                        
                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{formatPlayerCount(game)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatPlayTime(game)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Fixed bottom bar - outside of loading condition */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {selectedGames.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-gray-600 text-center sm:text-left">Don't see your games? You can add them later via search or photo.</p>
              <button
                onClick={() => onComplete([])}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
              >
                Skip for Now
              </button>
            </div>
          ) : (
            <button
              onClick={handleComplete}
              className="w-full sm:w-auto bg-brand-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-brand-blue-700 transition-colors duration-200"
            >
              Add {selectedGames.length} {selectedGames.length === 1 ? 'Game' : 'Games'} to Collection
            </button>
          )}
          <div className="text-gray-500 text-center sm:text-right">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepQuickAddGames;

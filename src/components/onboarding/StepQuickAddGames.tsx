import React, { useState, useEffect } from 'react';

interface Game {
  id: string;
  name: string;
  image: string;
  category: string;
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
  const [gamesByCategory, setGamesByCategory] = useState<Record<string, Game[]>>({});
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual BGG API call
    const mockGames: Record<string, Game[]> = {
      strategy: [
        { id: '1', name: 'Catan', image: '/board-game-placeholder.png', category: 'strategy' },
        { id: '2', name: 'Ticket to Ride', image: '/board-game-placeholder.png', category: 'strategy' },
      ],
      family: [
        { id: '3', name: 'Monopoly', image: '/board-game-placeholder.png', category: 'family' },
        { id: '4', name: 'Clue', image: '/board-game-placeholder.png', category: 'family' },
      ],
      party: [
        { id: '5', name: 'Codenames', image: '/board-game-placeholder.png', category: 'party' },
        { id: '6', name: 'Dixit', image: '/board-game-placeholder.png', category: 'party' },
      ],
    };

    // Filter games based on selected categories
    const filteredGames = Object.fromEntries(
      Object.entries(mockGames).filter(([category]) => 
        selectedCategories.includes(category)
      )
    );

    setGamesByCategory(filteredGames);
    setLoading(false);
  }, [selectedCategories]);

  const toggleGameSelection = (gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleComplete = () => {
    if (selectedGames.length > 0) {
      onComplete(selectedGames);
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
        disabled={selectedGames.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          selectedGames.length > 0
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Add Selected Games
      </button>
    </div>
  );
};

export default StepQuickAddGames;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GameCategory {
  id: string;
  name: string;
  icon?: string; // Will be added when we have icons
}

interface Props {
  onNext: (selectedCategories: string[]) => void;
  currentStep: number;
  totalSteps: number;
}

const StepGameTypes: React.FC<Props> = ({ onNext, currentStep, totalSteps }) => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual BGG API call
    const mockCategories = [
      { id: 'strategy', name: 'Strategy' },
      { id: 'family', name: 'Family' },
      { id: 'party', name: 'Party Games' },
      { id: 'thematic', name: 'Thematic' },
      { id: 'wargames', name: 'War Games' },
      { id: 'abstract', name: 'Abstract' },
    ];
    setCategories(mockCategories);
    setLoading(false);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (selectedCategories.length > 0) {
      onNext(selectedCategories);
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
        <h2 className="text-2xl font-bold mb-2">What types of games do you love?</h2>
        <p className="text-gray-600">Select the types of games you enjoy! Next, we'll help you build your game collection.</p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCategories.includes(category.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedCategories.includes(category.id)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedCategories.includes(category.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-medium">{category.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={selectedCategories.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          selectedCategories.length > 0
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default StepGameTypes;

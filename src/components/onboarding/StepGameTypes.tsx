import React, { useState } from 'react';
import type { GameData } from '../../services/gameDataService';

interface StepGameTypesProps {
  onNext: (categories: string[]) => void;
  currentStep: number;
  totalSteps: number;
}

type CategoryKey = keyof GameData['rank'];

const categories = [
  { 
    key: 'strategy',
    label: 'Strategy',
    icon: '⚙️',
    description: 'Like Catan, Risk, Scythe'
  },
  { 
    key: 'family',
    label: 'Family',
    icon: '👨‍👩‍👧‍👦',
    description: 'Like Monopoly, Ticket to Ride, Carcassonne'
  },
  { 
    key: 'party',
    label: 'Party Games',
    icon: '🎉',
    description: 'Like Codenames, Dixit, Just One'
  },
  { 
    key: 'thematic',
    label: 'Thematic',
    icon: '🔒',
    description: 'Like Pandemic, Arkham Horror, Gloomhaven'
  },
  { 
    key: 'abstracts',
    label: 'Abstract',
    icon: '🚩',
    description: 'Like Chess, Go, Azul'
  },
  { 
    key: 'wargames',
    label: 'War Games',
    icon: '⚔️',
    description: 'Like Axis & Allies, Twilight Struggle'
  }
] as const;

function StepGameTypes({ onNext, currentStep, totalSteps }: StepGameTypesProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const toggleTypeSelection = (type: CategoryKey) => {
    const typeStr = String(type);
    setSelectedTypes(prev => 
      prev.includes(typeStr) 
        ? prev.filter(t => t !== typeStr)
        : [...prev, typeStr]
    );
  };

  return (
    <div className="game-types h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-1">Tell us a bit about yourself:</h2>
      <h3 className="text-lg font-semibold mb-1">What types of games do you usually like to play?</h3>
      <p className="text-gray-600 mb-2 text-sm">We'll use this information to kickstart your game library, and recommend games you can borrow from friends.</p>
      
      <div className="grid grid-cols-2 gap-2">
        {categories.map(category => (
          <div 
            key={category.key}
            className={`relative bg-white rounded-lg p-2 h-28 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg active:scale-95 border-2 transform ${
              selectedTypes.includes(String(category.key))
                ? 'border-blue-500 shadow-md' 
                : 'border-gray-200'
            }`}
            onClick={() => toggleTypeSelection(category.key)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleTypeSelection(category.key);
              }
            }}
          >
            <div className="flex flex-col items-center h-full">
              <div className="text-xl mb-0.5">{category.icon}</div>
              <h3 className="text-sm font-semibold mb-1">{category.label}</h3>
              <div className="text-xs text-gray-500 text-center">
                {category.description}
              </div>
              
              <div 
                className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-in-out transform ${
                  selectedTypes.includes(String(category.key))
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300'
                }`}
              >
                {selectedTypes.includes(String(category.key)) && (
                  <svg 
                    className="w-3 h-3 text-white"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 p-2 bg-white border-t mt-2 flex justify-between items-center">
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
            selectedTypes.length > 0
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400'
          }`}
          onClick={() => selectedTypes.length > 0 && onNext(selectedTypes)}
          disabled={selectedTypes.length === 0}
        >
          Continue
        </button>
        <div className="text-gray-600 font-medium">
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    </div>
  );
}

export default StepGameTypes;

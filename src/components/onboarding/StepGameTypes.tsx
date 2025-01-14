<<<<<<< HEAD
import React, { useState } from 'react';
import type { GameData } from '../../services/gameDataService';

interface StepGameTypesProps {
  onNext: (categories: string[]) => void;
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GameCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface Props {
  onNext: (selectedCategories: string[]) => void;
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8
  currentStep: number;
  totalSteps: number;
}

<<<<<<< HEAD
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
      <h2 className="text-2xl font-bold mb-2">Tell us a bit about yourself</h2>
      <p className="text-gray-600 mb-4 text-sm">What types of games do you usually like to play? We'll use this information to kickstart your game library, and recommend games you can borrow from friends.</p>
      
      <div className="grid grid-cols-2 gap-3 flex-1">
        {categories.map(category => (
          <div 
            key={category.key}
            className={`relative bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg active:scale-95 border-2 transform ${
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
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl mb-1">{category.icon}</div>
              <h3 className="text-base font-semibold mb-1">{category.label}</h3>
              
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
            
            <div className="mt-1 text-xs text-gray-500">
              {category.description}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 p-3 bg-white border-t mt-3 flex justify-between items-center">
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
=======
const StepGameTypes: React.FC<Props> = ({ onNext, currentStep, totalSteps }) => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual BGG API call
    const mockCategories = [
      { 
        id: 'strategy', 
        name: 'Strategy',
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        )
      },
      { 
        id: 'family', 
        name: 'Family',
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      { 
        id: 'party', 
        name: 'Party Games',
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
        )
      },
      { 
        id: 'thematic', 
        name: 'Thematic',
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      },
      { 
        id: 'wargames', 
        name: 'War Games',
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        )
      },
      { 
        id: 'abstract', 
        name: 'Abstract',
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        )
      },
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
            <div className="flex flex-col items-center space-y-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                selectedCategories.includes(category.id)
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.icon}
              </div>
              <div className="text-center space-y-1">
                <span className="font-medium">{category.name}</span>
                <p className="text-sm text-gray-500">
                  {category.id === 'strategy' && 'Like Catan, Risk, Scythe'}
                  {category.id === 'family' && 'Like Monopoly, Ticket to Ride, Carcassonne'}
                  {category.id === 'party' && 'Like Codenames, Dixit, Just One'}
                  {category.id === 'thematic' && 'Like Pandemic, Arkham Horror, Gloomhaven'}
                  {category.id === 'wargames' && 'Like Axis & Allies, Twilight Struggle'}
                  {category.id === 'abstract' && 'Like Chess, Go, Azul'}
                </p>
                <div className={`mt-2 w-6 h-6 mx-auto rounded-full border-2 flex items-center justify-center ${
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
              </div>
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
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8

export default StepGameTypes;

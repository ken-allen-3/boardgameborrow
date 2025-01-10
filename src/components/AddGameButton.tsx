import React, { useState } from 'react';
import { Plus, Camera, Search } from 'lucide-react';
import { useTutorial } from './tutorial/TutorialProvider';

interface AddGameButtonProps {
  onCameraClick: () => void;
  onSearchClick: () => void;
}

const AddGameButton: React.FC<AddGameButtonProps> = ({ onCameraClick, onSearchClick }) => {
  const [showOptions, setShowOptions] = useState(false);
  const { pauseTutorial } = useTutorial();

  const handleSearchClick = () => {
    pauseTutorial();
    onSearchClick();
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition w-full"
        data-tutorial="add-game-button"
      >
        <Plus className="h-5 w-5" />
        <span>Add Game</span>
      </button>

      {showOptions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <style>
            {`
              @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .ai-gradient {
                background: linear-gradient(270deg, #ff0080, #7928ca, #4299e1);
                background-size: 200% 200%;
                animation: gradient 3s ease infinite;
              }
              @keyframes sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); }
                50% { transform: scale(1.2) rotate(15deg); }
              }
            `}
          </style>
          <button
            onClick={() => {
              pauseTutorial();
              onCameraClick();
              setShowOptions(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition relative overflow-hidden group"
            data-tutorial="camera-button"
          >
            <div className="absolute inset-0 ai-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <svg className="w-5 h-5 text-indigo-500" style={{ animation: 'sparkle 2s ease-in-out infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" 
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  AI Photo Detection
                </div>
                <div className="text-sm text-gray-500">Magically identify your games</div>
              </div>
            </div>
          </button>
          <button
            onClick={handleSearchClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-t"
            data-tutorial="search-button"
          >
            <Search className="h-5 w-5 text-gray-400" />
            <div className="text-left">
              <div className="font-medium">Search Game</div>
              <div className="text-sm text-gray-500">Find by name in database</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddGameButton;

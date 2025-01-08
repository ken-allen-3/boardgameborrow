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
          <button
            onClick={() => {
              pauseTutorial();
              onCameraClick();
              setShowOptions(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            data-tutorial="camera-button"
          >
            <Camera className="h-5 w-5 text-gray-400" />
            <div className="text-left">
              <div className="font-medium">Photo Detection</div>
              <div className="text-sm text-gray-500">Scan games with your camera</div>
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

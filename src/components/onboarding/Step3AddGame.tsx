import React, { useState } from 'react';
import { Camera, Search, ArrowRight, Loader2, Plus } from 'lucide-react';
import { BoardGame } from '../../types/boardgame';
import CameraCapture from '../CameraCapture';
import { analyzeShelfImage, findMatchingGames, DetectedGame } from '../../services/visionService';
import { searchGames } from '../../services/boardGameService';

interface Step3AddGameProps {
  onNext: () => void;
  onBack: () => void;
}

interface ValidationErrors {
  name?: string;
  year?: string;
  players?: string;
  playtime?: string;
  submit?: string;
}

function Step3AddGame({ onNext, onBack }: Step3AddGameProps) {
  const [mode, setMode] = useState<'select' | 'camera' | 'manual'>('select');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [detectedGames, setDetectedGames] = useState<Map<string, BoardGame[]>>();
  const [selectedGame, setSelectedGame] = useState<BoardGame | null>(null);
  const [manualSearch, setManualSearch] = useState('');
  const [searchResults, setSearchResults] = useState<BoardGame[]>([]);
  const [manualForm, setManualForm] = useState<Partial<BoardGame>>({
    name: '',
    year_published: new Date().getFullYear(),
    min_players: 1,
    max_players: 4,
    min_playtime: 30,
    max_playtime: 60,
    min_age: 8
  });

  const handlePhotoCapture = async (photoData: string) => {
    setLoading(true);
    try {
      const detected = await analyzeShelfImage(photoData);
      const matches = await findMatchingGames(detected);
      setDetectedGames(matches);
      setMode('select');
    } catch (error: any) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = async (query: string) => {
    setManualSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { items } = await searchGames(query);
      setSearchResults(items);
    } catch (error: any) {
      console.error('Search error:', error);
    }
  };

  const validateManualForm = () => {
    const newErrors: ValidationErrors = {};
    
    if (!manualForm.name || manualForm.name.length < 2) {
      newErrors.name = 'Game name must be at least 2 characters';
    }
    if (manualForm.year_published && (manualForm.year_published < 1900 || manualForm.year_published > new Date().getFullYear())) {
      newErrors.year = 'Invalid year';
    }
    if (manualForm.min_players && manualForm.max_players && manualForm.min_players > manualForm.max_players) {
      newErrors.players = 'Minimum players cannot be greater than maximum';
    }
    if (manualForm.min_playtime && manualForm.max_playtime && manualForm.min_playtime > manualForm.max_playtime) {
      newErrors.playtime = 'Minimum playtime cannot be greater than maximum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (selectedGame) {
      // Submit selected game from detection or search
      onNext();
    } else if (mode === 'manual' && validateManualForm()) {
      // Submit manual form
      onNext();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '66.66%' }}></div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          Add Your First Game
        </h1>
        <p className="text-lg text-indigo-600">
          Let's start building your game collection
        </p>
      </div>

      {mode === 'select' && !detectedGames && (
        <div className="space-y-4">
          <button
            onClick={() => setMode('camera')}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            <Camera className="w-6 h-6" />
            <span className="text-lg">Scan Games with AI</span>
          </button>
          
          <div className="text-center text-gray-500 text-sm">or</div>
          
          <button
            onClick={() => setMode('manual')}
            className="w-full flex items-center justify-center gap-3 border-2 border-indigo-600 text-indigo-600 py-4 px-6 rounded-lg hover:bg-indigo-50 transition"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Enter Game Details Manually</span>
          </button>
        </div>
      )}

      {mode === 'camera' && (
        <CameraCapture
          onClose={() => setMode('select')}
          onCapture={handlePhotoCapture}
        />
      )}

      {mode === 'select' && detectedGames && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Detected Games
          </h3>
          
          {Array.from(detectedGames.entries()).map(([title, matches]) => (
            <div key={title} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">
                Detected: {title}
              </h4>
              <div className="space-y-2">
                {matches.map(game => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition ${
                      selectedGame?.id === game.id
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {game.thumb_url && (
                      <img
                        src={game.thumb_url}
                        alt={game.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-gray-500">
                        {game.year_published} • {game.min_players}-{game.max_players} players
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search for a Game
            </label>
            <div className="relative">
              <input
                type="text"
                value={manualSearch}
                onChange={(e) => handleManualSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg divide-y">
                {searchResults.map(game => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setSelectedGame(game);
                      setSearchResults([]);
                      setManualSearch('');
                    }}
                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition"
                  >
                    {game.thumb_url && (
                      <img
                        src={game.thumb_url}
                        alt={game.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-gray-500">
                        {game.year_published} • {game.min_players}-{game.max_players} players
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!selectedGame && (
            <>
              <div className="text-center text-gray-500 text-sm">or</div>

              {/* Manual Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Game Name
                  </label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Published
                    </label>
                    <input
                      type="number"
                      value={manualForm.year_published}
                      onChange={(e) => setManualForm(prev => ({ ...prev, year_published: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.year ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                    {errors.year && (
                      <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Age
                    </label>
                    <input
                      type="number"
                      value={manualForm.min_age}
                      onChange={(e) => setManualForm(prev => ({ ...prev, min_age: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Players
                    </label>
                    <input
                      type="number"
                      value={manualForm.min_players}
                      onChange={(e) => setManualForm(prev => ({ ...prev, min_players: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.players ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Players
                    </label>
                    <input
                      type="number"
                      value={manualForm.max_players}
                      onChange={(e) => setManualForm(prev => ({ ...prev, max_players: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.players ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {errors.players && (
                  <p className="text-red-500 text-sm">{errors.players}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Playtime (min)
                    </label>
                    <input
                      type="number"
                      value={manualForm.min_playtime}
                      onChange={(e) => setManualForm(prev => ({ ...prev, min_playtime: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.playtime ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Playtime (min)
                    </label>
                    <input
                      type="number"
                      value={manualForm.max_playtime}
                      onChange={(e) => setManualForm(prev => ({ ...prev, max_playtime: parseInt(e.target.value) }))}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.playtime ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {errors.playtime && (
                  <p className="text-red-500 text-sm">{errors.playtime}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Selected Game Preview */}
      {selectedGame && (
        <div className="mt-6 p-4 border-2 border-indigo-100 rounded-lg bg-indigo-50">
          <div className="flex items-start gap-4">
            {selectedGame.thumb_url && (
              <img
                src={selectedGame.thumb_url}
                alt={selectedGame.name}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedGame.name}</h3>
              <p className="text-gray-600">
                {selectedGame.year_published} • {selectedGame.min_players}-{selectedGame.max_players} players • {selectedGame.min_playtime}-{selectedGame.max_playtime} min
              </p>
              <button
                onClick={() => setSelectedGame(null)}
                className="text-indigo-600 text-sm hover:text-indigo-700 mt-2"
              >
                Change Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <button
          onClick={handleSubmit}
          disabled={loading || (!selectedGame && mode === 'select') || (mode === 'manual' && !selectedGame && Object.keys(errors).length > 0)}
          className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg transition font-semibold ${
            loading || (!selectedGame && mode === 'select') || (mode === 'manual' && !selectedGame && Object.keys(errors).length > 0)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
        >
          Go Back
        </button>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mt-4 text-red-500 text-sm text-center">{errors.submit}</div>
      )}
    </div>
  );
}

export default Step3AddGame;

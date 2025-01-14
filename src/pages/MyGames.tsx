import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Search, ImageOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rateGame } from '../services/ratingService';
import CameraCapture from '../components/CameraCapture';
import LoadingScreen from '../components/LoadingScreen';
import GameDetectionResults from '../components/GameDetectionResults';
import GameSearchModal from '../components/GameSearchModal';
import { BoardGame } from '../types/boardgame';
import { Game, loadUserGames, addGame, deleteGame } from '../services/gameService';
import GameList from '../components/GameList';
import AddGameButton from '../components/AddGameButton';
import ErrorMessage from '../components/ErrorMessage';

const MyGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  const [showCamera, setShowCamera] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      loadGames();
    }
  }, [currentUser]);

  const loadGames = async () => {
    if (!currentUser?.email) return;

    try {
      const loadedGames = await loadUserGames(currentUser.email);
      setGames(loadedGames);
      setError(null);
    } catch (err) {
      setError('Failed to load your games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (photoData: string) => {
    setShowCamera(false);
    setIsProcessing(true);
    setCapturedPhoto(photoData);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  const handleGameSelect = async (selectedGames: BoardGame[]) => {
    if (!currentUser?.email) return;

    try {
      // Add games sequentially to maintain order and handle errors
      for (const game of selectedGames) {
        await addGame(currentUser.email, game);
      }
      await loadGames();
      setCapturedPhoto(null);
      setShowSearch(false);
      setError(null);
    } catch (err) {
      setError('Failed to add one or more games. Please try again.');
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<{id: string, title: string} | null>(null);

  const handleDeleteGame = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setGameToDelete({ id: gameId, title: game.title });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!currentUser?.email || !gameToDelete) return;

    try {
      await deleteGame(currentUser.email, gameToDelete.id);
      await loadGames();
      setError(null);
    } catch (err) {
      setError('Failed to delete game. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setGameToDelete(null);
    }
  };

  const handleRateGame = async (gameId: string, rating: number) => {
    if (!currentUser?.email) return;

    try {
      await rateGame(currentUser.email, gameId, rating);
      await loadGames(); // Reload games to get updated ratings
      setError(null);
    } catch (err) {
      setError('Failed to rate game. Please try again.');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading your games..." />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            My Games
            {games.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({games.length} {games.length === 1 ? 'game' : 'games'})
              </span>
            )}
          </h1>
        </div>

        {error && <ErrorMessage message={error} />}

        <AddGameButton
          onCameraClick={() => setShowCamera(true)}
          onSearchClick={() => setShowSearch(true)}
        />
      </div>

      <GameList 
        games={games} 
        onDeleteGame={handleDeleteGame}
        onRateGame={handleRateGame}
      />

      {showCamera && (
        <CameraCapture
          onClose={() => setShowCamera(false)}
          onCapture={handleCapture}
        />
      )}

      {showSearch && (
        <GameSearchModal
          onClose={() => setShowSearch(false)}
          onGameSelect={handleGameSelect}
        />
      )}

      {isProcessing && <LoadingScreen />}

      {!isProcessing && capturedPhoto && (
        <GameDetectionResults
          photoData={capturedPhoto}
          onClose={() => setCapturedPhoto(null)}
          onGameSelect={handleGameSelect}
        />
      )}

      {/* Delete Confirmation Alert */}
      {showDeleteConfirm && gameToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Remove Game
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-medium">{gameToDelete.title}</span>?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setGameToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGames;

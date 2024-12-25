import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Search, ImageOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial } from '../components/tutorial/TutorialProvider';
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

const MyGames = () => {  // Removed React.FC type
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { resumeTutorial } = useTutorial();

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

  const handleGameSelect = async (game: BoardGame) => {
    if (!currentUser?.email) return;

    try {
      await addGame(currentUser.email, game);
      await loadGames();
      setCapturedPhoto(null);
      setShowSearch(false);
      setError(null);
      
      // Resume tutorial after adding first game
      if (games.length === 0) {
        resumeTutorial();
      }
    } catch (err) {
      setError('Failed to add game. Please try again.');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!currentUser?.email || !window.confirm('Are you sure you want to remove this game?')) return;

    try {
      await deleteGame(currentUser.email, gameId);
      await loadGames();
      setError(null);
    } catch (err) {
      setError('Failed to delete game. Please try again.');
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
    </div>
  );
};

export default MyGames;  // Added default export

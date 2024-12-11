import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Loader2, AlertCircle, Check } from 'lucide-react';
import { BoardGame } from '../types/boardgame';
import { analyzeShelfImage, findMatchingGames, DetectedGame } from '../services/visionService';

interface GameDetectionResultsProps {
  photoData: string;
  onClose: () => void;
  onGameSelect: (game: BoardGame) => void;
}

function GameDetectionResults({ photoData, onClose, onGameSelect }: GameDetectionResultsProps) {
  const [detectedGames, setDetectedGames] = useState<DetectedGame[]>([]);
  const [gameMatches, setGameMatches] = useState<Map<string, BoardGame[]>>(new Map());
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('Analyzing image...');

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      setProcessingStep('Analyzing image...');
      const detected = await analyzeShelfImage(photoData);
      setDetectedGames(detected);
      
      setProcessingStep('Finding matches...');
      const matches = await findMatchingGames(detected);
      setGameMatches(matches);
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = async (game: BoardGame) => {
    try {
      await onGameSelect(game);
      setSelectedGames(prev => {
        const next = new Set(prev);
        next.add(game.id);
        return next;
      });
    } catch (err) {
      setError('Failed to add game. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Error</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Detected Games</h2>
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600">{processingStep}</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden mb-6 relative">
              <img
                src={photoData}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
              {detectedGames.map((game, index) => (
                game.boundingBox && (
                  <div
                    key={index}
                    className="absolute border-2 border-indigo-500 bg-indigo-500/10"
                    style={{
                      left: `${game.boundingBox.x}px`,
                      top: `${game.boundingBox.y}px`,
                      width: `${game.boundingBox.width}px`,
                      height: `${game.boundingBox.height}px`
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
                      {game.title} ({Math.round(game.confidence * 100)}%)
                    </div>
                  </div>
                )
              ))}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Select the games you want to add to your collection:
            </p>

            {detectedGames.map((detected) => {
              const matches = gameMatches.get(detected.title) || [];
              return (
                <div key={detected.title} className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    Detected: {detected.title}
                    <span className="ml-2 text-sm text-gray-500">
                      ({Math.round(detected.confidence * 100)}% confidence)
                    </span>
                  </h3>
                  
                  <div className="space-y-2">
                    {matches.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleGameSelect(game)}
                        disabled={selectedGames.has(game.id)}
                        className="w-full bg-white border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <img
                          src={game.thumb_url}
                          alt={game.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/board-game-placeholder.png';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold">{game.name}</h3>
                          <p className="text-sm text-gray-600">
                            {game.year_published} · {game.min_players}-{game.max_players} Players
                          </p>
                          {game.rank > 0 && (
                            <p className="text-xs text-indigo-600">
                              BGG Rank: #{game.rank}
                            </p>
                          )}
                        </div>
                        {selectedGames.has(game.id) ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameDetectionResults;
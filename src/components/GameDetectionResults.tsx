import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Loader2, AlertCircle, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { BoardGame } from '../types/boardgame';
import { analyzeShelfImage, findMatchingGames, DetectedGame, VisionServiceError, manualGameSearch } from '../services/visionService';

interface GameDetectionResultsProps {
  photoData: string;
  onClose: () => void;
  onGameSelect: (games: BoardGame[]) => void;
}

function GameDetectionResults({ photoData, onClose, onGameSelect }: GameDetectionResultsProps) {
  const [detectedGames, setDetectedGames] = useState<DetectedGame[]>([]);
  const [selectedGames, setSelectedGames] = useState<Map<string, BoardGame>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('Analyzing image...');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    url?: string;
    requestHeaders?: Record<string, string>;
    responseStatus?: number;
    responseHeaders?: Record<string, string>;
    rawResponse?: string;
  }>({});
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [manualSearchQuery, setManualSearchQuery] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState<BoardGame[]>([]);
  const [manualSearchLoading, setManualSearchLoading] = useState(false);

  useEffect(() => {
    processImage();
  }, []);

  const processImage = async () => {
    try {
      setProcessingStep('Analyzing image...');
      const detected = await analyzeShelfImage(photoData);
      
      setProcessingStep('Finding matches...');
      const processedGames = await findMatchingGames(detected);
      setDetectedGames(processedGames);
    } catch (err: any) {
      if (err instanceof VisionServiceError) {
        switch (err.code) {
          case 'NO_GAMES_DETECTED':
          case 'LOW_CONFIDENCE':
            setError(`${err.message}. Try manual search instead.`);
            setShowManualSearch(true);
            break;
          default:
            setError(err.message);
        }
        setDebugInfo(err.details || {});
      } else {
        setError(err.message || 'Failed to process image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (game: BoardGame) => {
    setSelectedGames(prev => {
      const next = new Map(prev);
      if (next.has(game.id)) {
        next.delete(game.id);
      } else {
        next.set(game.id, game);
      }
      return next;
    });
  };

  const handleDone = () => {
    if (selectedGames.size > 0) {
      onGameSelect(Array.from(selectedGames.values()));
      onClose();
    }
  };

  const handleManualSearch = async (query: string) => {
    setManualSearchQuery(query);
    if (query.length < 2) {
      setManualSearchResults([]);
      return;
    }

    setManualSearchLoading(true);
    try {
      const results = await manualGameSearch(query);
      setManualSearchResults(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setManualSearchLoading(false);
    }
  };

  if (error && !showManualSearch) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Error</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-lg mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-600 mb-4">
              <p className="font-semibold mb-2">Failed to process image</p>
              <pre className="text-left text-sm bg-red-50 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                {error}
              </pre>
            </div>

            <div className="mb-4">
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <span className="font-medium">Debug Information</span>
                {showDebugInfo ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {showDebugInfo && (
                <div className="mt-2 space-y-2">
                  {debugInfo.url && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-700">Request URL:</div>
                      <div className="text-sm break-all">{debugInfo.url}</div>
                    </div>
                  )}
                  
                  {debugInfo.responseStatus && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-700">Response Status:</div>
                      <div className="text-sm">{debugInfo.responseStatus}</div>
                    </div>
                  )}

                  {debugInfo.responseHeaders && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-700">Response Headers:</div>
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(debugInfo.responseHeaders, null, 2)}
                      </pre>
                    </div>
                  )}

                  {debugInfo.rawResponse && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-700">Raw Response:</div>
                      <pre className="text-sm overflow-auto whitespace-pre-wrap">
                        {debugInfo.rawResponse}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowManualSearch(true)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Search Manually
              </button>

              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showManualSearch) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Search for Games</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDone}
              disabled={selectedGames.size === 0}
              className={`px-4 py-2 rounded-lg transition ${
                selectedGames.size > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Done ({selectedGames.size})
            </button>
            <button onClick={onClose} className="p-2">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-lg mx-auto space-y-4">
            <div className="relative">
              <input
                type="text"
                value={manualSearchQuery}
                onChange={(e) => handleManualSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {manualSearchLoading ? (
                <Loader2 className="absolute left-3 top-2.5 w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              {manualSearchResults.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="w-full bg-white border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition"
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
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Detected Games</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDone}
            disabled={selectedGames.size === 0}
            className={`px-4 py-2 rounded-lg transition ${
              selectedGames.size > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Done ({selectedGames.size})
          </button>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
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

            {detectedGames.map((detected) => (
              <div key={detected.title} className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center justify-between">
                  <span>
                    Detected: {detected.title}
                    <span className="ml-2 text-sm text-gray-500">
                      ({Math.round(detected.confidence * 100)}% confidence)
                    </span>
                  </span>
                  {detected.status === 'rejected' && (
                    <span className="text-sm text-red-500">No matches found</span>
                  )}
                </h3>
                
                <div className="space-y-2">
                  {detected.matches?.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleGameSelect(game)}
                      className="w-full bg-white border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition"
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
            ))}

            <button
              onClick={() => setShowManualSearch(true)}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
            >
              <Search className="w-5 h-5" />
              <span>Can't find your game? Try manual search</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameDetectionResults;

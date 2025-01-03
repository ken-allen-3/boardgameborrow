import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, AlertCircle, Star } from 'lucide-react';
import { searchGames } from '../services/boardGameService';
import { BoardGame } from '../types/boardgame';
import { useDebounce } from '../hooks/useDebounce';

interface GameSearchModalProps {
  onClose: () => void;
  onGameSelect: (game: BoardGame) => void;
}

function GameSearchModal({ onClose, onGameSelect }: GameSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<(BoardGame & { pageId: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(true);
    } else {
      setResults([]);
      setHasMore(false);
    }
  }, [debouncedSearch]);

  const handleSearch = async (newSearch = true) => {
    if (!debouncedSearch.trim()) return;

    if (newSearch) {
      setLoading(true);
      setError(null);
      setResults([]);
      setPage(1);
      setHasMore(false);
      setRetryCount(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = newSearch ? 1 : page;
      const games = await searchGames(debouncedSearch, currentPage);
      
      // Add a unique pageId to each game
      const gamesWithPageIds = games.items.map(game => ({
        ...game,
        pageId: `${game.id}-page${currentPage}`
      }));

      if (newSearch) {
        setResults(gamesWithPageIds);
      } else {
        setResults(prev => [...prev, ...gamesWithPageIds]);
      }
      
      setHasMore(games.hasMore);
      if (!newSearch) {
        setPage(prev => prev + 1);
      }
      
      if (games.items.length === 0 && newSearch) {
        setError('No games found matching your search.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while searching games.';
      
      // If we haven't exceeded retry attempts, try again
      if (retryCount < 2 && errorMessage.includes('temporarily unavailable')) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleSearch(newSearch), 2000 * Math.pow(2, retryCount));
        setError('Search request failed. Retrying...');
        return;
      }

      setError(errorMessage);
      if (newSearch) {
        setResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md mt-16">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Search Games</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter game name..."
              className="w-full pl-4 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            {loading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600 py-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {results.map((game) => (
              <button
                key={game.pageId}
                onClick={() => onGameSelect(game)}
                className="w-full bg-white border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition text-left"
              >
                <img
                  src={game.thumb_url}
                  alt={game.name}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/board-game-placeholder.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{game.name}</h3>
                  <p className="text-sm text-gray-600">
                    {game.year_published} · {game.min_players}-{game.max_players} Players
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    {game.rank > 0 && (
                      <p className="text-xs text-indigo-600">
                        BGG Rank: #{game.rank}
                      </p>
                    )}
                    {game.average_user_rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-yellow-600">
                        <Star className="h-3 w-3 fill-yellow-500" />
                        <span>{formatRating(game.average_user_rating)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {hasMore && !loading && (
              <button
                onClick={() => handleSearch(false)}
                disabled={loadingMore}
                className="w-full py-3 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              >
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                ) : (
                  'Load more results'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameSearchModal;
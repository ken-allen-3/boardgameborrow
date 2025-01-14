import React, { useState } from 'react';
import { X, Search, Dice6, User } from 'lucide-react';
import { Game } from '../../services/gameService';

interface SuggestGamesModalProps {
  onClose: () => void;
  games: Game[];
  onSubmit: (selectedGames: string[]) => void;
}

function SuggestGamesModal({ onClose, games, onSubmit }: SuggestGamesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupGamesByOwner = (games: Game[]) => {
    const gamesByOwner = new Map<string, Game[]>();
    games.forEach(game => {
      const owner = game.owner || 'Unknown';
      if (!gamesByOwner.has(owner)) {
        gamesByOwner.set(owner, []);
      }
      gamesByOwner.get(owner)!.push(game);
    });
    return gamesByOwner;
  };

  const gamesByOwner = groupGamesByOwner(filteredGames);
  const toggleGame = (gameId: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
    } else {
      newSelected.add(gameId);
    }
    setSelectedGames(newSelected);
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedGames));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md my-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Suggest Games</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your games..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {gamesByOwner.size > 0 ? (
              Array.from(gamesByOwner.entries()).map(([owner, games]) => (
                <div key={owner} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{owner === 'Unknown' ? 'Games' : `${owner.split('@')[0]}'s Games`}</span>
                  </div>
                  {games.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedGames.has(game.id)}
                    onChange={() => toggleGame(game.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/board-game-placeholder.png';
                      }}
                    />
                    <div>
                      <div className="font-medium">{game.title}</div>
                      {game.minPlayers && game.maxPlayers && (
                        <div className="text-sm text-gray-500">
                          {game.minPlayers}-{game.maxPlayers} players
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Dice6 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No games found matching your search.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedGames.size === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Suggest Selected Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuggestGamesModal;
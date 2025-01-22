import React, { useState } from 'react';
import { X, Calendar, MapPin, Users } from 'lucide-react';
import { Game } from '../../services/gameService';
import { GameNight } from '../../types/gameNight';
import CoverImageSelector from './CoverImageSelector';

interface EditGameNightModalProps {
  gameNight: GameNight;
  onClose: () => void;
  onSubmit: (updates: Partial<GameNight>) => Promise<void>;
  userGames: Game[];
}

function EditGameNightModal({ gameNight, onClose, onSubmit, userGames }: EditGameNightModalProps) {
  const [title, setTitle] = useState(gameNight.title);
  const [coverImage, setCoverImage] = useState(gameNight.coverImage || '');
  const [date, setDate] = useState(gameNight.date);
  const [location, setLocation] = useState(gameNight.location);
  const [description, setDescription] = useState(gameNight.description || '');
  const [maxPlayers, setMaxPlayers] = useState<number | undefined>(gameNight.maxPlayers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const errors = [];
    if (!title.trim()) {
      errors.push('Title is required');
    }
    if (!date) {
      errors.push('Date and time are required');
    }
    if (!location.trim()) {
      errors.push('Location is required');
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    try {
      // Only include changed fields in updates
      const updates: Partial<GameNight> = {};
      
      if (title !== gameNight.title) updates.title = title.trim();
      if (coverImage !== gameNight.coverImage) updates.coverImage = coverImage;
      if (date !== gameNight.date) updates.date = date;
      if (location !== gameNight.location) updates.location = location.trim();
      if (description !== gameNight.description) updates.description = description.trim();
      if (maxPlayers !== gameNight.maxPlayers) updates.maxPlayers = maxPlayers;

      // Only submit if there are actual changes
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      await onSubmit(updates);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update game night');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md my-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Game Night</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Friday Night Gaming"
              required
            />
          </div>

          <CoverImageSelector
            title={title}
            selectedImage={coverImage}
            onImageSelect={setCoverImage}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter address or location"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Add any additional details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Players (Optional)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                value={maxPlayers || ''}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || undefined)}
                min={2}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter max number of players"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Game Night'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGameNightModal;

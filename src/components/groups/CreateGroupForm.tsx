import React, { useState, useEffect } from 'react';
import { Users, Globe, Lock, Image as ImageIcon } from 'lucide-react';
import { GroupTheme, GroupVisibility } from '../../types/group';
import { getSuggestedImages } from '../../services/imageService';

interface CreateGroupFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    visibility: GroupVisibility;
    theme: GroupTheme;
    coverImage?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const THEMES: { value: GroupTheme; label: string; description: string }[] = [
  {
    value: 'family',
    label: 'Family Games',
    description: 'Games suitable for all ages and family gatherings'
  },
  {
    value: 'strategy',
    label: 'Strategy Games',
    description: 'Complex games focused on strategic thinking'
  },
  {
    value: 'party',
    label: 'Party Games',
    description: 'Light and fun games for social gatherings'
  },
  {
    value: 'regional',
    label: 'Regional Group',
    description: 'Local community of board game enthusiasts'
  },
  {
    value: 'general',
    label: 'General Gaming',
    description: 'All types of board games welcome'
  }
];

function CreateGroupForm({ onSubmit, onCancel }: CreateGroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<GroupVisibility>('public');
  const [theme, setTheme] = useState<GroupTheme>('general');
  const [coverImage, setCoverImage] = useState('');
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (name && theme) {
      loadSuggestedImages();
    }
  }, [name, theme]);

  const loadSuggestedImages = async () => {
    try {
      const images = await getSuggestedImages(`${theme} ${name}`);
      setSuggestedImages(images);
    } catch (err) {
      console.error('Failed to load suggested images:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    
    if (!trimmedName) {
      setError('Group name is required.');
      return;
    }

    if (!theme) {
      setError('Please select a group theme.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription,
        visibility,
        theme
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&q=80&w=800&h=400',
    'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?auto=format&fit=crop&q=80&w=800&h=400'
  ];

  const images = suggestedImages.length > 0 ? suggestedImages : defaultImages;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your group name"
            required
          />
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
            placeholder="Describe your group's purpose and goals..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((themeOption) => (
              <label
                key={themeOption.value}
                className={`flex flex-col p-4 border rounded-lg cursor-pointer transition ${
                  theme === themeOption.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="theme"
                    value={themeOption.value}
                    checked={theme === themeOption.value}
                    onChange={(e) => setTheme(e.target.value as GroupTheme)}
                    className="sr-only"
                  />
                  <span className="font-medium">{themeOption.label}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {themeOption.description}
                </p>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privacy Settings
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                visibility === 'public'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={(e) => setVisibility(e.target.value as GroupVisibility)}
                className="sr-only"
              />
              <Globe className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Public Group</div>
                <p className="text-sm text-gray-500">Anyone can find and join</p>
              </div>
            </label>
            
            <label
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                visibility === 'private'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={(e) => setVisibility(e.target.value as GroupVisibility)}
                className="sr-only"
              />
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Private Group</div>
                <p className="text-sm text-gray-500">Invite-only membership</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <div className="grid grid-cols-3 gap-3 mb-2">
            {images.map((imageUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCoverImage(imageUrl)}
                className={`relative aspect-[2/1] overflow-hidden rounded-lg border-2 transition ${
                  coverImage === imageUrl
                    ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`Cover option ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            <span>Select a cover image for your group</span>
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateGroupForm;
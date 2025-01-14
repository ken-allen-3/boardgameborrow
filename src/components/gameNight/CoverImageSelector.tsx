import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { getSuggestedImages } from '../../services/imageService';

interface CoverImageSelectorProps {
  title: string;
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
}

function CoverImageSelector({ title, onImageSelect, selectedImage }: CoverImageSelectorProps) {
  const [suggestedImages, setSuggestedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (title) {
      loadSuggestedImages();
    }
  }, [title]);

  const loadSuggestedImages = async () => {
    setLoading(true);
    try {
      const images = await getSuggestedImages(title);
      setSuggestedImages(images);
    } catch (error) {
      console.error('Failed to load suggested images:', error);
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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cover Image
      </label>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        {images.map((imageUrl, index) => (
          <button
            key={index}
            onClick={() => onImageSelect(imageUrl)}
            className={`relative aspect-[2/1] overflow-hidden rounded-lg border-2 transition ${
              selectedImage === imageUrl
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

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <ImageIcon className="h-4 w-4" />
        <span>Select a cover image for your game night</span>
      </div>
    </div>
  );
}

export default CoverImageSelector;
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  className?: string;
  required?: boolean;
}

export function LocationAutocomplete({ value, onChange, className, required }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);
  const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

  async function searchLocations(query: string): Promise<GeocodingResult[]> {
    if (!query?.trim() || !MAPBOX_API_KEY) return [];

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&types=place,locality,neighborhood`
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      return data.features.map((feature: any) => ({
        id: feature.id,
        place_name: feature.place_name,
        center: feature.center
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedValue?.trim()) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchLocations(debouncedValue);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    onChange(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && setShowSuggestions(true)}
        placeholder="Enter your location"
        className={className}
        required={required}
      />

      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
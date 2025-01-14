import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react'; // Removed unused Search import
import { useDebounce } from '../hooks/useDebounce';

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number];
  text: string; // Added missing property
  context?: {
    id: string;
    text: string;
    short_code?: string;
  }[];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string, coordinates?: [number, number]) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

export function LocationAutocomplete({ 
  value, 
  onChange, 
  className = '', 
  required = false,
  placeholder = 'Enter your location'
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);

  async function searchLocations(query: string): Promise<GeocodingResult[]> {
    if (!query?.trim()) {
      console.log('No query provided');
      return [];
    }
    
    if (!MAPBOX_API_KEY) {
      console.error('Mapbox API key is missing');
      setError('Location service configuration error');
      return [];
    }

    try {
      console.log('Fetching locations for query:', query);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&types=place,locality,neighborhood,postcode&country=US`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Geocoding request failed:', response.status, errorText);
        throw new Error(`Geocoding request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (!data.features) {
        console.error('No features in response:', data);
        return [];
      }
      
      return data.features;
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Failed to load location suggestions');
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
      setError(null);
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

  const formatSuggestion = (suggestion: GeocodingResult): string => {
    const city = suggestion.text;
    const state = suggestion.context?.find(ctx => ctx.short_code?.startsWith('US-'))?.short_code?.replace('US-', '');
    return state ? `${city}, ${state}` : city;
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            console.log('Input changed:', e.target.value);
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => value && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`pl-10 ${className}`}
          required={required}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute w-full mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => {
                console.log('Selected location:', suggestion);
                onChange(formatSuggestion(suggestion), suggestion.center);
                setShowSuggestions(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium">{formatSuggestion(suggestion)}</div>
              <div className="text-sm text-gray-500">{suggestion.place_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

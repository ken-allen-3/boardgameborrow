import { useDebounce } from '../hooks/useDebounce';

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
const GEOCODING_API = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query.trim() || !MAPBOX_API_KEY) return [];

  try {
    const response = await fetch(
      `${GEOCODING_API}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&types=place,locality,neighborhood`
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
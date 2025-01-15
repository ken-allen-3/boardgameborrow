import React, { useState } from 'react';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, update } from 'firebase/database';

interface StepLocationProps {
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
  onboardingData?: {
    selectedGames?: any[];
  };
}

function StepLocation({ onNext, currentStep, totalSteps, onboardingData }: StepLocationProps) {
  const hasSelectedGames = onboardingData?.selectedGames && onboardingData.selectedGames.length > 0;
  const [location, setLocation] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const { currentUser } = useAuth();

  const handleLocationChange = async (value: string, coordinates?: [number, number]) => {
    setLocationValue(value);
    if (coordinates) {
      setLocation(value);
      
      // Save location to user profile
      if (currentUser?.email) {
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.email.replace(/\./g, ',')}`);
        await update(userRef, {
          location: value,
          coordinates: coordinates
        });
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Success Message */}
      {hasSelectedGames ? (
        <div className="text-green-600 font-medium mb-4">
          Excellent! We've added those games to your library.
        </div>
      ) : null}

      {/* Header */}
      <h2 className="text-2xl font-bold text-indigo-900 mb-3">
        One last step: Find your community
      </h2>
      
      {/* Description */}
      <p className="text-gray-600 mb-6">
        Enter your address or the city you live in to find nearby friends and board games to borrow
      </p>

      {/* Location Input */}
      <div className="mb-8">
        <LocationAutocomplete
          value={locationValue}
          onChange={handleLocationChange}
          placeholder="Enter your location"
          required
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Continue Button */}
      <button
        onClick={onNext}
        disabled={!location}
        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
          location
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue
      </button>

      {/* Step Counter */}
      <div className="text-center text-gray-500 mt-4">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}

export default StepLocation;

import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';
import ErrorMessage from '../ErrorMessage';

interface AddressOnboardingModalProps {
  onComplete: () => void;
}

function AddressOnboardingModal({ onComplete }: AddressOnboardingModalProps) {
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email || !location) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUserProfile(currentUser.email, {
        location,
        hasCompletedOnboarding: true
      });
      onComplete();
    } catch (err) {
      setError('Failed to save your location. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Where are you located?
          </h2>
          <p className="text-gray-600">
            This helps us connect you with nearby board game enthusiasts.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Location
            </label>
            <LocationAutocomplete
              value={location}
              onChange={setLocation}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Start typing your city name or zip code
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onComplete()} // Allow skipping for now
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !location}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddressOnboardingModal;
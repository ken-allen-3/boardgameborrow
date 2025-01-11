import React, { useState, useEffect } from 'react';
import { Camera, User, ArrowRight, Loader2 } from 'lucide-react';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { useAuth } from '../../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';

interface Step2AccountSetupProps {
  onNext: () => void;
  onBack: () => void;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  location?: string;
  photo?: string;
  submit?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  location: string;
  photoUrl: string;
  coordinates?: [number, number];
}

function Step2AccountSetup({ onNext, onBack }: Step2AccountSetupProps) {
  const { currentUser, signUp } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: currentUser?.displayName?.split(' ')[0] || '',
    lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
    location: '',
    photoUrl: currentUser?.photoURL || '',
    coordinates: undefined
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Real-time validation
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    
    if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    if (!formData.photoUrl && !photoFile) {
      newErrors.photo = 'Profile photo is required';
    }

    setErrors(newErrors);
  }, [formData, photoFile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Photo must be less than 5MB' }));
        return;
      }
      setPhotoFile(file);
      setFormData(prev => ({ ...prev, photoUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(errors).length > 0) return;
    
    setLoading(true);
    try {
      let photoUrl = formData.photoUrl;
      
      // Upload new photo if selected
      if (photoFile) {
        try {
          const fileName = `${Date.now()}-${photoFile.name}`;
          const photoRef = ref(storage, `profile-photos/${currentUser?.uid}/${fileName}`);
          await uploadBytes(photoRef, photoFile);
          photoUrl = await getDownloadURL(photoRef);
        } catch (error: any) {
          console.error('Error uploading photo:', error);
          throw new Error('Failed to upload profile photo. Please try again.');
        }
      }

      // Update user profile in Firebase
      await signUp({
        ...formData,
        photoUrl,
        email: currentUser?.email || '',
        password: '' // Not needed for profile update
      });

      onNext();
    } catch (error: any) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33.33%' }}></div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          Set Up Your Profile
        </h1>
        <p className="text-lg text-indigo-600">
          Help others recognize you in the community
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {formData.photoUrl ? (
              <img 
                src={formData.photoUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-indigo-50 flex items-center justify-center border-4 border-indigo-100">
                <User className="w-16 h-16 text-indigo-300" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition">
              <Camera className="w-5 h-5 text-white" />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
          </div>
          {errors.photo && (
            <p className="text-red-500 text-sm">{errors.photo}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <LocationAutocomplete
            value={formData.location}
            onChange={(location, coordinates) => 
              setFormData(prev => ({ ...prev, location, coordinates }))
            }
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.location ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            required
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-red-500 text-sm text-center">{errors.submit}</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <button
          onClick={handleSubmit}
          disabled={loading || Object.keys(errors).length > 0}
          className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg transition font-semibold ${
            loading || Object.keys(errors).length > 0 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default Step2AccountSetup;

import React, { useState, useEffect } from 'react';
import { Camera, Mail, MapPin, User, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { uploadProfilePhoto } from '../services/storageService';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    photoUrl: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser?.email) return;

    try {
      const profile = await getUserProfile(currentUser.email);
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        location: profile.location || '',
        photoUrl: profile.photoUrl || ''
      });
      setPhotoPreview(profile.photoUrl || '');
      setError(null);
    } catch (err: any) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Reset any previous errors
      setError(null);

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      // Validate file type more strictly
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('File must be a JPEG, PNG, GIF, or WebP image');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email || !currentUser?.uid) return;

    try {
      setSaving(true);
      setError(null);
      
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        try {
          photoUrl = await uploadProfilePhoto(photoFile, currentUser.email);
        } catch (uploadError: any) {
          setError(uploadError.message || 'Failed to upload photo');
          setSaving(false);
          return;
        }
        setPhotoFile(null); // Clear the file input after successful upload
      }

      await updateUserProfile(currentUser.email, {
        ...formData,
        photoUrl
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Profile Photo
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Choose a profile photo. It will be visible to other users when sharing or borrowing games.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Accepted formats: JPEG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Field (Read Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={currentUser?.email || ''}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-gray-500"
                disabled
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <LocationAutocomplete
                value={formData.location}
                onChange={(location) => setFormData({ ...formData, location })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required={false}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
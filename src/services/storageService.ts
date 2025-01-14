import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

export async function uploadProfilePhoto(file: File, userEmail: string): Promise<string> {
  try {
    // Input validation
    if (!userEmail) {
      throw new Error('User email is required for uploading photos');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate a unique filename using timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const userKey = userEmail.replace(/\./g, ',');
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-photos/${userKey}/${timestamp}-${randomStr}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, fileName);

    // Upload with metadata
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userEmail,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    // Get and return the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error: any) {
    console.error('Error uploading profile photo:', error);
    
    // Handle specific error cases
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please make sure you are logged in.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled. Please try again.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('An unknown error occurred. Please try again.');
    }
    
    throw new Error(error.message || 'Failed to upload profile photo');
  }
}
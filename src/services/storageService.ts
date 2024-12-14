import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export async function uploadProfilePhoto(file: File): Promise<string> {
  try {
    const storage = getStorage();
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile-photos/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw new Error('Failed to upload profile photo');
  }
}
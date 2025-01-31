import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc,
  getDoc,
  setDoc,
  runTransaction,
  CollectionReference,
  DocumentReference
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Validate config
if (!firebaseConfig.apiKey) {
  console.warn('Firebase configuration is missing. This is expected during development if environment variables are not set locally.');
}

const app = initializeApp(firebaseConfig);
// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Database validation function
export const validateDatabaseAccess = async (email: string): Promise<boolean> => {
  try {
    // Verify user can read from cache collections
    const testRef = doc(db, 'game-details', '_test');
    await getDoc(testRef);
    return true;
  } catch (error) {
    console.error('Error validating database access:', error);
    return false;
  }
};

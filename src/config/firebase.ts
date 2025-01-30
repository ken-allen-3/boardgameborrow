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

// Database utility functions
export const validateDatabaseAccess = async (email: string): Promise<boolean> => {
  // Implement your database access validation logic here
  // For now, return true to allow access
  return true;
};

export const ensureDatabaseStructure = async (email: string): Promise<void> => {
  try {
    // Initialize cache collections
    const gameDetailsRef = collection(db, 'game-details');
    const gameRankingsRef = collection(db, 'game-rankings');
    
    // Create a test document in each collection to ensure they exist
    const testDoc = doc(gameDetailsRef, '_test');
    const testRankingDoc = doc(gameRankingsRef, '_test');
    
    await setDoc(testDoc, {
      _created: new Date().toISOString(),
      _type: 'collection_init'
    });
    
    await setDoc(testRankingDoc, {
      _created: new Date().toISOString(),
      _type: 'collection_init'
    });

    console.log('Cache collections initialized successfully');
  } catch (error) {
    console.error('Error initializing database structure:', error);
    throw error;
  }
};

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBUSeB59sbXrpfqNCKghgJMSZv5hjH57h0",
  authDomain: "boardgameshare-001.firebaseapp.com",
  projectId: "boardgameshare-001",
  storageBucket: "boardgameshare-001.appspot.com",
  messagingSenderId: "1078704487346",
  appId: "1:1078704487346:web:e620e65a73920c9a96c2ab",
  measurementId: "G-XZW0HFPH6Y",
  databaseURL: "https://boardgameshare-001-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to LOCAL immediately
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize database structure for a user
export async function ensureDatabaseStructure(userEmail: string) {
  if (!userEmail) return;
  
  try {
    const userKey = userEmail.replace(/\./g, ',');
    const userGamesRef = ref(database, `games/${userKey}`);
    const snapshot = await get(userGamesRef);
    
    if (!snapshot.exists()) {
      // Instead of writing directly, we'll check if we can read first
      const testRef = ref(database, `games/${userKey}`);
      await get(testRef);
    }
  } catch (error) {
    console.error('Error ensuring database structure:', error);
    throw new Error('Database access denied. Please make sure you are logged in.');
  }
}

// Utility function to validate database access
export async function validateDatabaseAccess(userEmail: string): Promise<boolean> {
  if (!userEmail) return false;
  
  try {
    const userKey = userEmail.replace(/\./g, ',');
    const testRef = ref(database, `users/${userKey}`);
    await get(testRef);
    return true;
  } catch (error) {
    console.error('Database access validation failed:', error);
    return false;
  }
}
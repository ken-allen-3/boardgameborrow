import { getDatabase, ref, remove } from 'firebase/database';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBUSeB59sbXrpfqNCKghgJMSZv5hjH57h0",
  authDomain: "boardgameshare-001.firebaseapp.com",
  databaseURL: "https://boardgameshare-001-default-rtdb.firebaseio.com",
  projectId: "boardgameshare-001",
  storageBucket: "boardgameshare-001.appspot.com",
  messagingSenderId: "1078704487346",
  appId: "1:1078704487346:web:e620e65a73920c9a96c2ab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function deleteAllGroups() {
  try {
    await remove(ref(db, 'groups'));
    console.log('Successfully deleted all groups');
  } catch (error) {
    console.error('Error deleting groups:', error);
  }
}

deleteAllGroups();
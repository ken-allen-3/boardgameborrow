import { getDatabase, ref, update } from 'firebase/database';
import { initializeApp } from 'firebase/app';

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
const db = getDatabase(app);

const users = [
  { email: 'max@springwavestudios.com', firstName: 'Max', lastName: 'Filippoff' },
  { email: 'tiff@springwavestudios.com', firstName: 'Tiff', lastName: 'McGee' },
  { email: 'jordan@springwavestudios.com', firstName: 'Jordan', lastName: 'Gohara' },
  { email: 'veronica@springwavestudios.com', firstName: 'Veronica', lastName: 'Allen' },
  { email: 'kenny@springwavestudios.com', firstName: 'Kenny', lastName: 'Allen' }
];

async function updateUsers() {
  for (const user of users) {
    const userKey = user.email.replace(/\./g, ',');
    const userRef = ref(db, `users/${userKey}`);
    
    try {
      await update(userRef, {
        firstName: user.firstName,
        lastName: user.lastName
      });
      console.log(`Updated user: ${user.firstName} ${user.lastName}`);
    } catch (error) {
      console.error(`Failed to update user ${user.email}:`, error);
    }
  }
}

updateUsers().then(() => {
  console.log('All users updated successfully');
}).catch(error => {
  console.error('Update failed:', error);
});
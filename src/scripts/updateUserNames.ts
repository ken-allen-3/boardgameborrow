import { getDatabase, ref, update } from 'firebase/database';

const users = [
  { email: 'max@springwavestudios.com', firstName: 'Max', lastName: 'Filippoff' },
  { email: 'tiff@springwavestudios.com', firstName: 'Tiff', lastName: 'McGee' },
  { email: 'jordan@springwavestudios.com', firstName: 'Jordan', lastName: 'Gohara' },
  { email: 'veronica@springwavestudios.com', firstName: 'Veronica', lastName: 'Allen' },
  { email: 'kenny@springwavestudios.com', firstName: 'Kenny', lastName: 'Allen' }
];

async function updateUserNames() {
  const db = getDatabase();
  
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

updateUserNames().then(() => {
  console.log('User updates complete');
}).catch(console.error);
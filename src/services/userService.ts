import { getDatabase, ref, update, get } from 'firebase/database';

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  lastLogin: string;
}

export async function updateUserProfile(email: string, updates: Partial<UserProfile>): Promise<void> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const userRef = ref(db, `users/${userKey}`);

  try {
    const snapshot = await get(userRef);
    const currentData = snapshot.val() || {};
    
    await update(userRef, {
      ...currentData,
      ...updates,
      email // Always ensure email is set
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

export async function updateExistingUsers(): Promise<void> {
  const users = [
    { email: 'max@springwavestudios.com', firstName: 'Max', lastName: 'Filippoff' },
    { email: 'tiff@springwavestudios.com', firstName: 'Tiff', lastName: 'McGee' },
    { email: 'jordan@springwavestudios.com', firstName: 'Jordan', lastName: 'Gohara' },
    { email: 'veronica@springwavestudios.com', firstName: 'Veronica', lastName: 'Allen' },
    { email: 'kenny@springwavestudios.com', firstName: 'Kenny', lastName: 'Allen' }
  ];

  for (const user of users) {
    await updateUserProfile(user.email, {
      firstName: user.firstName,
      lastName: user.lastName
    });
  }
}
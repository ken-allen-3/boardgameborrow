import { getDatabase, ref, update, get } from 'firebase/database';

interface UserSearchResult {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  location: string;
  isAdmin: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  lastLogin: string;
}

export async function getUserProfile(email: string): Promise<UserProfile> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const userRef = ref(db, `users/${userKey}`);

  try {
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      // Return default profile if not found
      return {
        email,
        firstName: '',
        lastName: '',
        photoUrl: '',
        location: '',
        isAdmin: false,
        hasCompletedOnboarding: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
    }
    return snapshot.val();
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to load user profile');
  }
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

export async function validateUserEmail(email: string): Promise<boolean> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const userRef = ref(db, `users/${userKey}`);
  
  try {
    const snapshot = await get(userRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error validating user email:', error);
    return false;
  }
}

export async function getUsersByEmail(searchQuery: string): Promise<UserSearchResult[]> {
  if (!searchQuery?.trim()) return [];

  const db = getDatabase();
  const usersRef = ref(db, 'users');
  
  try {
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];

    const users = snapshot.val();
    const searchLower = searchQuery.toLowerCase();

    return Object.entries(users)
      .filter(([key, user]: [string, any]) => {
        const email = key.replace(/,/g, '.').toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return email.includes(searchLower) || fullName.includes(searchLower);
      })
      .map(([key, user]: [string, any]) => ({
        email: key.replace(/,/g, '.'),
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }))
      .slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
}
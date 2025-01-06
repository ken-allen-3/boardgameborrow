import { getDatabase, ref, update, get } from 'firebase/database';
import { UserProfile, UserProfileUpdate, OnboardingProgress } from '../types/user';

const DEFAULT_ONBOARDING_PROGRESS: OnboardingProgress = {
  hasGames: false,
  hasBorrowed: false,
  hasJoinedGroup: false,
  hasAttendedGameNight: false,
  onboardingDismissed: false
};

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
        lastLogin: new Date().toISOString(),
        onboardingProgress: DEFAULT_ONBOARDING_PROGRESS
      };
    }
    
    const userData = snapshot.val();
    return {
      ...userData,
      onboardingProgress: {
        ...DEFAULT_ONBOARDING_PROGRESS,
        ...userData.onboardingProgress
      }
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to load user profile');
  }
}

export async function updateOnboardingProgress(email: string, progress: Partial<OnboardingProgress>): Promise<void> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const userRef = ref(db, `users/${userKey}`);

  try {
    const snapshot = await get(userRef);
    const currentData = snapshot.val() || {};
    
    const currentProgress = currentData.onboardingProgress || DEFAULT_ONBOARDING_PROGRESS;
    
    // Merge the new progress with existing progress
    const updatedProgress = {
      ...currentProgress,
      ...progress
    };

    // Only update if there are actual changes
    if (JSON.stringify(currentProgress) !== JSON.stringify(updatedProgress)) {
      await update(userRef, {
        onboardingProgress: updatedProgress,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    throw new Error('Failed to update onboarding progress');
  }
}

export async function updateUserProfile(email: string, updates: UserProfileUpdate): Promise<void> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const userRef = ref(db, `users/${userKey}`);

  try {
    const snapshot = await get(userRef);
    const currentData = snapshot.val() || {};
    
    // If updating onboarding progress, merge with existing progress
    if (updates.onboardingProgress) {
      updates.onboardingProgress = {
        ...DEFAULT_ONBOARDING_PROGRESS,
        ...(currentData.onboardingProgress || {}),
        ...updates.onboardingProgress
      };
    }

    await update(userRef, {
      ...currentData,
      ...updates,
      email, // Always ensure email is set
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
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

interface UserSearchResult {
  email: string;
  firstName: string;
  lastName: string;
}

export async function checkUserHasGames(email: string): Promise<boolean> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const gamesRef = ref(db, `games/${userKey}`);

  try {
    const snapshot = await get(gamesRef);
    const games = snapshot.val();
    return Array.isArray(games) && games.length > 0;
  } catch (error) {
    console.error('Error checking user games:', error);
    return false;
  }
}

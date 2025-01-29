import { getDatabase, ref, get, remove, update, set } from 'firebase/database';
import { UserProfile } from '../types/user';

export interface ActivityLog {
  timestamp: string;
  action: string;
  details: string;
  type: 'game' | 'borrow' | 'group' | 'gameNight' | 'auth' | 'profile';
}

export interface UserDetails {
  profile: UserProfile;
  games: any[];
  borrows: {
    active: any[];
    history: any[];
  };
  groups: any[];
  gameNights: any[];
  activityLogs: ActivityLog[];
}

export async function logUserActivity(
  email: string,
  action: string,
  details: string,
  type: ActivityLog['type']
): Promise<void> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  const logRef = ref(db, `activityLogs/${userKey}`);
  
  try {
    const newLog = {
      timestamp: new Date().toISOString(),
      action,
      details,
      type
    };

    // Get existing logs
    const snapshot = await get(logRef);
    const existingLogs = snapshot.exists() ? Object.values(snapshot.val()) : [];
    
    // Add new log to the beginning
    const updatedLogs = [newLog, ...existingLogs];
    
    // Keep only last 100 logs
    const trimmedLogs = updatedLogs.slice(0, 100);
    
    await set(logRef, trimmedLogs);
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw new Error('Failed to log user activity');
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const db = getDatabase();
  const usersRef = ref(db, 'users');
  
  try {
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) return [];

    const users = snapshot.val();
    return Object.entries(users).map(([key, user]: [string, any]) => ({
      ...user,
      email: key.replace(/,/g, '.'),
      id: key
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function deleteUser(email: string): Promise<void> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  
  try {
    // Delete user's games
    await remove(ref(db, `games/${userKey}`));
    
    // Delete user's borrows
    await remove(ref(db, `borrows/${userKey}`));
    
    // Delete user's game nights
    await remove(ref(db, `gameNights/${userKey}`));
    
    // Delete user's group memberships
    const groupsRef = ref(db, 'groups');
    const groupsSnapshot = await get(groupsRef);
    if (groupsSnapshot.exists()) {
      const groups = groupsSnapshot.val();
      for (const groupId in groups) {
        if (groups[groupId].members && groups[groupId].members[userKey]) {
          await remove(ref(db, `groups/${groupId}/members/${userKey}`));
        }
      }
    }
    
    // Finally, delete the user profile
    await remove(ref(db, `users/${userKey}`));
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Failed to delete user data');
  }
}

export async function getAllGames(): Promise<any[]> {
  const db = getDatabase();
  const gamesRef = ref(db, 'games');
  
  try {
    const snapshot = await get(gamesRef);
    if (!snapshot.exists()) return [];

    const games = snapshot.val();
    return Object.values(games).flat();
  } catch (error) {
    console.error('Error fetching all games:', error);
    throw new Error('Failed to fetch games');
  }
}

export async function getActiveBorrows(): Promise<any[]> {
  const db = getDatabase();
  const borrowsRef = ref(db, 'borrows');
  
  try {
    const snapshot = await get(borrowsRef);
    if (!snapshot.exists()) return [];

    const borrows = snapshot.val();
    return Object.values(borrows).filter((borrow: any) => 
      borrow.status === 'active' || borrow.status === 'pending'
    );
  } catch (error) {
    console.error('Error fetching active borrows:', error);
    throw new Error('Failed to fetch borrows');
  }
}

export async function updateUserRole(email: string, isAdmin: boolean): Promise<void> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  
  try {
    await update(ref(db, `users/${userKey}`), {
      isAdmin,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function getUserDetails(email: string): Promise<UserDetails> {
  const db = getDatabase();
  const userKey = email.replace(/\./g, ',');
  
  try {
    const [
      userSnapshot,
      gamesSnapshot,
      borrowsSnapshot,
      groupsSnapshot,
      gameNightsSnapshot,
      logsSnapshot
    ] = await Promise.all([
      get(ref(db, `users/${userKey}`)),
      get(ref(db, `games/${userKey}`)),
      get(ref(db, `borrows/${userKey}`)),
      get(ref(db, 'groups')),
      get(ref(db, 'gameNights')),
      get(ref(db, `activityLogs/${userKey}`))
    ]);

    // Get user profile
    const profile = {
      ...userSnapshot.val(),
      email,
      id: userKey
    };

    // Get user's games
    const games = gamesSnapshot.exists() ? Object.values(gamesSnapshot.val()) : [];

    // Get user's borrows
    const allBorrows = borrowsSnapshot.exists() ? Object.values(borrowsSnapshot.val()) : [];
    const borrows = {
      active: allBorrows.filter((borrow: any) => borrow.status === 'active'),
      history: allBorrows.filter((borrow: any) => borrow.status !== 'active')
    };

    // Get user's groups
    const groups = [];
    if (groupsSnapshot.exists()) {
      const allGroups = groupsSnapshot.val();
      for (const groupId in allGroups) {
        if (allGroups[groupId].members && allGroups[groupId].members[userKey]) {
          groups.push({
            id: groupId,
            ...allGroups[groupId]
          });
        }
      }
    }

    // Get user's game nights
    const gameNights = [];
    if (gameNightsSnapshot.exists()) {
      const allGameNights = gameNightsSnapshot.val();
      for (const nightId in allGameNights) {
        const night = allGameNights[nightId];
        if (night.host === email || (night.attendees && night.attendees[userKey])) {
          gameNights.push({
            id: nightId,
            ...night
          });
        }
      }
    }

    // Get user's activity logs
    const activityLogs = logsSnapshot.exists() 
      ? (Object.values(logsSnapshot.val()) as ActivityLog[])
      : [];

    return {
      profile,
      games,
      borrows,
      groups,
      gameNights,
      activityLogs
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Failed to fetch user details');
  }
}

export async function getUpcomingGameNights(): Promise<any[]> {
  const db = getDatabase();
  const gameNightsRef = ref(db, 'gameNights');
  
  try {
    const snapshot = await get(gameNightsRef);
    if (!snapshot.exists()) return [];

    const gameNights = snapshot.val();
    const now = new Date().getTime();
    
    return Object.values(gameNights).filter((night: any) => {
      const eventDate = new Date(night.date).getTime();
      return eventDate > now;
    });
  } catch (error) {
    console.error('Error fetching upcoming game nights:', error);
    throw new Error('Failed to fetch game nights');
  }
}

export { getCacheMetrics } from './cacheMetricsService';

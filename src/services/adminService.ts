import { getDatabase, ref, get } from 'firebase/database';
import { UserProfile } from '../types/user';

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

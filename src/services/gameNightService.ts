import { getDatabase, ref, push, get, set, remove, update } from 'firebase/database';
import { GameNight } from '../types/gameNight';
import { Game } from './gameService';
import { updateOnboardingProgress } from './userService';

export async function createGameNight(
  hostEmail: string,
  data: Omit<GameNight, 'id' | 'hostId' | 'createdAt' | 'updatedAt' | 'attendees'>
): Promise<string> {
  const db = getDatabase();
  const gameNightsRef = ref(db, 'gameNights');
  const newGameNightRef = push(gameNightsRef);
  
  const now = new Date().toISOString();
  const gameNight: GameNight = {
    ...data,
    id: newGameNightRef.key!,
    hostId: hostEmail.replace(/\./g, ','),
    attendees: {
      [hostEmail.replace(/\./g, ',')]: {
        status: 'going',
        canInviteOthers: true
      }
    },
    inviteSettings: {
      allowInvites: data.inviteSettings?.allowInvites ?? true,
      defaultInvitePermission: data.inviteSettings?.defaultInvitePermission ?? false
    },
    createdAt: now,
    updatedAt: now
  };

  try {
    await set(newGameNightRef, gameNight);
    
    // Update onboarding progress when user creates their first game night
    await updateOnboardingProgress(hostEmail, {
      hasAttendedGameNight: true
    });
    
    return gameNight.id;
  } catch (error) {
    console.error('Failed to create game night:', error);
    throw error;
  }
}

export async function getGameNight(id: string): Promise<GameNight | null> {
  const db = getDatabase();
  const gameNightRef = ref(db, `gameNights/${id}`);
  
  const snapshot = await get(gameNightRef);
  return snapshot.exists() ? snapshot.val() : null;
}

export async function getUserGameNights(userEmail: string): Promise<GameNight[]> {
  const db = getDatabase();
  const gameNightsRef = ref(db, 'gameNights');
  
  const snapshot = await get(gameNightsRef);
  if (!snapshot.exists()) return [];

  const userKey = userEmail.replace(/\./g, ',');
  const gameNights = Object.values(snapshot.val() as Record<string, GameNight>);
  
  return gameNights
    .filter(night => 
      night.hostId === userKey || 
      night.attendees[userKey]
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function updateAttendance(
  gameNightId: string,
  userEmail: string,
  status: 'going' | 'maybe' | 'declined',
  response?: string,
  gamesTheyBring?: string[]
): Promise<void> {
  const db = getDatabase();
  const attendeeRef = ref(
    db,
    `gameNights/${gameNightId}/attendees/${userEmail.replace(/\./g, ',')}`
  );

  try {
    await set(attendeeRef, {
      status,
      response,
      gamesTheyBring
    });

    // Update onboarding progress when user accepts a game night invite
    if (status === 'going') {
      await updateOnboardingProgress(userEmail, {
        hasAttendedGameNight: true
      });
    }
  } catch (error) {
    console.error('Failed to update attendance:', error);
    throw error;
  }
}

import { validateUserEmail } from './userService';

export async function inviteUsers(
  gameNightId: string,
  invitees: { email: string; canInviteOthers: boolean }[]
): Promise<void> {
  const db = getDatabase();
  console.log('[GameNight] Starting invite process:', {
    gameNightId,
    inviteeCount: invitees.length,
    invitees
  });

  const gameNight = await getGameNight(gameNightId);
  
  if (!gameNight) {
    console.error('[GameNight] Game night not found:', gameNightId);
    throw new Error('Game night not found');
  }

  console.log('[GameNight] Found game night:', {
    title: gameNight.title,
    date: gameNight.date,
    hostId: gameNight.hostId,
    inviteSettings: gameNight.inviteSettings
  });
  
  // Validate all emails first
  const validations = await Promise.all(
    invitees.map(async ({ email }) => ({
      email,
      exists: await validateUserEmail(email)
    }))
  );

  const invalidEmails = validations
    .filter(v => !v.exists)
    .map(v => v.email);

  if (invalidEmails.length > 0) {
    throw new Error(`User(s) not found: ${invalidEmails.join(', ')}`);
  }

  try {
    const gameNightRef = ref(db, `gameNights/${gameNightId}`);
    const updates: Record<string, unknown> = {};
    
    invitees.forEach(({ email, canInviteOthers }) => {
      const userKey = email.replace(/\./g, ',');
      console.log('[GameNight] Processing invite for:', {
        email,
        userKey,
        canInviteOthers
      });
      
      updates[`/gameNights/${gameNightId}/attendees/${userKey}`] = {
        status: 'pending',
        canInviteOthers,
        invitedAt: new Date().toISOString()
      };
    });
    
    console.log('[GameNight] Prepared updates:', updates);
    await update(ref(db), updates);
    console.log('[GameNight] Successfully sent invites');
  } catch (error) {
    console.error('[GameNight] Failed to send invites:', {
      error,
      gameNightId,
      invitees
    });
    throw new Error('Failed to send invites. Please try again.');
  }
}

export async function cancelGameNight(id: string, hostEmail: string): Promise<void> {
  const db = getDatabase();
  const gameNight = await getGameNight(id);
  
  if (!gameNight) {
    throw new Error('Game night not found');
  }
  
  if (gameNight.hostId !== hostEmail.replace(/\./g, ',')) {
    throw new Error('Only the host can cancel a game night');
  }
  
  await remove(ref(db, `gameNights/${id}`));
}

export async function updateGameNight(
  id: string,
  hostEmail: string,
  updates: Partial<Omit<GameNight, 'id' | 'hostId' | 'createdAt' | 'updatedAt' | 'attendees'>>
): Promise<void> {
  const db = getDatabase();
  const gameNight = await getGameNight(id);
  
  if (!gameNight) {
    throw new Error('Game night not found');
  }
  
  if (gameNight.hostId !== hostEmail.replace(/\./g, ',')) {
    throw new Error('Only the host can update a game night');
  }

  const gameNightRef = ref(db, `gameNights/${id}`);
  const now = new Date().toISOString();
  
  try {
    await update(gameNightRef, {
      ...updates,
      updatedAt: now
    });
  } catch (error) {
    console.error('Failed to update game night:', error);
    throw new Error('Failed to update game night. Please try again.');
  }
}

export async function suggestGamesForGameNight(
  gameNightId: string,
  gameIds: string[]
): Promise<void> {
  if (!gameIds.length) {
    throw new Error('Must select at least one game to suggest');
  }

  const db = getDatabase();
  const gameNightRef = ref(db, `gameNights/${gameNightId}/suggestedGames`);

  try {
    await set(gameNightRef, gameIds);
  } catch (error) {
    console.error('Failed to suggest games:', error);
    throw new Error('Failed to suggest games. Please try again.');
  }
}

export async function getAvailableGamesForGameNight(gameNightId: string): Promise<Game[]> {
  const db = getDatabase();
  const gameNight = await getGameNight(gameNightId);
  
  if (!gameNight) {
    throw new Error('Game night not found');
  }

  // Get all attendees who are "going"
  const attendeeEmails = Object.entries(gameNight.attendees)
    .filter(([_, attendee]) => attendee.status === 'going')
    .map(([email]) => email.replace(/,/g, '.'));

  // Get games from all attendees
  const games: Game[] = [];
  for (const email of attendeeEmails) {
    const userKey = email.replace(/\./g, ',');
    const gamesRef = ref(db, `games/${userKey}`);
    const snapshot = await get(gamesRef);
    
    if (snapshot.exists()) {
      const userGames = snapshot.val();
      if (Array.isArray(userGames)) {
        games.push(...userGames.map((game: any, index: number) => ({
          id: `${email}-${index}`,
          title: game.title || '',
          image: game.image || '',
          owner: email,
          status: game.status || 'available',
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          minPlaytime: game.minPlaytime,
          maxPlaytime: game.maxPlaytime
        })));
      }
    }
  }

  return games;
}

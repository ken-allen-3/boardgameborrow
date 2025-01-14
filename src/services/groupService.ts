import { getDatabase, ref, get, set, remove, push, update } from 'firebase/database';
import { Group, GroupTheme, GroupVisibility } from '../types/group';
import { validateUserEmail, updateOnboardingProgress } from './userService';
import { getInvite } from './inviteService';

const VALID_THEMES: GroupTheme[] = ['family', 'strategy', 'party', 'regional', 'general'];

export async function getUserGroups(userEmail: string): Promise<Group[]> {
  const db = getDatabase();
  const groupsRef = ref(db, 'groups');
  
  console.log('[GroupService] Fetching groups for user:', userEmail);
  
  try {
    const snapshot = await get(groupsRef);
    if (!snapshot.exists()) {
      console.log('[GroupService] No groups found in database');
      return [];
    }

    const groups = snapshot.val();
    console.log('[GroupService] Raw groups data:', groups);
    
    const userGroups = Object.entries(groups)
      .map(([id, group]) => ({
        id,
        ...(group as Omit<Group, 'id'>)
      }))
      .filter(group => group.members[userEmail.replace(/\./g, ',')])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('[GroupService] Filtered groups for user:', {
      userEmail,
      groupCount: userGroups.length,
      groups: userGroups
    });

    return userGroups;
  } catch (err) {
    console.error('[GroupService] Error getting user groups:', {
      error: err,
      userEmail
    });
    throw new Error('Failed to load groups');
  }
}

export async function createGroup(
  ownerEmail: string,
  ownerName: string,
  name: string,
  description: string | undefined,
  visibility: GroupVisibility,
  theme: GroupTheme = 'general'
): Promise<string> {
  const db = getDatabase();
  const groupsRef = ref(db, 'groups');
  
  console.log('[GroupService] Creating group:', {
    ownerEmail,
    ownerName,
    name,
    description,
    visibility,
    theme
  });
  
  try {
    // Validate theme
    if (!VALID_THEMES.includes(theme)) {
      console.error('[GroupService] Invalid theme:', theme);
      throw new Error('Invalid theme selected');
    }

    // Create a new reference with a unique key
    const newGroupRef = push(groupsRef);
    const groupId = newGroupRef.key!;
    const now = new Date().toISOString();
    
    // Create the group object
    const group: Omit<Group, 'id'> = {
      name,
      description: description || '',
      visibility,
      theme,
      members: {
        [ownerEmail.replace(/\./g, ',')]: {
          role: 'owner',
          joinedAt: now,
          name: ownerName,
          canInviteOthers: true
        }
      },
      createdAt: now,
      updatedAt: now
    };

    // Set the group data at the new reference
    await set(ref(db, `groups/${groupId}`), group);
    return groupId;
  } catch (err) {
    console.error('[GroupService] Error creating group:', {
      error: err,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      errorStack: err instanceof Error ? err.stack : undefined,
      ownerEmail,
      name
    });
    throw new Error(
      err instanceof Error 
        ? `Failed to create group: ${err.message}`
        : 'Failed to create group due to an unknown error'
    );
  }
}

export async function leaveGroup(userEmail: string, groupId: string): Promise<void> {
  const db = getDatabase();
  const memberRef = ref(db, `groups/${groupId}/members/${userEmail.replace(/\./g, ',')}`);
  
  try {
    const snapshot = await get(memberRef);
    if (!snapshot.exists()) {
      throw new Error('You are not a member of this group');
    }

    const member = snapshot.val();
    if (member.role === 'owner') {
      throw new Error('Group owners cannot leave their groups');
    }

    await remove(memberRef);
  } catch (err) {
    console.error('Error leaving group:', err);
    throw err;
  }
}

export async function createGroupInvite(groupId: string): Promise<string> {
  const db = getDatabase();
  const groupRef = ref(db, `groups/${groupId}`);
  
  try {
    const inviteCode = generateInviteCode();
    await set(ref(db, `groups/${groupId}/inviteCode`), inviteCode);
    return inviteCode;
  } catch (err) {
    console.error('Error creating invite:', err);
    throw new Error('Failed to create invite');
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function requestToJoinGroup(groupId: string, userEmail: string): Promise<void> {
  const db = getDatabase();
  const groupRef = ref(db, `groups/${groupId}`);
  const userKey = userEmail.replace(/\./g, ',');
  
  try {
    const snapshot = await get(groupRef);
    if (!snapshot.exists()) {
      throw new Error('Group not found');
    }

    const group = snapshot.val();
    if (group.members[userKey]) {
      throw new Error('You are already a member of this group');
    }

    // For public groups, add user directly
    if (group.visibility === 'public') {
      await update(ref(db), {
        [`groups/${groupId}/members/${userKey}`]: {
          role: 'member',
          joinedAt: new Date().toISOString(),
          canInviteOthers: false
        }
      });
    } else {
      // For private groups, create join request
      await update(ref(db), {
        [`groups/${groupId}/joinRequests/${userKey}`]: {
          requestedAt: new Date().toISOString(),
          status: 'pending'
        }
      });
    }
  } catch (err) {
    console.error('Error requesting to join group:', err);
    throw err;
  }
}

export async function getAllPublicGroups(): Promise<Group[]> {
  const db = getDatabase();
  const groupsRef = ref(db, 'groups');
  
  try {
    const snapshot = await get(groupsRef);
    if (!snapshot.exists()) return [];

    return Object.entries(snapshot.val())
      .map(([id, group]) => ({
        id,
        ...(group as Omit<Group, 'id'>)
      }))
      .filter(group => group.visibility === 'public')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error getting public groups:', err);
    throw new Error('Failed to load public groups');
  }
}

export async function handleJoinRequest(
  groupId: string,
  requesterId: string,
  approved: boolean,
  role: 'member' | 'moderator' = 'member'
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();
  
  try {
    if (approved) {
      // Add user as member
      await update(ref(db), {
        [`groups/${groupId}/members/${requesterId.replace(/\./g, ',')}`]: {
          role,
          joinedAt: now,
          canInviteOthers: false
        },
        [`groups/${groupId}/joinRequests/${requesterId.replace(/\./g, ',')}`]: null,
        [`groups/${groupId}/updatedAt`]: now
      });

      // Update onboarding progress when user joins their first group
      await updateOnboardingProgress(requesterId, {
        hasJoinedGroup: true
      });
    } else {
      // Remove request
      await remove(ref(db, `groups/${groupId}/joinRequests/${requesterId.replace(/\./g, ',')}`));
    }
  } catch (err) {
    console.error('Error handling join request:', err);
    throw new Error(`Failed to ${approved ? 'approve' : 'reject'} join request`);
  }
}

export async function claimInvite(inviteId: string, userEmail: string): Promise<void> {
  const db = getDatabase();
  const invite = await getInvite(inviteId);
  
  if (!invite) {
    throw new Error('Invite not found or has expired');
  }
  
  if (invite.claimed) {
    throw new Error('This invite has already been used');
  }

  try {
    // Add user to group
    await update(ref(db), {
      [`groups/${invite.groupId}/members/${userEmail.replace(/\./g, ',')}`]: {
        role: 'member',
        joinedAt: new Date().toISOString(),
        canInviteOthers: false
      },
      [`invites/${inviteId}/claimed`]: true
    });

    // Update onboarding progress when user accepts their first group invite
    await updateOnboardingProgress(userEmail, {
      hasJoinedGroup: true
    });
  } catch (error) {
    console.error('Failed to claim invite:', error);
    throw new Error('Failed to join group. Please try again.');
  }
}

export async function updateMemberRole(
  groupId: string,
  memberId: string,
  newRole: 'moderator' | 'member'
): Promise<void> {
  const db = getDatabase();
  const memberRef = ref(db, `groups/${groupId}/members/${memberId.replace(/\./g, ',')}`);
  
  try {
    const snapshot = await get(memberRef);
    if (!snapshot.exists()) {
      throw new Error('Member not found');
    }

    const member = snapshot.val();
    if (member.role === 'owner') {
      throw new Error('Cannot change role of group owner');
    }

    await update(memberRef, {
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating member role:', err);
    throw new Error('Failed to update member role');
  }
}

export async function updateGroup(
  groupId: string,
  updates: {
    name?: string;
    description?: string;
    theme?: 'family' | 'strategy' | 'party' | 'regional' | 'general';
    coverImage?: string;
  }
): Promise<void> {
  const db = getDatabase();
  const groupRef = ref(db, `groups/${groupId}`);
  
  try {
    const snapshot = await get(groupRef);
    if (!snapshot.exists()) {
      throw new Error('Group not found');
    }

    await update(groupRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating group:', err);
    throw new Error('Failed to update group');
  }
}
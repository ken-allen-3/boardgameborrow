import { getDatabase, ref, get, set, remove, push } from 'firebase/database';
import { Group } from '../types/group';

export async function getUserGroups(userEmail: string): Promise<Group[]> {
  const db = getDatabase();
  const groupsRef = ref(db, 'groups');
  
  try {
    const snapshot = await get(groupsRef);
    if (!snapshot.exists()) return [];

    const groups = snapshot.val();
    return Object.entries(groups)
      .map(([id, group]) => ({
        id,
        ...(group as Omit<Group, 'id'>)
      }))
      .filter(group => group.members[userEmail.replace(/\./g, ',')])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error getting user groups:', err);
    throw new Error('Failed to load groups');
  }
}

export async function createGroup(
  ownerEmail: string,
  ownerName: string,
  name: string,
  description: string,
  isPrivate: boolean
): Promise<string> {
  const db = getDatabase();
  const groupsRef = ref(db, 'groups');
  
  try {
    // Create a new reference with a unique key
    const newGroupRef = push(groupsRef);
    const groupId = newGroupRef.key!;
    
    // Create the group object
    const group: Omit<Group, 'id'> = {
      name,
      description,
      isPrivate,
      members: {
        [ownerEmail.replace(/\./g, ',')]: {
          role: 'owner',
          joinedAt: new Date().toISOString(),
          name: ownerName
        }
      },
      createdAt: new Date().toISOString()
    };

    // Set the group data at the new reference
    await set(ref(db, `groups/${groupId}`), group);
    return groupId;
  } catch (err) {
    console.error('Error creating group:', err);
    throw new Error('Failed to create group');
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
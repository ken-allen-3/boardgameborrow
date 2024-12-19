import { getDatabase, ref, push, get, set, remove } from 'firebase/database';
import { Group } from '../types/group';

interface GroupInvite {
  id: string;
  groupId: string;
  inviterEmail: string;
  inviterName: string;
  createdAt: string;
  expiresAt: string; // 7 days from creation
  claimed: boolean;
}

export async function createGroupInvite(
  groupId: string,
  inviterEmail: string,
  inviterName: string
): Promise<string> {
  const db = getDatabase();
  const invitesRef = ref(db, 'invites');
  const newInviteRef = push(invitesRef);
  const inviteId = newInviteRef.key!;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite: GroupInvite = {
    id: inviteId,
    groupId,
    inviterEmail,
    inviterName,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    claimed: false
  };

  await set(newInviteRef, invite);
  return inviteId;
}

export async function getInvite(inviteId: string): Promise<GroupInvite | null> {
  const db = getDatabase();
  const inviteRef = ref(db, `invites/${inviteId}`);
  
  const snapshot = await get(inviteRef);
  if (!snapshot.exists()) return null;

  const invite = snapshot.val();
  if (new Date(invite.expiresAt) < new Date()) {
    await remove(inviteRef); // Clean up expired invite
    return null;
  }

  return invite;
}

export async function claimInvite(
  inviteId: string,
  userEmail: string,
  userName: string
): Promise<void> {
  const db = getDatabase();
  const invite = await getInvite(inviteId);
  
  if (!invite) {
    throw new Error('Invite not found or has expired');
  }
  
  if (invite.claimed) {
    throw new Error('This invite has already been used');
  }

  // Get the group
  const groupRef = ref(db, `groups/${invite.groupId}`);
  const groupSnapshot = await get(groupRef);
  
  if (!groupSnapshot.exists()) {
    throw new Error('Group no longer exists');
  }

  const group: Group = groupSnapshot.val();
  const userKey = userEmail.replace(/\./g, ',');

  // Add user to group
  const updates: Record<string, any> = {
    [`groups/${invite.groupId}/members/${userKey}`]: {
      email: userEmail,
      name: userName,
      role: 'member',
      joinedAt: new Date().toISOString()
    },
    [`invites/${inviteId}/claimed`]: true
  };

  await set(ref(db), updates);
}
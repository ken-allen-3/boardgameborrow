import { getDatabase, ref, set, get, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { Friendship, FriendProfile } from '../types/friend';
import { getUserProfile } from './userService';

const db = getDatabase();

export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
  console.log('Sending friend request:', { fromUserId, toUserId });
  const timestamp = new Date().toISOString();
  
  const updates: { [key: string]: any } = {
    [`friendships/${fromUserId}/${toUserId}`]: {
      status: 'sent',
      createdAt: timestamp,
      updatedAt: timestamp
    },
    [`friendships/${toUserId}/${fromUserId}`]: {
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    }
  };

  try {
    console.log('Updating Firebase with:', updates);
    await update(ref(db), updates);
    console.log('Friend request sent successfully');
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw new Error('Failed to send friend request');
  }
}

export async function acceptFriendRequest(userId: string, friendId: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const updates: { [key: string]: any } = {
    [`friendships/${userId}/${friendId}/status`]: 'accepted',
    [`friendships/${userId}/${friendId}/updatedAt`]: timestamp,
    [`friendships/${friendId}/${userId}/status`]: 'accepted',
    [`friendships/${friendId}/${userId}/updatedAt`]: timestamp
  };

  try {
    await update(ref(db), updates);
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw new Error('Failed to accept friend request');
  }
}

export async function declineFriendRequest(userId: string, friendId: string): Promise<void> {
  const updates: { [key: string]: any } = {
    [`friendships/${userId}/${friendId}`]: null,
    [`friendships/${friendId}/${userId}`]: null
  };

  try {
    await update(ref(db), updates);
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw new Error('Failed to decline friend request');
  }
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  return declineFriendRequest(userId, friendId);
}

export async function getFriendsList(userId: string): Promise<FriendProfile[]> {
  try {
    const friendshipsRef = ref(db, `friendships/${userId}`);
    const snapshot = await get(friendshipsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const friendships = snapshot.val();
    const friendProfiles: FriendProfile[] = [];

    for (const [friendId, friendship] of Object.entries(friendships)) {
      const typedFriendship = friendship as Friendship;
      if (typedFriendship.status === 'accepted') {
        try {
          const friendEmail = await getUserEmailById(friendId);
          if (friendEmail) {
            const profile = await getUserProfile(friendEmail);
            friendProfiles.push({
              userId: friendId,
              email: friendEmail,
              firstName: profile.firstName,
              lastName: profile.lastName,
              photoUrl: profile.photoUrl,
              status: typedFriendship.status,
              createdAt: typedFriendship.createdAt,
              updatedAt: typedFriendship.updatedAt
            });
          }
        } catch (error) {
          console.error(`Error fetching friend profile for ${friendId}:`, error);
        }
      }
    }

    return friendProfiles;
  } catch (error) {
    console.error('Error getting friends list:', error);
    throw new Error('Failed to get friends list');
  }
}

export async function getPendingRequests(userId: string): Promise<FriendProfile[]> {
  console.log('Getting pending requests for user:', userId);
  try {
    const friendshipsRef = ref(db, `friendships/${userId}`);
    const snapshot = await get(friendshipsRef);
    console.log('Friendships snapshot:', snapshot.val());
    
    if (!snapshot.exists()) {
      return [];
    }

    const friendships = snapshot.val();
    console.log('Parsed friendships:', friendships);
    const pendingProfiles: FriendProfile[] = [];

    for (const [friendId, friendship] of Object.entries(friendships)) {
      console.log('Processing friendship:', { friendId, friendship });
      const typedFriendship = friendship as Friendship;
      if (typedFriendship.status === 'pending') {
        console.log('Found pending request from:', friendId);
        try {
          const friendEmail = await getUserEmailById(friendId);
          if (friendEmail) {
            const profile = await getUserProfile(friendEmail);
            pendingProfiles.push({
              userId: friendId,
              email: friendEmail,
              firstName: profile.firstName,
              lastName: profile.lastName,
              photoUrl: profile.photoUrl,
              status: typedFriendship.status,
              createdAt: typedFriendship.createdAt,
              updatedAt: typedFriendship.updatedAt
            });
          }
        } catch (error) {
          console.error(`Error fetching friend profile for ${friendId}:`, error);
        }
      }
    }

    return pendingProfiles;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw new Error('Failed to get pending requests');
  }
}

// Helper function to get user email by ID
async function getUserEmailById(userId: string): Promise<string | null> {
  try {
    // userId is already the email with dots replaced by commas
    // Convert it back to regular email format
    const email = userId.replace(/,/g, '.');
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      console.error('User not found:', userId);
      return null;
    }
    
    return email;
  } catch (error) {
    console.error('Error getting user email by ID:', error);
    return null;
  }
}

// Helper function to check if a friendship exists
export async function getSentRequests(userId: string): Promise<FriendProfile[]> {
  console.log('Getting sent requests for user:', userId);
  try {
    const friendshipsRef = ref(db, `friendships/${userId}`);
    const snapshot = await get(friendshipsRef);
    console.log('Friendships snapshot:', snapshot.val());
    
    if (!snapshot.exists()) {
      return [];
    }

    const friendships = snapshot.val();
    console.log('Parsed friendships:', friendships);
    const sentProfiles: FriendProfile[] = [];

    for (const [friendId, friendship] of Object.entries(friendships)) {
      console.log('Processing friendship:', { friendId, friendship });
      const typedFriendship = friendship as Friendship;
      if (typedFriendship.status === 'sent') {
        console.log('Found sent request to:', friendId);
        try {
          const friendEmail = await getUserEmailById(friendId);
          if (friendEmail) {
            const profile = await getUserProfile(friendEmail);
            sentProfiles.push({
              userId: friendId,
              email: friendEmail,
              firstName: profile.firstName,
              lastName: profile.lastName,
              photoUrl: profile.photoUrl,
              status: typedFriendship.status,
              createdAt: typedFriendship.createdAt,
              updatedAt: typedFriendship.updatedAt
            });
          }
        } catch (error) {
          console.error(`Error fetching friend profile for ${friendId}:`, error);
        }
      }
    }

    return sentProfiles;
  } catch (error) {
    console.error('Error getting sent requests:', error);
    throw new Error('Failed to get sent requests');
  }
}

export async function checkFriendshipStatus(userId: string, friendId: string): Promise<'none' | 'pending' | 'sent' | 'accepted'> {
  try {
    const friendshipRef = ref(db, `friendships/${userId}/${friendId}`);
    const snapshot = await get(friendshipRef);
    
    if (!snapshot.exists()) {
      return 'none';
    }

    const friendship = snapshot.val() as Friendship;
    return friendship.status;
  } catch (error) {
    console.error('Error checking friendship status:', error);
    return 'none';
  }
}

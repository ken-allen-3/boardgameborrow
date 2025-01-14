export interface Friendship {
  status: 'pending' | 'sent' | 'accepted';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'sent' | 'accepted';
}

export interface FriendProfile extends Friendship {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

export interface Friendship {
  status: 'pending' | 'accepted';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted';
}

export interface FriendProfile extends Friendship {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

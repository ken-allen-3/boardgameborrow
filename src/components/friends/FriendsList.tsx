import React from 'react';
import { UserX } from 'lucide-react';
import { FriendProfile } from '../../types/friend';

interface FriendsListProps {
  friends: FriendProfile[];
  onRemoveFriend: (friendId: string) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, onRemoveFriend }) => {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No friends added yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map((friend) => (
        <div
          key={friend.userId}
          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <img
              src={friend.photoUrl || '/default-avatar.png'}
              alt={`${friend.firstName} ${friend.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {friend.firstName} {friend.lastName}
              </h3>
              <p className="text-sm text-gray-500">{friend.email}</p>
            </div>
          </div>
          <button
            onClick={() => onRemoveFriend(friend.userId)}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
            title="Remove friend"
          >
            <UserX size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FriendsList;

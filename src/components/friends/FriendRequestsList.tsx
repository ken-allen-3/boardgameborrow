import React from 'react';
import { Check, X } from 'lucide-react';
import { FriendProfile } from '../../types/friend';

interface FriendRequestsListProps {
  requests: FriendProfile[];
  onAcceptRequest: (friendId: string) => void;
  onDeclineRequest: (friendId: string) => void;
}

const FriendRequestsList: React.FC<FriendRequestsListProps> = ({
  requests,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.userId}
          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <img
              src={request.photoUrl || '/default-avatar.png'}
              alt={`${request.firstName} ${request.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">
                {request.firstName} {request.lastName}
              </h3>
              <p className="text-sm text-gray-500">{request.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onAcceptRequest(request.userId)}
              className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50"
              title="Accept request"
            >
              <Check size={20} />
            </button>
            <button
              onClick={() => onDeclineRequest(request.userId)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
              title="Decline request"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequestsList;

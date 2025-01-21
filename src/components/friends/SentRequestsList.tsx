import React from 'react';
import { FriendProfile } from '../../types/friend';

interface SentRequestsListProps {
  requests: FriendProfile[];
  onCancelRequest: (friendId: string) => void;
}

const SentRequestsList: React.FC<SentRequestsListProps> = ({ requests, onCancelRequest }) => {
  if (requests.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No pending sent requests
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((request) => (
        <div
          key={request.userId}
          className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {request.photoUrl ? (
              <img
                src={request.photoUrl}
                alt={`${request.firstName} ${request.lastName}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl text-gray-500">
                  {request.firstName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">
                {request.firstName} {request.lastName}
              </h3>
              <p className="text-sm text-gray-500">{request.email}</p>
            </div>
          </div>
          <button
            onClick={() => onCancelRequest(request.userId)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
};

export default SentRequestsList;

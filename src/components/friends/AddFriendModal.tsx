import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { getUsersByEmail } from '../../services/userService';
import { checkFriendshipStatus } from '../../services/friendService';

interface AddFriendModalProps {
  onClose: () => void;
  onSendRequest: (userId: string) => void;
  currentUserId: string;
}

interface UserSearchResult {
  email: string;
  firstName: string;
  lastName: string;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({
  onClose,
  onSendRequest,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await getUsersByEmail(query);
      // Filter out the current user from results
      const filteredResults = results.filter(user => 
        user.email.replace(/\./g, ',') !== currentUserId
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      const status = await checkFriendshipStatus(currentUserId, userId);
      if (status === 'none') {
        await onSendRequest(userId);
        // Remove the user from search results after sending request
        setSearchResults(prev => prev.filter(user => user.email.replace(/\./g, ',') !== userId));
      } else {
        setError(status === 'pending' ? 'Friend request already sent' : 'Already friends with this user');
      }
    } catch (err) {
      setError('Failed to send friend request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by email or name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={() => handleSendRequest(user.email.replace(/\./g, ','))}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                  title="Send friend request"
                >
                  <UserPlus size={20} />
                </button>
              </div>
            ))}
            {searchQuery.length >= 3 && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriendModal;

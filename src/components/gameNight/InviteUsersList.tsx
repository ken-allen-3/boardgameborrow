import React, { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { getUsersByEmail } from '../../services/userService';
import { useDebounce } from '../../hooks/useDebounce';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

interface InviteUsersListProps {
  selectedUsers: Map<string, boolean>;
  onUsersChange: (users: Map<string, boolean>) => void;
  defaultInvitePermission: boolean;
}

function InviteUsersList({ selectedUsers, onUsersChange, defaultInvitePermission }: InviteUsersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [debouncedSearch]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const results = await getUsersByEmail(debouncedSearch);
      setUsers(results);
      setError(null);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (email: string) => {
    const newSelected = new Map(selectedUsers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.set(email, defaultInvitePermission);
    }
    onUsersChange(newSelected);
  };

  const toggleInvitePermission = (email: string) => {
    const newSelected = new Map(selectedUsers);
    newSelected.set(email, !newSelected.get(email));
    onUsersChange(newSelected);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Invite Players
      </label>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by email..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            Searching...
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.email)}
                  onChange={() => toggleUser(user.email)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              {selectedUsers.has(user.email) && (
                <button
                  onClick={() => toggleInvitePermission(user.email)}
                  className={`p-1 rounded ${
                    selectedUsers.get(user.email)
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title="Toggle invite permission"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
              )}
            </div>
          ))
        ) : searchQuery ? (
          <div className="text-center py-4 text-gray-500">
            No users found
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Search for users to invite
          </div>
        )}
      </div>

      {selectedUsers.size > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Selected Users ({selectedUsers.size})</h3>
          <div className="space-y-2">
            {Array.from(selectedUsers.entries()).map(([email, canInvite]) => (
              <div key={email} className="flex items-center justify-between text-sm">
                <span>{email}</span>
                <span className={canInvite ? 'text-green-600' : 'text-gray-500'}>
                  {canInvite ? 'Can invite others' : 'Cannot invite others'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InviteUsersList;
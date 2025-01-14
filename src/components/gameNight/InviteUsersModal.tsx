import React, { useState, useEffect } from 'react';
import { X, Search, Users, UserPlus, Check } from 'lucide-react';
import { getUsersByEmail } from '../../services/userService';
import { useDebounce } from '../../hooks/useDebounce';

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

interface InviteUsersModalProps {
  onClose: () => void;
  onInvite: (invitees: { email: string; canInviteOthers: boolean }[]) => Promise<void>;
  existingAttendees: string[];
  defaultInvitePermission: boolean;
}

function InviteUsersModal({ 
  onClose, 
  onInvite,
  existingAttendees,
  defaultInvitePermission
}: InviteUsersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Map<string, boolean>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  
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
      setUsers(results.filter(user => !existingAttendees.includes(user.email)));
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
    setSelectedUsers(newSelected);
  };

  const toggleInvitePermission = (email: string) => {
    const newSelected = new Map(selectedUsers);
    newSelected.set(email, !newSelected.get(email));
    setSelectedUsers(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedUsers.size === 0) return;

    setSubmitting(true);
    try {
      const invitees = Array.from(selectedUsers.entries()).map(([email, canInvite]) => ({
        email,
        canInviteOthers: canInvite
      }));
      await onInvite(invitees);
      onClose();
    } catch (err) {
      setError('Failed to send invites');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md my-8">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Invite Players</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

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

          <div className="space-y-2 mb-4">
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
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Selected Users ({selectedUsers.size})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
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

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedUsers.size === 0 || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? (
                'Sending Invites...'
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Send Invites</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteUsersModal;
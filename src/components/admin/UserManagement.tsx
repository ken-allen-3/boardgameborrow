import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/user';
import { getAllUsers, deleteUser, updateUserRole, getUserDetails, UserDetails } from '../../services/adminService';
import { Trash2, Search, Shield, ShieldOff, Info } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email} and all their data? This action cannot be undone.`)) {
      return;
    }

    setDeletingUser(email);
    try {
      await deleteUser(email);
      setUsers(prevUsers => prevUsers.filter(user => user.email !== email));
      setError(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.email} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.photoUrl && (
                      <img
                        src={user.photoUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      {user.isAdmin && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.location || 'Not set'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove' : 'grant'} admin privileges for ${user.email}?`)) {
                        setUpdatingRole(user.email);
                        try {
                          await updateUserRole(user.email, !user.isAdmin);
                          setUsers(prevUsers => 
                            prevUsers.map(u => 
                              u.email === user.email ? {...u, isAdmin: !user.isAdmin} : u
                            )
                          );
                          setError(null);
                        } catch (err) {
                          setError('Failed to update user role');
                          console.error('Error updating user role:', err);
                        } finally {
                          setUpdatingRole(null);
                        }
                      }
                    }}
                    disabled={updatingRole === user.email}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      user.isAdmin 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {user.isAdmin ? (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <ShieldOff className="h-4 w-4" />
                        <span>User</span>
                      </>
                    )}
                    {updatingRole === user.email && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        setLoadingDetails(user.email);
                        try {
                          const details = await getUserDetails(user.email);
                          setSelectedUserDetails(details);
                        } catch (err) {
                          setError('Failed to load user details');
                          console.error('Error loading user details:', err);
                        } finally {
                          setLoadingDetails(null);
                        }
                      }}
                      disabled={loadingDetails === user.email}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View user details"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={deletingUser === user.email || user.isAdmin}
                      className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                        deletingUser === user.email ? 'animate-pulse' : ''
                      }`}
                      title={user.isAdmin ? "Admin users cannot be deleted" : "Delete user"}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUserDetails && (
        <UserDetailsModal
          details={selectedUserDetails}
          onClose={() => setSelectedUserDetails(null)}
        />
      )}
    </div>
  );
}

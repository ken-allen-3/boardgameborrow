import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';

interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

function Users() {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        setUsers(snapshot.val());
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Store current user's credentials
    const adminEmail = currentUser?.email;
    const adminPassword = 'password123'; // You'll need to get this securely

    try {
      const db = getDatabase();
      const userKey = newUserEmail.replace(/\./g, ',');
      const userRef = ref(db, `users/${userKey}`);
      
      // Check if user already exists in database
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setError('A user with this email already exists.');
        setLoading(false);
        return;
      }

      // Create authentication account
      await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);

      // Add user to database
      await set(userRef, {
        email: newUserEmail,
        name: newUserName,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      // Re-authenticate as admin
      if (adminEmail) {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      }

      setSuccess(`User ${newUserName} (${newUserEmail}) has been added successfully!`);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      await loadUsers();
    } catch (err: any) {
      console.error('Error adding user:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError('Failed to add user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    setError(null);
    setSuccess(null);

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const db = getDatabase();
      const userKey = email.replace(/\./g, ',');
      await remove(ref(db, `users/${userKey}`));
      await remove(ref(db, `games/${userKey}`));
      setSuccess('User and their games deleted successfully');
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <UsersIcon className="h-6 w-6" />
          Manage Users
        </h1>
        <p className="text-gray-600">Add and manage users who can access the app.</p>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <form onSubmit={handleAddUser} className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New User
        </h2>
        
        <div className="grid gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding User...' : 'Add User'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Current Users</h2>
          <div className="divide-y">
            {Object.entries(users).map(([key, user]) => (
              <div key={key} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.isAdmin && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteUser(user.email)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}

            {Object.keys(users).length === 0 && (
              <div className="py-4 text-center text-gray-500">
                No users found. Add your first user using the form above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
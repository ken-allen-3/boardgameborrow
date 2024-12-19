import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInvite, claimInvite } from '../services/inviteService';
import ErrorMessage from '../components/ErrorMessage';

function GroupInvite() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { currentUser, signIn } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string>('');
  
  // Sign up form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    loadInvite();
  }, [inviteId]);

  const loadInvite = async () => {
    if (!inviteId) return;

    try {
      const invite = await getInvite(inviteId);
      if (!invite) {
        setError('This invite link has expired or is invalid.');
        return;
      }
      
      setInviterName(invite.inviterName);
    } catch (err) {
      setError('Failed to load invite details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) return;

    try {
      setLoading(true);
      
      // Create account and sign in
      await signIn(email, password);
      
      // Claim the invite
      await claimInvite(inviteId, email, name);
      
      // Redirect to the groups page
      navigate('/groups');
    } catch (err: any) {
      setError(err.message || 'Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Already Signed In</h2>
          <p className="text-gray-600">
            You're already signed in as {currentUser.email}. Would you like to join this group with your current account?
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/groups')}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                await claimInvite(inviteId!, currentUser.email!, currentUser.email!.split('@')[0]);
                navigate('/groups');
              } catch (err: any) {
                setError(err.message);
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Join Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Join Group on BoardShare</h2>
        {inviterName && (
          <p className="text-gray-600">
            {inviterName} has invited you to join their group
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account & Join Group'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export default GroupInvite;
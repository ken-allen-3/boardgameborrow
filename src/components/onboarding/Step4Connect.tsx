import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Users, Mail, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocialContacts } from '../../services/socialContactsService';
import { sendFriendInvite } from '../../services/email/emailService';
import { getUsersByEmail } from '../../services/userService';
import { checkFriendshipStatus } from '../../services/friendService';

interface Step4ConnectProps {
  onNext: () => void;
  onBack: () => void;
}

interface SocialContact {
  name: string;
  email: string;
  source: 'google' | 'facebook';
  photoUrl?: string;
}

interface UserSearchResult {
  email: string;
  firstName: string;
  lastName: string;
}

function Step4Connect({ onNext, onBack }: Step4ConnectProps) {
  const { currentUser } = useAuth();
  const { fetchContacts } = useSocialContacts();
  const [mode, setMode] = useState<'select' | 'social' | 'search' | 'invite'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contacts, setContacts] = useState<SocialContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSocialImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const importedContacts = await fetchContacts();
      setContacts(importedContacts);
      setMode('social');
    } catch (err: any) {
      setError(err.message || 'Failed to import contacts');
    } finally {
      setLoading(false);
    }
  };

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
      const filteredResults = results.filter(user => 
        user.email.replace(/\./g, ',') !== currentUser?.email
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const status = await checkFriendshipStatus(currentUser.email || '', userId);
      if (status === 'none') {
        // Send friend request logic here
        setSuccess('Friend request sent successfully!');
        setSearchResults(prev => prev.filter(user => user.email.replace(/\./g, ',') !== userId));
      } else {
        setError(status === 'pending' ? 'Friend request already sent' : 'Already friends with this user');
      }
    } catch (err) {
      setError('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;

    setLoading(true);
    setError(null);

    try {
      const signupUrl = `${window.location.origin}/signup?ref=${currentUser.email}`;
      const sent = await sendFriendInvite({
        inviterName: currentUser.displayName || currentUser.email,
        inviterEmail: currentUser.email,
        inviteeEmail: inviteEmail,
        signupUrl
      });

      if (sent) {
        setSuccess('Invitation sent successfully!');
        setInviteEmail('');
      } else {
        setError('Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '83.33%' }}></div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          Connect with Friends
        </h1>
        <p className="text-lg text-indigo-600">
          Find friends to share games with
        </p>
      </div>

      {mode === 'select' && (
        <div className="space-y-4">
          <button
            onClick={handleSocialImport}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            <Users className="w-6 h-6" />
            <span className="text-lg">Import Social Contacts</span>
          </button>
          
          <div className="text-center text-gray-500 text-sm">or</div>
          
          <button
            onClick={() => setMode('search')}
            className="w-full flex items-center justify-center gap-3 border-2 border-indigo-600 text-indigo-600 py-4 px-6 rounded-lg hover:bg-indigo-50 transition"
          >
            <Search className="w-6 h-6" />
            <span className="text-lg">Search for Friends</span>
          </button>

          <div className="text-center text-gray-500 text-sm">or</div>

          <button
            onClick={() => setMode('invite')}
            className="w-full flex items-center justify-center gap-3 border-2 border-indigo-600 text-indigo-600 py-4 px-6 rounded-lg hover:bg-indigo-50 transition"
          >
            <Mail className="w-6 h-6" />
            <span className="text-lg">Invite via Email</span>
          </button>
        </div>
      )}

      {mode === 'social' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Social Contacts
            </h3>
            <button
              onClick={() => setMode('select')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contacts found
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {contact.photoUrl && (
                      <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(contact.email.replace(/\./g, ','))}
                    className="text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'search' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Search Friends
            </h3>
            <button
              onClick={() => setMode('select')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by email or name"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {searchResults.length > 0 && (
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
                    className="text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-50"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'invite' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Invite Friend
            </h3>
            <button
              onClick={() => setMode('select')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleInvite}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Friend's Email
              </label>
              <input
                type="email"
                id="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter your friend's email"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
      )}

      {success && (
        <div className="mt-4 text-green-500 text-sm text-center">{success}</div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <button
          onClick={onNext}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg transition font-semibold ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default Step4Connect;

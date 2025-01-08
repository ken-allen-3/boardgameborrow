import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, X, ArrowLeft, Search, Send, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateOnboardingProgress } from '../../services/userService';
import { sendFriendRequest } from '../../services/friendService';
import { getUsersByEmail } from '../../services/userService';
import { sendFriendInvite } from '../../services/email/emailService';
import { useSocialContacts } from '../../services/socialContactsService';

interface FriendsOnboardingModalProps {
  onComplete: () => void;
}

type Step = 'choose' | 'add' | 'invite' | 'social';

interface SocialContact {
  name: string;
  email: string;
  source: 'google' | 'facebook';
  photoUrl?: string;
}

const FriendsOnboardingModal: React.FC<FriendsOnboardingModalProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('choose');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialContacts, setSocialContacts] = useState<SocialContact[]>([]);
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const { currentUser, signInWithGoogle } = useAuth();
  const { fetchContacts } = useSocialContacts();

  const loadSocialContacts = React.useCallback(async () => {
    if (!currentUser?.providerData[0]?.providerId || loadingSocial) {
      return;
    }

    setLoadingSocial(true);
    setNeedsReauth(false);
    
    try {
      const contacts = await fetchContacts();
      setSocialContacts(contacts);
      // If we got no contacts, we might need to re-authenticate
      if (contacts.length === 0) {
        setNeedsReauth(true);
      }
    } catch (error) {
      console.error('Failed to load social contacts:', error);
      setNeedsReauth(true);
    } finally {
      setLoadingSocial(false);
    }
  }, [currentUser, fetchContacts]);

  const handleReauth = async () => {
    try {
      setLoadingSocial(true);
      await signInWithGoogle();
      await loadSocialContacts();
    } catch (error) {
      console.error('Failed to re-authenticate:', error);
      setNeedsReauth(true);
    } finally {
      setLoadingSocial(false);
    }
  };

  // Only load contacts when the social step is first shown
  useEffect(() => {
    if (currentStep === 'social' && !loadingSocial && socialContacts.length === 0 && !needsReauth) {
      loadSocialContacts();
    }
  }, [currentStep]);

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsLoading(true);
        try {
          const results = await getUsersByEmail(searchQuery);
          setSearchResults(results.filter(user => 
            user.email !== currentUser?.email
          ));
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, currentUser]);

  const handleComplete = async () => {
    if (!currentUser?.email) return;

    try {
      await updateOnboardingProgress(currentUser.email, {
        hasFriends: true
      });
      onComplete();
    } catch (error) {
      console.error('Failed to update onboarding progress:', error);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    if (!currentUser?.email) return;
    const userId = currentUser.email.replace(/\./g, ',');

    try {
      await sendFriendRequest(userId, toUserId);
      handleComplete();
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  const handleSendInvite = async (email: string = inviteEmail) => {
    if (!email) return;
    
    try {
      const signupUrl = `${window.location.origin}/signup?ref=${encodeURIComponent(currentUser?.email || '')}`;
      await sendFriendInvite({
        inviteeEmail: email,
        inviterName: currentUser?.displayName || 'A user',
        inviterEmail: currentUser?.email || '',
        signupUrl
      });
      handleComplete();
    } catch (error) {
      console.error('Failed to send invite:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'choose':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Connect with Friends</h2>
              <button onClick={handleComplete} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 mb-8">
              BoardGameBorrow is more fun with friends! Add existing users or invite your friends to join.
            </p>

            <div className="space-y-4">
              {currentUser?.providerData[0]?.providerId && (
                <button
                  onClick={() => setCurrentStep('social')}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Users size={20} />
                  <span>Import from {currentUser.providerData[0].providerId === 'google.com' ? 'Google' : 'Facebook'}</span>
                </button>
              )}

              <button
                onClick={() => setCurrentStep('add')}
                className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <UserPlus size={20} />
                <span>Add Existing Users</span>
              </button>

              <button
                onClick={() => setCurrentStep('invite')}
                className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Mail size={20} />
                <span>Invite Friends via Email</span>
              </button>

              <button
                onClick={handleComplete}
                className="w-full text-gray-500 hover:text-gray-700 py-2"
              >
                Skip for now
              </button>
            </div>
          </>
        );

      case 'social':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentStep('choose')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Import from {currentUser?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Facebook'}
                </h2>
              </div>
              <button onClick={handleComplete} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {loadingSocial ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your contacts...</p>
                </div>
              ) : needsReauth ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please sign in again to access your contacts.</p>
                  <button
                    onClick={handleReauth}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                  >
                    <RefreshCw size={16} />
                    <span>Sign In Again</span>
                  </button>
                </div>
              ) : socialContacts.length > 0 ? (
                socialContacts.map((contact) => (
                  <div key={contact.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {contact.photoUrl && (
                        <img 
                          src={contact.photoUrl} 
                          alt={contact.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSendInvite(contact.email)}
                      className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600"
                    >
                      <Mail size={20} />
                      <span>Invite</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No contacts found with email addresses
                </div>
              )}
            </div>
          </>
        );

      case 'add':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentStep('choose')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Add Friends</h2>
              </div>
              <button onClick={handleComplete} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleSendRequest(user.email.replace(/\./g, ','))}
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                    >
                      <UserPlus size={20} />
                      <span>Add Friend</span>
                    </button>
                  </div>
                ))
              ) : searchQuery.length >= 3 ? (
                <div className="text-center text-gray-500">No users found</div>
              ) : (
                <div className="text-center text-gray-500">Type at least 3 characters to search</div>
              )}
            </div>
          </>
        );

      case 'invite':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentStep('choose')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-semibold text-gray-900">Invite Friends</h2>
              </div>
              <button onClick={handleComplete} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Friend's Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter your friend's email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => handleSendInvite()}
                disabled={!inviteEmail}
                className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                <span>Send Invitation</span>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default FriendsOnboardingModal;

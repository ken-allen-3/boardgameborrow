import React, { useState } from 'react';
import { UserPlus, Mail, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateOnboardingProgress } from '../../services/userService';
import { sendFriendRequest } from '../../services/friendService';
import AddFriendModal from '../friends/AddFriendModal';
import InviteFriendModal from '../friends/InviteFriendModal';

interface FriendsOnboardingModalProps {
  onComplete: () => void;
}

const FriendsOnboardingModal: React.FC<FriendsOnboardingModalProps> = ({ onComplete }) => {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const { currentUser } = useAuth();

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
      setShowAddFriend(false);
      handleComplete();
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Connect with Friends</h2>
          <button
            onClick={handleComplete}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          BoardGameBorrow is more fun with friends! Add existing users or invite your friends to join.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setShowAddFriend(true)}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus size={20} />
            <span>Add Existing Users</span>
          </button>

          <button
            onClick={() => setShowInviteFriend(true)}
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

        {showAddFriend && (
          <AddFriendModal
            onClose={() => setShowAddFriend(false)}
            onSendRequest={handleSendRequest}
            currentUserId={currentUser?.email?.replace(/\./g, ',') || ''}
          />
        )}

        {showInviteFriend && (
          <InviteFriendModal
            onClose={() => {
              setShowInviteFriend(false);
              handleComplete();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FriendsOnboardingModal;

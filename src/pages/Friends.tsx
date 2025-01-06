import React, { useState, useEffect } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FriendProfile } from '../types/friend';
import {
  getFriendsList,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend
} from '../services/friendService';
import FriendsList from '../components/friends/FriendsList';
import FriendRequestsList from '../components/friends/FriendRequestsList';
import AddFriendModal from '../components/friends/AddFriendModal';
import InviteFriendModal from '../components/friends/InviteFriendModal';
import LoadingScreen from '../components/LoadingScreen';
import ErrorMessage from '../components/ErrorMessage';

const Friends = () => {
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);

  const { currentUser } = useAuth();
  const userId = currentUser?.email?.replace(/\./g, ',') || '';

  useEffect(() => {
    if (currentUser?.email) {
      loadFriendsData();
    }
  }, [currentUser]);

  const loadFriendsData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [friendsList, requestsList] = await Promise.all([
        getFriendsList(userId),
        getPendingRequests(userId)
      ]);

      setFriends(friendsList);
      setPendingRequests(requestsList);
    } catch (err) {
      setError('Failed to load friends data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    if (!userId) return;

    try {
      await sendFriendRequest(userId, toUserId);
      await loadFriendsData();
      setError(null);
    } catch (err) {
      setError('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    if (!userId) return;

    try {
      await acceptFriendRequest(userId, friendId);
      await loadFriendsData();
      setError(null);
    } catch (err) {
      setError('Failed to accept friend request. Please try again.');
    }
  };

  const handleDeclineRequest = async (friendId: string) => {
    if (!userId) return;

    try {
      await declineFriendRequest(userId, friendId);
      await loadFriendsData();
      setError(null);
    } catch (err) {
      setError('Failed to decline friend request. Please try again.');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!userId || !window.confirm('Are you sure you want to remove this friend?')) return;

    try {
      await removeFriend(userId, friendId);
      await loadFriendsData();
      setError(null);
    } catch (err) {
      setError('Failed to remove friend. Please try again.');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading friends..." />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <UserPlus size={20} />
              Add Friend
            </button>
            <button
              onClick={() => setShowInviteFriend(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Mail size={20} />
              Invite Friend
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {pendingRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
            <FriendRequestsList
              requests={pendingRequests}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
            />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">My Friends</h2>
          <FriendsList
            friends={friends}
            onRemoveFriend={handleRemoveFriend}
          />
        </div>
      </div>

      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onSendRequest={handleSendRequest}
          currentUserId={userId}
        />
      )}

      {showInviteFriend && (
        <InviteFriendModal
          onClose={() => setShowInviteFriend(false)}
        />
      )}
    </div>
  );
};

export default Friends;

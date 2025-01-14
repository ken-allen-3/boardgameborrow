import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../types/group';
import { getUserGroups, getAllPublicGroups, createGroup, leaveGroup, createGroupInvite, requestToJoinGroup } from '../services/groupService';
import { logError, createAppError } from '../utils/errorUtils';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupForm from '../components/groups/CreateGroupForm';

function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email) {
      loadGroups();
      loadPublicGroups();
    }
  }, [currentUser]);

  const loadPublicGroups = async () => {
    if (!currentUser?.email) return;

    try {
      const groups = await getAllPublicGroups();
      // Filter out groups user is already a member of
      const userKey = currentUser.email.replace(/\./g, ',');
      setPublicGroups(groups.filter(group => !group.members[userKey]));
    } catch (err) {
      console.error('Error loading public groups:', err);
    }
  };

  const loadGroups = async () => {
    if (!currentUser?.email) return;

    try {
      console.log('[Groups] Loading groups for user:', currentUser.email);
      const userGroups = await getUserGroups(currentUser.email);
      setGroups(userGroups);
      setError(null);
    } catch (err) {
      const error = createAppError(
        err instanceof Error ? err.message : 'Failed to load groups. Please try again.',
        'LOAD_GROUPS_ERROR',
        { email: currentUser.email },
        'Groups',
        'loadGroups'
      );
      logError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (data: {
    name: string;
    description: string;
    visibility: GroupVisibility;
    theme: GroupTheme;
  }) => {
    if (!currentUser?.email) return;

    console.log('[Groups] Creating group:', data);
    try {
      await createGroup(
        currentUser.email,
        currentUser.email.split('@')[0],
        data.name,
        data.description,
        data.visibility,
        data.theme
      );
      
      setSuccess('Group created successfully!');
      setShowCreateForm(false);
      await loadGroups();
    } catch (err) {
      const error = err instanceof Error ? createAppError(
        err.message || 'Failed to create group. Please try again.',
        'CREATE_GROUP_ERROR',
        { name: data },
        'Groups',
        'handleCreateGroup'
      ) : new Error('Failed to create group');
      logError(error);
      setError(error.message);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUser?.email || !window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await leaveGroup(currentUser.email, groupId);
      setSuccess('You have left the group.');
      await loadGroups();
    } catch (err: any) {
      setError(err.message || 'Failed to leave group. Please try again.');
    }
  };

  const handleCreateInvite = async (groupId: string) => {
    try {
      const inviteCode = await createGroupInvite(groupId);
      await loadGroups();
      setSuccess('Invite link generated successfully!');
    } catch (err) {
      setError('Failed to generate invite link. Please try again.');
    }
  };

  const handleCopyInvite = async (groupId: string, inviteCode: string) => {
    try {
      const inviteUrl = `${window.location.origin}/groups/invite/${inviteCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteId(groupId);
      setSuccess('Invite link copied to clipboard!');
      
      setTimeout(() => {
        setCopiedInviteId(null);
      }, 3000);
    } catch (err) {
      setError('Failed to copy invite link. Please try again.');
    }
  };

  const handleJoinRequest = async (groupId: string) => {
    if (!currentUser?.email) return;

    try {
      await requestToJoinGroup(groupId, currentUser.email);
      setSuccess('Join request sent successfully!');
      await loadPublicGroups(); // Refresh public groups list
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send join request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Groups</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Create Group</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}
      </div>

      {showCreateForm && (
        <CreateGroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="grid gap-6">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            currentUserEmail={currentUser!.email!}
            onLeave={handleLeaveGroup}
            onCopyInvite={handleCopyInvite}
            onCreateInvite={handleCreateInvite}
            copiedInviteId={copiedInviteId}
          />
        ))}

        {groups.length === 0 && !showCreateForm && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">You haven't joined any groups yet.</p>
            <p className="text-sm text-gray-500">Create your first group using the button above.</p>
          </div>
        )}
      </div>

      {/* Browse Public Groups Section */}
      {publicGroups.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Browse Public Groups</h2>
          <div className="grid gap-6">
            {publicGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserEmail={currentUser!.email!}
                onRequestJoin={() => handleJoinRequest(group.id)}
                showJoinButton={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
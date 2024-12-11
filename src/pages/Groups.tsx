import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../types/group';
import { getUserGroups, createGroup, leaveGroup, createGroupInvite } from '../services/groupService';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupForm from '../components/groups/CreateGroupForm';

function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email) {
      loadGroups();
    }
  }, [currentUser]);

  const loadGroups = async () => {
    if (!currentUser?.email) return;

    try {
      const userGroups = await getUserGroups(currentUser.email);
      setGroups(userGroups);
      setError(null);
    } catch (err) {
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (name: string, description: string, isPrivate: boolean) => {
    if (!currentUser?.email) return;

    try {
      await createGroup(
        currentUser.email,
        currentUser.email.split('@')[0],
        name,
        description,
        isPrivate
      );
      
      setSuccess('Group created successfully!');
      setShowCreateForm(false);
      await loadGroups();
    } catch (err) {
      setError('Failed to create group. Please try again.');
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
    </div>
  );
}

export default Groups;
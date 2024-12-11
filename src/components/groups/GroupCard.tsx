import React, { useState } from 'react';
import { Users, UserPlus, LogOut, Copy, Check } from 'lucide-react';
import { Group } from '../../types/group';

interface GroupCardProps {
  group: Group;
  currentUserEmail: string;
  onLeave: (groupId: string) => void;
  onCopyInvite: (groupId: string, inviteCode: string) => void;
  onCreateInvite: (groupId: string) => void;
  copiedInviteId: string | null;
}

function GroupCard({
  group,
  currentUserEmail,
  onLeave,
  onCopyInvite,
  onCreateInvite,
  copiedInviteId,
}: GroupCardProps) {
  const userRole = group.members[currentUserEmail.replace(/\./g, ',')]?.role;
  const isOwner = userRole === 'owner';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{group.name}</h3>
            {group.description && (
              <p className="text-gray-600 mt-1">{group.description}</p>
            )}
          </div>
          {group.isPrivate && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
              Private
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{Object.keys(group.members).length} members</span>
        </div>

        {isOwner && (
          <div className="border-t mt-4 pt-4 space-y-2">
            {group.inviteCode ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Share this invite link:</div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block overflow-x-auto">
                    {`${window.location.origin}/groups/invite/${group.inviteCode}`}
                  </code>
                </div>
                <button
                  onClick={() => onCopyInvite(group.id, group.inviteCode!)}
                  className="p-2 text-gray-500 hover:text-indigo-600 transition"
                  title="Copy invite link"
                >
                  {copiedInviteId === group.id ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => onCreateInvite(group.id)}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <UserPlus className="h-4 w-4" />
                <span>Generate Invite Link</span>
              </button>
            )}
          </div>
        )}

        {!isOwner && (
          <div className="border-t mt-4 pt-4">
            <button
              onClick={() => onLeave(group.id)}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Group</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupCard;
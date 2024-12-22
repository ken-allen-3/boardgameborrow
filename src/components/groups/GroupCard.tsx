import React, { useState } from 'react';
import { Users, UserPlus, LogOut, Copy, Check, Dice6, Brain, PartyPopper, MapPin, Layout } from 'lucide-react';
import { Group } from '../../types/group';

const THEME_ICONS = {
  family: Dice6,
  strategy: Brain,
  party: PartyPopper,
  regional: MapPin,
  general: Layout
};

const THEME_LABELS = {
  family: 'Family Games',
  strategy: 'Strategy Games',
  party: 'Party Games',
  regional: 'Regional Group',
  general: 'General Gaming'
};

interface GroupCardProps {
  group: Group;
  currentUserEmail: string;
  onLeave?: (groupId: string) => void;
  onCopyInvite?: (groupId: string, inviteCode: string) => void;
  onCreateInvite?: (groupId: string) => void;
  onRequestJoin?: () => void;
  showJoinButton?: boolean;
  copiedInviteId?: string | null;
}

function GroupCard({
  group,
  currentUserEmail,
  onLeave,
  onCopyInvite,
  onCreateInvite,
  onRequestJoin,
  showJoinButton,
  copiedInviteId,
}: GroupCardProps) {
  console.log('[GroupCard] Rendering group:', {
    id: group.id,
    name: group.name,
    visibility: group.visibility,
    members: group.members,
    currentUserEmail
  });

  const userRole = group.members[currentUserEmail.replace(/\./g, ',')]?.role;
  const isOwner = userRole === 'owner';

  const ThemeIcon = THEME_ICONS[group.theme];
  const defaultCover = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=400';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="aspect-[2/1] relative">
        <img
          src={group.coverImage || defaultCover}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-semibold text-white mb-2">{group.name}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-white/90">
              <ThemeIcon className="h-4 w-4" />
              <span>{THEME_LABELS[group.theme]}</span>
            </span>
            {group.visibility === 'private' && (
              <span className="px-2 py-1 bg-white/90 text-gray-600 text-sm rounded-full">
                Private
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {typeof group.description === 'string' && group.description.trim() && (
          <p className="text-gray-600 mb-4">{group.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
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
                    {group.inviteCode ? `${window.location.origin}/groups/invite/${group.inviteCode}` : ''}
                  </code>
                </div>
                <button
                  onClick={() => group.inviteCode && onCopyInvite(group.id, group.inviteCode)}
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

        {showJoinButton && onRequestJoin && (
          <button
            onClick={onRequestJoin}
            className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Request to Join
          </button>
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
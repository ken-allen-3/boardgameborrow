export type GroupRole = 'owner' | 'moderator' | 'member';
export type GroupVisibility = 'public' | 'private';
export type GroupTheme = 'family' | 'strategy' | 'party' | 'regional' | 'general';

export interface GroupMember {
  role: GroupRole;
  joinedAt: string;
  name: string;
  canInviteOthers: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  visibility: GroupVisibility;
  theme: GroupTheme;
  coverImage?: string;
  inviteCode?: string;
  joinRequests?: Record<string, {
    userId: string;
    requestedAt: string;
    message?: string;
  }>;
  members: Record<string, GroupMember>;
  createdAt: string;
  updatedAt: string;
}
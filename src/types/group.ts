export interface GroupMember {
  role: 'owner' | 'member';
  joinedAt: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  inviteCode?: string;
  members: Record<string, GroupMember>;
  createdAt: string;
}
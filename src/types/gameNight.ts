export interface GameNight {
  id: string;
  hostId: string;
  title: string;
  coverImage?: string;
  date: string;
  location: string;
  description?: string;
  maxPlayers?: number;
  suggestedGames: string[]; // Game IDs
  attendees: {
    [userKey: string]: {
      status: 'going' | 'maybe' | 'declined';
      response?: string;
      gamesTheyBring?: string[]; // Game IDs
      canInviteOthers?: boolean;
    };
  };
  inviteSettings: {
    allowInvites: boolean;
    defaultInvitePermission: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
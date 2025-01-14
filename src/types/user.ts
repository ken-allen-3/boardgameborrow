export interface OnboardingProgress {
    hasGames: boolean;
    hasBorrowed: boolean;
    hasJoinedGroup: boolean;
    hasAttendedGameNight: boolean;
    hasFriends: boolean;
    hasLocation: boolean;
    onboardingDismissed: boolean;
  }
  
export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  location: string;
  coordinates?: {
    longitude: number;
    latitude: number;
  };
  isAdmin: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
  lastLogin: string;
  onboardingProgress: OnboardingProgress;
}
  
  // Type for partial updates to user profile
  export type UserProfileUpdate = Partial<Omit<UserProfile, 'email' | 'createdAt'>>;

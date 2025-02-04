import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { identifyUser } from '../services/analyticsService';
import { ref, set, get, update } from 'firebase/database';
import { 
  auth, 
  database, 
  validateDatabaseAccess,
  googleProvider,
  facebookProvider 
} from '../config/firebase';
// Define the shape of our auth context
interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  updateProfile: (data: Omit<SignUpData, 'email' | 'password'>) => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithFacebook: () => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  isNewUser: boolean;
  needsOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  googleAccessToken: string | null;
}

// Define the shape of signup data
interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  location?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State declarations
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const updateShowWelcome = async (show: boolean) => {
    setShowWelcome(show);
    if (!show && currentUser?.email) {
      const userRef = ref(database, `users/${currentUser.email.replace(/\./g, ',')}`);
      await update(userRef, {
        hasSeenWelcome: true,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Auth functions
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (data: SignUpData): Promise<void> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Create user profile in database
      const userRef = ref(database, `users/${data.email.replace(/\./g, ',')}`);
      await set(userRef, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        photoUrl: data.photoUrl,
        location: data.location || '',
        isAdmin: data.email === 'kenny@springwavestudios.com',
        hasCompletedOnboarding: false,
        hasSeenWelcome: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      setIsNewUser(true);
      setShowWelcome(true);
      setNeedsOnboarding(true);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    try {
      // Add scopes for Google People API
      googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Store the access token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Failed to get Google access token');
      }
      setGoogleAccessToken(credential.accessToken);
      if (result.user) {
        const userRef = ref(database, `users/${result.user.email?.replace(/\./g, ',')}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          // New user - set up their profile
          await set(userRef, {
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            photoUrl: result.user.photoURL,
            location: '',
            isAdmin: result.user.email === 'kenny@springwavestudios.com',
            hasCompletedOnboarding: false,
            hasSeenWelcome: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
          setNeedsOnboarding(true);
        }
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (result.user) {
        const userRef = ref(database, `users/${result.user.email?.replace(/\./g, ',')}`);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
          await set(userRef, {
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || '',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            photoUrl: result.user.photoURL,
            location: '',
            isAdmin: false,
            hasCompletedOnboarding: false,
            hasSeenWelcome: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
          setNeedsOnboarding(true);
        }
      }
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Facebook');
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setGoogleAccessToken(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    if (!currentUser?.email) return;

    try {
      const userRef = ref(database, `users/${currentUser.email.replace(/\./g, ',')}`);
      await update(userRef, {
        hasCompletedOnboarding: true,
        updatedAt: new Date().toISOString()
      });
      setNeedsOnboarding(false);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete onboarding');
    }
  };

  // Auth state observer
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] Auth state changed:', { 
        email: user?.email,
        uid: user?.uid
      });
      
      setCurrentUser(user);
      
      if (user?.email) {
        // Identify user in analytics
        identifyUser(user.uid, {
          email: user.email,
          name: user.displayName || '',
          isAdmin: user.email === 'kenny@springwavestudios.com'
        });
        try {
          const hasAccess = await validateDatabaseAccess(user.email);
          if (!hasAccess) {
            setError('Database access denied. Please contact support.');
            return;
          }

          setIsAdmin(user.email === 'kenny@springwavestudios.com');
          
          // Get user data
          const userRef = ref(database, `users/${user.email.replace(/\./g, ',')}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val();
          
          const isFirstTimeUser = !userData?.hasCompletedOnboarding;
          const hasSeenWelcome = userData?.hasSeenWelcome ?? false;
          setIsNewUser(isFirstTimeUser);
          setShowWelcome(!hasSeenWelcome);
          setNeedsOnboarding(isFirstTimeUser && !userData?.location);
          
          setError(null);
        } catch (err) {
          console.error('Error setting up user:', err);
          setError('Failed to access user data. Please try again.');
        }
      } else {
        setIsAdmin(false);
        setIsNewUser(false);
        setShowWelcome(false);
        setNeedsOnboarding(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateProfile = async (data: Omit<SignUpData, 'email' | 'password'>): Promise<void> => {
    if (!currentUser?.email) {
      throw new Error('No user logged in');
    }

    try {
      const userRef = ref(database, `users/${currentUser.email.replace(/\./g, ',')}`);
      await update(userRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        photoUrl: data.photoUrl,
        location: data.location || '',
        updatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Context value
  const value: AuthContextType = {
    currentUser,
    signIn,
    signUp,
    updateProfile,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    loading,
    error,
    isAdmin,
    showWelcome,
    setShowWelcome: updateShowWelcome,
    isNewUser,
    needsOnboarding,
    completeOnboarding,
    googleAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {error ? (
        <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : !loading ? (
        <>
          {children}
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

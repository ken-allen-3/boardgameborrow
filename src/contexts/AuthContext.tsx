import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database, ensureDatabaseStructure, validateDatabaseAccess } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  showWelcome: boolean;
  setShowWelcome: (show: boolean) => void;
  isNewUser: boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Set up persistence immediately when the auth module is initialized
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error('Error setting persistence:', err);
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] Auth state changed:', { 
        email: user?.email,
        uid: user?.uid
      });
      
      setCurrentUser(user);
      
      if (user?.email) {
        try {
          // Check database access
          const hasAccess = await validateDatabaseAccess(user.email);
          if (!hasAccess) {
            setError('Database access denied. Please contact support.');
            return;
          }

          // Set up user structure
          await ensureDatabaseStructure(user.email);
          
          // Update admin status
          setIsAdmin(user.email === 'kenny@springwavestudios.com');

          // Check if this is the user's first login
          const userRef = ref(database, `users/${user.email.replace(/\./g, ',')}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val();
          
          console.log('[Auth] User data:', userData);
          
          const isFirstTimeUser = !userData?.hasCompletedOnboarding;
          console.log('[Auth] Is first time user:', isFirstTimeUser);
          
          if (isFirstTimeUser) {
            console.log('[Auth] Setting new user flags...');
            setShowWelcome(true);
            setIsNewUser(true);
            
            // Mark onboarding as completed
            await set(userRef, {
              ...userData,
              hasCompletedOnboarding: true,
              lastLogin: new Date().toISOString()
            });
          } else {
            setIsNewUser(false);
            setShowWelcome(false);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error setting up user:', err);
          setError('Failed to access user data. Please try again.');
        }
      } else {
        setIsAdmin(false);
        setIsNewUser(false);
        setShowWelcome(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      
      const userRef = ref(database, `users/${email.replace(/\./g, ',')}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val() || {};
      
      await set(userRef, {
        ...userData,
        email,
        isAdmin: email === 'kenny@springwavestudios.com',
        lastLogin: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Sign in error:', err);
      throw new Error(err.message);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userRef = ref(database, `users/${email.replace(/\./g, ',')}`);
      await set(userRef, {
        email,
        name,
        isAdmin: false,
        hasCompletedOnboarding: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      setIsNewUser(true);
      setShowWelcome(true);
      
      console.log('[Auth] New user created:', {
        email,
        name,
        isNewUser: true
      });
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or sign in.');
      } else if (err.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      throw new Error('Failed to sign out');
    }
  }

  const value = {
    currentUser,
    signIn,
    signUp,
    signOut,
    loading,
    error,
    isAdmin,
    showWelcome,
    setShowWelcome,
    isNewUser
  };

  return (
    <AuthContext.Provider value={value}>
      {error ? (
        <div className="max-w-md mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : !loading ? (
        children
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
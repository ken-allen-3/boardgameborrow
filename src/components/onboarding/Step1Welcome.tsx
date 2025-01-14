import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';

interface Step1WelcomeProps {
  onNext: () => void;
}

function Step1Welcome({ onNext }: Step1WelcomeProps) {
  const { currentUser, setShowWelcome } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      if (currentUser?.email) {
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.email.replace(/\./g, ',')}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        if (userData?.firstName) {
          setFirstName(userData.firstName);
        }
      }
    };
    fetchUserName();
  }, [currentUser]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          👋 {firstName ? `Welcome ${firstName}!` : 'Welcome!'}
        </h1>
        <p className="text-lg text-gray-600">
          Ready to discover, share, and play more board games? Whether you're a collector or just trying to plan a great game night with friends, we make it easy to find and borrow games you'll love.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold"
      >
        <span>Get Started</span>
        <ArrowRight className="h-5 w-5" />
      </button>

    </div>
  );
}

export default Step1Welcome;

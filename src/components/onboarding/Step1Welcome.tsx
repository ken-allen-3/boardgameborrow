<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';
=======
import React from 'react';
import { Camera, Users, Dice6, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8

interface Step1WelcomeProps {
  onNext: () => void;
}

function Step1Welcome({ onNext }: Step1WelcomeProps) {
  const { currentUser, setShowWelcome } = useAuth();
<<<<<<< HEAD
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

=======

  const features = [
    {
      icon: Camera,
      title: "Add Your Games",
      description: "Quickly add games by scanning or searching our database",
      persona: "Game Collectors"
    },
    {
      icon: Users,
      title: "Share & Borrow",
      description: "Connect with friends and share your collection easily",
      persona: "Community Builders"
    },
    {
      icon: Dice6,
      title: "Game Nights Made Easy",
      description: "Organize events and discover new games to play",
      persona: "Casual Gamers"
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '16.67%' }}></div>
      </div>

      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          Welcome to BoardGameBorrow
        </h1>
        <p className="text-lg text-indigo-600">
          {currentUser?.displayName ? `Great to have you, ${currentUser.displayName.split(' ')[0]}!` : 'Your gateway to endless gaming possibilities'}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-6 mb-8">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <feature.icon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
              <span className="inline-block mt-1 text-sm text-indigo-600">
                Perfect for {feature.persona}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Next Button */}
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold"
      >
<<<<<<< HEAD
        <span>Get Started</span>
        <ArrowRight className="h-5 w-5" />
      </button>

=======
        <span>Let's Get Started</span>
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* Skip Option */}
      <button
        onClick={() => setShowWelcome(false)}
        className="w-full text-gray-500 text-sm mt-4 hover:text-gray-700 transition"
      >
        Skip Introduction
      </button>
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8
    </div>
  );
}

export default Step1Welcome;

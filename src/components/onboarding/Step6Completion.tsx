<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';

interface Step6CompletionProps {
  onNext: () => void;
}

function Step6Completion({ onNext }: Step6CompletionProps) {
=======
import React, { useState, useEffect } from 'react';
import { Calendar, Search, Trophy, ArrowRight } from 'lucide-react';
import ReactConfetti from 'react-confetti';

interface Step6CompletionProps {
  onFinish: () => void;
}

function Step6Completion({ onFinish }: Step6CompletionProps) {
  const [showConfetti, setShowConfetti] = useState(true);
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
<<<<<<< HEAD
  const [showConfetti, setShowConfetti] = useState(true);
=======
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 relative">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
<<<<<<< HEAD
          gravity={0.2}
        />
      )}
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">
          You're All Set!
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Have fun exploring the app! You're ready to start borrowing, lending, and making memories. Try using our magic AI camera to scan in the rest of your board game collection all at once!
        </p>

        <button
          onClick={onNext}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Start Exploring
        </button>
      </div>
=======
        />
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Trophy className="w-16 h-16 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          Welcome to BoardGameBorrow!
        </h1>
        <p className="text-lg text-indigo-600">
          You're all set to start your board gaming journey
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 mb-8">
        {/* Game Night Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-semibold">Join a Game Night</h3>
              <p className="text-indigo-100">Connect with local players and make new friends</p>
            </div>
          </div>
          <button className="w-full bg-white text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2">
            <span>Find Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Explore Games Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-xl text-white shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex items-center gap-4 mb-4">
            <Search className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-semibold">Discover Games</h3>
              <p className="text-indigo-100">Browse and borrow from your local community</p>
            </div>
          </div>
          <button className="w-full bg-white text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2">
            <span>Browse Games</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">500+</div>
          <div className="text-sm text-gray-600">Games Available</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">200+</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">50+</div>
          <div className="text-sm text-gray-600">Weekly Events</div>
        </div>
      </div>

      {/* Final CTA */}
      <button
        onClick={onFinish}
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center gap-2"
      >
        <span>Start Exploring</span>
        <ArrowRight className="w-5 h-5" />
      </button>
>>>>>>> dfb5b22bd5e8b9805e62541c2feaf9074f87d6e8
    </div>
  );
}

export default Step6Completion;

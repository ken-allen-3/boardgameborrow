import React from 'react';
import { X, Camera, Users, Dice6, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTutorial } from '../tutorial/TutorialProvider';
import { useAuth } from '../../contexts/AuthContext';

interface WelcomeModalProps {
  onClose: () => void;
}

function WelcomeModal({ onClose }: WelcomeModalProps) {
  const { startTutorial } = useTutorial();
  const { setShowWelcome } = useAuth();

  const handleGetStarted = () => {
    setShowWelcome(false);
    onClose();
    // Start tutorial after modal closes
    setTimeout(startTutorial, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="relative">
          {/* Header with decorative dice */}
          <div className="absolute -top-8 -left-8 transform rotate-12">
            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-4 border-indigo-100">
              <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <div className="w-2 h-2 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <div className="w-2 h-2 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <div className="w-2 h-2 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <div className="w-2 h-2 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowWelcome(false);
              onClose();
            }}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-indigo-900 mb-2">
              Welcome to BoardGameBorrow!
            </h2>
            <p className="text-center text-indigo-600 mb-8">
              Share and borrow board games with friends
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Camera className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Your Games</h3>
                  <p className="text-gray-600">
                    Search our database to build your collection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Join Groups</h3>
                  <p className="text-gray-600">
                    Connect with friends and share your collection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Dice6 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start Playing</h3>
                  <p className="text-gray-600">
                    Borrow games and organize game nights easily
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/my-games"
              onClick={handleGetStarted}
              className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;

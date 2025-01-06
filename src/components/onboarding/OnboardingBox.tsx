import React from 'react';
import { Link } from 'react-router-dom';
import { Dice6, Users, Calendar, X, Plus, ArrowRight, Check } from 'lucide-react';
import { OnboardingProgress } from '../../types/user';

interface OnboardingBoxProps {
  onDismiss: () => void;
  progress: OnboardingProgress;
}

function OnboardingBox({ onDismiss, progress }: OnboardingBoxProps) {
  // Calculate completion percentage
  const steps = [
    progress.hasGames,
    progress.hasBorrowed,
    progress.hasJoinedGroup && progress.hasAttendedGameNight
  ];
  const completedSteps = steps.filter(Boolean).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const StepNumber = ({ number, completed }: { number: number; completed: boolean }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      completed ? 'bg-green-100' : 'bg-gray-100'
    }`}>
      {completed ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <span className="text-gray-600 font-semibold">{number}</span>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-100">
        <div 
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Welcome! Let's get started</h2>
            <p className="text-sm text-gray-500 mt-1">
              {completedSteps === steps.length 
                ? "You're all set! Enjoy playing games with friends." 
                : `${completedSteps} of ${steps.length} steps completed`}
            </p>
          </div>
          <button 
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Build */}
          <div className={`rounded-lg p-4 ${
            progress.hasGames ? 'bg-green-50' : 'bg-indigo-50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <StepNumber number={1} completed={progress.hasGames} />
              <h3 className="font-semibold text-gray-900">Build</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {progress.hasGames 
                ? `You've added your first game!`
                : 'Start by adding games to your collection'}
            </p>
            {!progress.hasGames && (
              <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                <Plus className="h-4 w-4" />
                <span>Add your first game</span>
              </button>
            )}
          </div>

          {/* Borrow */}
          <div className={`rounded-lg p-4 ${
            progress.hasBorrowed ? 'bg-green-50' : 'bg-indigo-50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <StepNumber number={2} completed={progress.hasBorrowed} />
              <h3 className="font-semibold text-gray-900">Borrow</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {progress.hasBorrowed
                ? `You've borrowed your first game!`
                : 'Request to borrow games from friends'}
            </p>
            {!progress.hasBorrowed && (
              <Link 
                to="/borrow"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Dice6 className="h-4 w-4" />
                <span>Browse available games</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Play */}
          <div className={`rounded-lg p-4 ${
            progress.hasJoinedGroup && progress.hasAttendedGameNight 
              ? 'bg-green-50' 
              : 'bg-indigo-50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <StepNumber 
                number={3} 
                completed={progress.hasJoinedGroup && progress.hasAttendedGameNight} 
              />
              <h3 className="font-semibold text-gray-900">Play</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {progress.hasJoinedGroup && progress.hasAttendedGameNight
                ? 'You\'re part of the community!'
                : 'Join groups and organize game nights'}
            </p>
            {(!progress.hasJoinedGroup || !progress.hasAttendedGameNight) && (
              <div className="space-y-2">
                {!progress.hasJoinedGroup && (
                  <Link 
                    to="/groups"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Users className="h-4 w-4" />
                    <span>Join a group</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {!progress.hasAttendedGameNight && (
                  <Link 
                    to="/game-nights"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Plan a game night</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingBox;

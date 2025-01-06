import React from 'react';
import { Link } from 'react-router-dom';
import { Dice6, Users, Calendar, X, Plus, ArrowRight, Check } from 'lucide-react';
import { OnboardingProgress } from '../../types/user';

interface OnboardingBoxProps {
  onDismiss: () => void;
  progress: OnboardingProgress;
  onCameraClick: () => void;
  onSearchClick: () => void;
}

function OnboardingBox({ onDismiss, progress, onCameraClick, onSearchClick }: OnboardingBoxProps) {
  // Calculate completion percentage
  const steps = [
    progress.hasGames,
    progress.hasBorrowed,
    progress.hasJoinedGroup && progress.hasAttendedGameNight
  ];
  const completedSteps = steps.filter(Boolean).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const StepNumber = ({ number, completed }: { number: number; completed: boolean }) => (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
      completed 
        ? 'bg-green-100 ring-2 ring-green-400 ring-offset-2' 
        : 'bg-white shadow-sm ring-2 ring-indigo-100'
    }`}>
      {completed ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <span className="text-indigo-600 font-semibold text-lg">{number}</span>
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Welcome! Let's get started</h2>
            <p className="text-sm text-gray-500 mt-2">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Build */}
          <div className={`rounded-lg p-6 transition-all duration-200 ${
            progress.hasGames 
              ? 'bg-green-50 ring-1 ring-green-100' 
              : 'bg-white ring-1 ring-indigo-100 hover:ring-indigo-200'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <StepNumber number={1} completed={progress.hasGames} />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Build</h3>
                <p className="text-sm text-gray-600">
                  {progress.hasGames 
                    ? `You've added your first game!`
                    : 'Start by adding games to your collection'}
                </p>
              </div>
            </div>
            {!progress.hasGames && (
              <button 
                onClick={onSearchClick}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 transition-colors"
                data-tutorial="add-game-button"
              >
                <Plus className="h-4 w-4" />
                <span>Add your first game</span>
              </button>
            )}
          </div>

          {/* Borrow */}
          <div className={`rounded-lg p-6 transition-all duration-200 ${
            progress.hasBorrowed 
              ? 'bg-green-50 ring-1 ring-green-100' 
              : 'bg-white ring-1 ring-indigo-100 hover:ring-indigo-200'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <StepNumber number={2} completed={progress.hasBorrowed} />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Borrow</h3>
                <p className="text-sm text-gray-600">
                  {progress.hasBorrowed
                    ? `You've borrowed your first game!`
                    : 'Request to borrow games from friends'}
                </p>
              </div>
            </div>
            {!progress.hasBorrowed && (
              <Link 
                to="/borrow"
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 transition-colors"
              >
                <Dice6 className="h-4 w-4" />
                <span>Browse available games</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Play */}
          <div className={`rounded-lg p-6 transition-all duration-200 ${
            progress.hasJoinedGroup && progress.hasAttendedGameNight 
              ? 'bg-green-50 ring-1 ring-green-100' 
              : 'bg-white ring-1 ring-indigo-100 hover:ring-indigo-200'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <StepNumber 
                number={3} 
                completed={progress.hasJoinedGroup && progress.hasAttendedGameNight} 
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Play</h3>
                <p className="text-sm text-gray-600">
                  {progress.hasJoinedGroup && progress.hasAttendedGameNight
                    ? 'You\'re part of the community!'
                    : 'Join groups and organize game nights'}
                </p>
              </div>
            </div>
            {(!progress.hasJoinedGroup || !progress.hasAttendedGameNight) && (
              <div className="space-y-3 mt-2">
                {!progress.hasJoinedGroup && (
                  <Link 
                    to="/groups"
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span>Join a group</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {!progress.hasAttendedGameNight && (
                  <Link 
                    to="/game-nights"
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
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

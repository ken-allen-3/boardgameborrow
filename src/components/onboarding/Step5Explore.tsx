import React, { useState } from 'react';
import { ArrowRight, Loader2, Search, BookOpen, Calendar, HandCoins } from 'lucide-react';

interface Step5ExploreProps {
  onNext: () => void;
  onBack: () => void;
}

function Step5Explore({ onNext, onBack }: Step5ExploreProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'events'>('library');

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-3">
          Explore Games & Events
        </h1>
        <p className="text-lg text-indigo-600">
          Discover games to borrow and events to join
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
            activeTab === 'library'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Game Library</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Game Events</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder={activeTab === 'library' ? "Search for games..." : "Search for events..."}
          className="w-full p-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Search
          size={20}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>

      {/* Main Content */}
      <div className="mb-8">
        {activeTab === 'library' ? (
          <div className="space-y-6">
            {/* Borrow Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <HandCoins className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Borrow Games</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Browse available games from your local community. Filter by genre, player count, or duration.
              </p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                Browse Available Games
              </button>
            </div>

            {/* Lend Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Share Your Games</h3>
              </div>
              <p className="text-gray-600 mb-4">
                List your games for others to borrow. Set availability, duration, and lending preferences.
              </p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                Add Games to Share
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sample Events */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">Weekly Game Night</h4>
                  <p className="text-gray-600 text-sm">Every Thursday • 7:00 PM</p>
                  <p className="text-gray-500 mt-2">Join our regular gaming sessions with different themes each week.</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Join
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">Strategy Games Tournament</h4>
                  <p className="text-gray-600 text-sm">Next Saturday • 2:00 PM</p>
                  <p className="text-gray-500 mt-2">Compete in various strategy games with prizes for winners.</p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onNext}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg transition font-semibold ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full text-gray-500 text-sm hover:text-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default Step5Explore;

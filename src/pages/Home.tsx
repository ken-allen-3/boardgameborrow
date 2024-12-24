import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dice6, Users, Share2, Calendar, ArrowRight, Mail } from 'lucide-react';
import { sendWaitlistEmail } from '../services/email';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await sendWaitlistEmail(email);
      setWaitlistSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Failed to submit to waitlist:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/signup?invite=${inviteCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue-50 to-white py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-gray-900 mb-4 sm:mb-6">
            Game Nights, Made Easy with BoardGameBorrow
          </h1>
          <p className="text-lg sm:text-xl text-brand-gray-600 max-w-2xl mx-auto px-2">
            Create your game inventory, share with friends, and enjoy new games without the hassle.
          </p>
          <div className="mt-12 max-w-md mx-auto">
            <form onSubmit={handleWaitlistSubmit} className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input pl-10 w-full"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary whitespace-nowrap disabled:opacity-50"
                >
                  {submitting ? 'Joining...' : 'Join the Waitlist'}
                </button>
              </div>
              {waitlistSuccess && (
                <p className="text-brand-accent-green text-sm mt-2">
                  Thanks for your interest! We've added you to our waitlist. We'll notify you by email when we're ready to launch to additional users.
                </p>
              )}
            </form>
            
            <div className="text-center">
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="text-brand-blue-600 hover:text-brand-blue-700 text-sm font-medium"
              >
                Have an invite code? Click here
              </button>
              
              {showInviteForm && (
                <form onSubmit={handleInviteSubmit} className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Enter your invite code"
                      className="input flex-1"
                      required
                    />
                    <button type="submit" className="btn-secondary whitespace-nowrap">
                      Sign Up
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Sharing Games Has Never Been Easier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6">
              <div className="w-12 h-12 bg-brand-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Dice6 className="h-6 w-6 text-brand-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Create Your Inventory</h3>
              <p className="text-brand-gray-600">
                Add your games to your digital shelf, so you know exactly what you have.
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 bg-brand-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-brand-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Borrow and Lend</h3>
              <p className="text-brand-gray-600">
                Request games from friends and lend out your own with a few simple clicks.
              </p>
            </div>
            <div className="card p-6">
              <div className="w-12 h-12 bg-brand-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-brand-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Enjoy More Game Nights</h3>
              <p className="text-brand-gray-600">
                With your collection shared and organized, it's easier to get together and have fun!
              </p>
            </div>
          </div>
        </div>

        {/* Why You'll Love It Section */}
        <div className="mb-16 sm:mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            More Games, Less Spending
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="font-bold mb-2">Save Money</h3>
              <p className="text-brand-gray-600">
                Stop buying games you'll only play once. Borrow games you want to try without the commitment.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold mb-2">Make Game Nights Easier</h3>
              <p className="text-brand-gray-600">
                No more scrambling for games or making last-minute purchases. Just share your collection and enjoy a seamless game night.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold mb-2">Build Community</h3>
              <p className="text-brand-gray-600">
                Share your favorite games and discover new ones with friends and fellow game enthusiasts in your circle.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="font-bold mb-2">Get Games Played</h3>
              <p className="text-brand-gray-600">
                Put your collection to work! Share games that are collecting dust, and make sure every game gets the love it deserves.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16 sm:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <blockquote className="card p-6">
              <p className="text-lg text-brand-gray-600 mb-4">
                "I love that I can finally organize my games online and easily share them with friends. Game nights are now so much easier to plan!"
              </p>
              <footer className="font-medium">— Sarah, Early User</footer>
            </blockquote>
            <blockquote className="card p-6">
              <p className="text-lg text-brand-gray-600 mb-4">
                "I never knew how many great games my friends had until we started sharing through BoardGameBorrow. It's a game-changer for our group!"
              </p>
              <footer className="font-medium">— Mark, Community Member</footer>
            </blockquote>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Play?</h2>
          <p className="text-xl text-brand-gray-600 mb-8">
            Start sharing, borrowing, and enjoying your favorite games today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link to="/signup" className="btn-primary">
              Sign Up Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dice6, Users, Share2, Calendar, ArrowRight } from 'lucide-react';
import TestimonialCarousel from '../components/TestimonialCarousel';
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
            Effortless Game Nights. Share, Borrow, and Play More Games with Friends.
          </h1>
          <p className="text-lg sm:text-xl text-brand-gray-600 max-w-2xl mx-auto px-2 mb-8">
            Create your game inventory, share it with friends, and explore new games with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup" className="btn-primary">
              Get Started for Free
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              Explore How It Works
            </a>
          </div>
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4">
            <img 
              src="/board-game-placeholder.png" 
              alt="BoardGameBorrow Demo" 
              className="w-full rounded-lg"
            />
          </div>
          
          <div className="text-center mt-8">
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

        {/* How It Works Section */}
        <div id="how-it-works" className="mb-16 sm:mb-24 scroll-mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            How BoardGameBorrow Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Dice6 className="h-8 w-8 text-brand-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Create Your Game Library</h3>
              <p className="text-brand-gray-600">
                Digitize your board game collection in minutes. Keep track of all your games in one place.
              </p>
            </div>
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Share2 className="h-8 w-8 text-brand-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Borrow & Lend Games</h3>
              <p className="text-brand-gray-600">
                Expand your game nights without buying more. Share games with friends easily.
              </p>
            </div>
            <div className="card p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Calendar className="h-8 w-8 text-brand-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Plan Amazing Game Nights</h3>
              <p className="text-brand-gray-600">
                Easily coordinate and discover new games. Make every game night memorable.
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
        <div className="mb-16 sm:mb-24 overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            What Our Community Says
          </h2>
          <TestimonialCarousel
            testimonials={[
              {
                name: "Sarah Martinez",
                role: "Game Night Host",
                quote: "I love that I can finally organize my games online and easily share them with friends. Game nights are now so much easier to plan!"
              },
              {
                name: "Mark Johnson",
                role: "Board Game Enthusiast",
                quote: "I discovered five new games I'd never played before! BoardGameBorrow has completely changed how our group shares games."
              },
              {
                name: "Emily Chen",
                role: "Game Collector",
                quote: "Finally, a way to keep track of my collection and share it with friends. The borrowing system is so smooth!"
              }
            ]}
          />
          <div className="flex justify-center mt-8">
            <div className="bg-brand-blue-50 rounded-lg p-4 inline-flex items-center">
              <span className="text-brand-blue-600 font-medium">🔒 Secure Data Handling</span>
              <span className="mx-4">•</span>
              <span className="text-brand-blue-600 font-medium">500+ Active Users</span>
              <span className="mx-4">•</span>
              <span className="text-brand-blue-600 font-medium">4.8/5 User Rating</span>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-brand-blue-50 rounded-xl p-8 sm:p-12">
          <h2 className="text-3xl font-bold mb-4">Start Sharing Games Today!</h2>
          <p className="text-xl text-brand-gray-600 mb-6">
            Join now and access premium features for free during beta!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-lg px-8 py-4">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-brand-gray-600 mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;

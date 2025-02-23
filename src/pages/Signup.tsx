import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Wand2, Chrome, Facebook } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      setLoading(true);
      
      // Inform user about popup
      const message = `Please allow the ${provider} login popup. If you don't see it, check if it was blocked by your browser.`;
      setError(message);
      
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
      await signInMethod();
      navigate('/my-games');
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError(
          'The login popup was blocked by your browser. Please allow popups for this site and try again.'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('You closed the login popup. Please try again.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await signUp({
        email,
        password,
        firstName,
        lastName,
        photoUrl: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?auto=format&fit=crop&q=80&w=200&h=200',
        location: 'Not specified'
      });
      navigate('/my-games');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAutoFill = async () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const testFirstName = `Test`;
    const testLastName = `User ${randomId}`;
    const randomEmail = `test.user.${randomId}@example.com`;
    const defaultPassword = 'password123';
    const defaultPhoto = 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?auto=format&fit=crop&q=80&w=200&h=200';
    const defaultLocation = 'Seattle, WA';

    try {
      setError('');
      setLoading(true);
      await signUp({
        email: randomEmail,
        password: defaultPassword,
        firstName: testFirstName,
        lastName: testLastName,
        photoUrl: defaultPhoto,
        location: defaultLocation
      });
      navigate('/my-games');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Create Your Account</h2>
        
        {/* Social Sign-In Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleSocialSignIn('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Chrome className="h-5 w-5" />
            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter first name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Create a password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 6 characters long
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {process.env.NODE_ENV === 'development' && (
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="h-4 w-4" />
              <span>Auto Create Test Account (Dev Only)</span>
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-700">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

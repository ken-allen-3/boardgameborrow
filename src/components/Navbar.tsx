import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dice6, Library, PlayCircle, Users, LogOut, Bug } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBugReport } from '../contexts/BugReportContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useAuth();
  const { currentUser } = auth;
  const navigate = useNavigate();
  const { reportBug } = useBugReport();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-brand-gray-200 relative z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Dice6 className="h-6 w-6 text-brand-blue-600" />
              <span className="font-display text-xl font-semibold text-brand-gray-900">BoardGameBorrow</span>
            </Link>
          </div>

          {!currentUser && (
            <div className="flex items-center">
              <Link to="/login" className="btn-secondary">
                Log In
              </Link>
            </div>
          )}

          {currentUser && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/my-games"
                className="nav-link"
                data-tutorial="my-games-link"
              >
                <Library className="h-5 w-5" />
              </Link>
              
              <Link
                to="/borrow"
                className="nav-link"
                data-tutorial="borrow-link"
              >
                <PlayCircle className="h-5 w-5" />
              </Link>
              
              <Link
                to="/groups"
                className="nav-link"
                data-tutorial="groups-link"
              >
                <Users className="h-5 w-5" />
              </Link>

              <button
                onClick={() => reportBug()}
                className="nav-link text-brand-gray-500 hover:text-brand-gray-700"
              >
                <Bug className="h-5 w-5" />
              </button>

              <button
                onClick={handleSignOut}
                className="nav-link text-brand-gray-500 hover:text-brand-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
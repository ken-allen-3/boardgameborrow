import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Dice6, Library, PlayCircle, Users, LogOut, Bug, Menu, X, UserCircle, Calendar, Settings, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBugReport } from '../contexts/BugReportContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useAuth();
  const { currentUser, isAdmin } = auth;
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

  const NavLinks = () => (
    <>
      <Link
        to="/my-games"
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2"
        data-tutorial="my-games-link"
        onClick={() => setIsOpen(false)}
      >
        <Library className="h-5 w-5" />
        <span>My Games</span>
      </Link>
      
      <Link
        to="/borrow"
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2"
        data-tutorial="borrow-link"
        onClick={() => setIsOpen(false)}
      >
        <PlayCircle className="h-5 w-5" />
        <span>Borrow Games</span>
      </Link>
      
      <div
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2 cursor-not-allowed opacity-60"
        data-tutorial="groups-link"
      >
        <Users className="h-5 w-5" />
        <span>Groups</span>
        <span className="text-xs bg-brand-blue-100 text-brand-blue-600 px-2 py-0.5 rounded-full">Coming Soon!</span>
      </div>

      <Link
        to="/friends"
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2"
        onClick={() => setIsOpen(false)}
      >
        <UserPlus className="h-5 w-5" />
        <span>Friends</span>
      </Link>
      
      <Link
        to="/game-nights"
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2"
        onClick={() => setIsOpen(false)}
      >
        <Calendar className="h-5 w-5" />
        <span>Game Nights</span>
      </Link>

      <Link
        to="/profile"
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2"
        onClick={() => setIsOpen(false)}
      >
        <UserCircle className="h-5 w-5" />
        <span>Profile</span>
      </Link>

      {isAdmin && (
        <Link
          to="/admin"
          className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2"
          onClick={() => setIsOpen(false)}
        >
          <Settings className="h-5 w-5" />
          <span>Admin Dashboard</span>
        </Link>
      )}

      <div className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2">
        <NotificationsDropdown />
      </div>

      <button
        onClick={() => {
          reportBug();
          setIsOpen(false);
        }}
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2 text-brand-gray-500 hover:text-brand-gray-700"
      >
        <Bug className="h-5 w-5" />
        <span>Report Bug</span>
      </button>

      <button
        onClick={() => {
          handleSignOut();
          setIsOpen(false);
        }}
        className="nav-link gap-3 p-4 flex items-center md:p-0 md:gap-2 text-brand-gray-500 hover:text-brand-gray-700"
      >
        <LogOut className="h-5 w-5" />
        <span>Sign Out</span>
      </button>
    </>
  );

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
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <NavLinks />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="p-2 rounded-lg text-brand-gray-500 hover:bg-brand-gray-100"
                >
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {isOpen && currentUser && (
          <div className="md:hidden border-t border-brand-gray-200 bg-white fixed left-0 right-0 top-16">
            <div className="py-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="flex flex-col divide-y divide-brand-gray-100">
                <NavLinks />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

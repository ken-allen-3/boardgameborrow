import React, { useState, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Dice6, Library, PlayCircle, Users, LogOut, Bug, Menu, X, UserCircle, Calendar, Settings, UserPlus, Trello, LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBugReport } from '../contexts/BugReportContext';

interface NavGroupProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

interface NavLinkProps {
  to?: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  badge?: ReactNode;
}

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

  const NavGroup = ({ children, title, className = "" }: NavGroupProps) => (
    <div className={`flex flex-col md:flex-row md:items-center md:space-x-2 ${className}`}>
      {title && (
        <div className="px-4 py-2 text-xs font-semibold text-brand-gray-500 bg-brand-gray-50 md:hidden">
          {title}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
        {children}
      </div>
    </div>
  );

  const NavLink = ({ to, icon: Icon, label, onClick, className = "", disabled = false, badge = null }: NavLinkProps) => {
    const baseClass = "nav-link gap-3 p-4 flex items-center md:px-2 md:py-2 md:gap-2 relative transition-colors duration-150 whitespace-nowrap";
    const activeClass = "bg-brand-blue-50 text-brand-blue-600 md:bg-transparent md:text-brand-blue-600";
    const defaultClass = disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-brand-gray-50 md:hover:bg-transparent md:hover:text-brand-blue-600";
    
    const content = (
      <>
        <Icon className={`${disabled ? 'h-5 w-5' : 'h-6 w-6 md:h-5 md:w-5'}`} />
        <span>{label}</span>
        {badge}
      </>
    );

    if (disabled) {
      return (
        <div className={`${baseClass} ${defaultClass} ${className}`}>
          {content}
        </div>
      );
    }

    return to ? (
      <Link
        to={to}
        className={`${baseClass} ${defaultClass} ${className}`}
        onClick={onClick}
        role="menuitem"
        aria-label={label}
      >
        {content}
      </Link>
    ) : (
      <button
        onClick={onClick}
        className={`${baseClass} ${defaultClass} w-full text-left ${className}`}
        role="menuitem"
        aria-label={label}
      >
        {content}
      </button>
    );
  };

  const NavLinks = () => (
    <>
      {/* Core Features Group */}
      <NavGroup title="Core Features" className="md:pr-6 md:border-r border-brand-gray-200">
        <NavLink
          to="/my-games"
          icon={Library}
          label="My Games"
          onClick={() => setIsOpen(false)}
          className="text-brand-blue-600"
          data-tutorial="my-games-link"
        />
        <NavLink
          to="/borrow"
          icon={PlayCircle}
          label="Borrow Games"
          onClick={() => setIsOpen(false)}
          className="text-brand-blue-600"
          data-tutorial="borrow-link"
        />
      </NavGroup>

      {/* Social Features Group */}
      <NavGroup title="Social" className="border-t md:border-t-0 md:px-6 md:border-r border-brand-gray-200">
        <NavLink
          icon={Users}
          label="Groups"
          disabled={true}
          badge={<span className="text-xs bg-brand-blue-100 text-brand-blue-600 px-2 py-0.5 rounded-full">Coming Soon!</span>}
          data-tutorial="groups-link"
        />
        <NavLink
          to="/friends"
          icon={UserPlus}
          label="Friends"
          onClick={() => setIsOpen(false)}
        />
        <NavLink
          to="/game-nights"
          icon={Calendar}
          label="Game Nights"
          onClick={() => setIsOpen(false)}
        />
      </NavGroup>

      {/* User Features Group */}
      <NavGroup title="User" className="border-t md:border-t-0 md:px-6 md:border-r border-brand-gray-200">
        <NavLink
          to="/profile"
          icon={UserCircle}
          label="Profile"
          onClick={() => setIsOpen(false)}
        />
        <div className="nav-link gap-3 p-4 flex items-center md:p-3 md:gap-2">
          <NotificationsDropdown />
        </div>
      </NavGroup>

      {/* System Features Group */}
      <NavGroup title="System" className="border-t md:border-t-0 md:pl-6">
        <NavLink
          to="/roadmap"
          icon={Trello}
          label="Feature Roadmap"
          onClick={() => setIsOpen(false)}
        />
        {isAdmin && (
          <NavLink
            to="/admin"
            icon={Settings}
            label="Admin Dashboard"
            onClick={() => setIsOpen(false)}
          />
        )}
        <NavLink
          icon={Bug}
          label="Report Bug"
          onClick={() => {
            reportBug();
            setIsOpen(false);
          }}
          className="text-brand-gray-500"
          to="#"
        />
        <NavLink
          icon={LogOut}
          label="Sign Out"
          onClick={() => {
            handleSignOut();
            setIsOpen(false);
          }}
          className="text-brand-gray-500"
          to="#"
        />
      </NavGroup>
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
              <div className="hidden md:flex md:flex-row items-center md:space-x-6">
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
          <div className="md:hidden border-t border-brand-gray-200 bg-white fixed left-0 right-0 top-16 bottom-0">
            <div className="h-full overflow-y-auto">
              <nav className="flex flex-col" role="menu">
                <NavLinks />
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

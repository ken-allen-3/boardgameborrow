import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { initializeAnalytics } from './services/analyticsService';
import { useAnalytics } from './hooks/useAnalytics';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { BugReportProvider } from './contexts/BugReportContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingPlaceholder } from './components/LoadingStates';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyGames from './pages/MyGames';
import BorrowGames from './pages/BorrowGames';
import ComingSoon from './pages/ComingSoon';
import GameNights from './pages/GameNights';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import EmailTest from './pages/EmailTest';
import ApiTest from './pages/ApiTest';
import GroupInvite from './pages/GroupInvite';
import Users from './pages/Users';
import { useAuth } from './contexts/AuthContext';
import VisionDebug from './pages/VisionDebug';
import PerformanceMonitor from './pages/PerformanceMonitor';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';

function AppRoutes() {
  const { currentUser, showWelcome, setShowWelcome, isAdmin } = useAuth();
  useAnalytics();

  if (currentUser && showWelcome) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-vintage-cream">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={!currentUser ? <Home /> : <Navigate to="/my-games" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/my-games" />} />
          <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/my-games" />} />
          <Route path="/vision-debug" element={<VisionDebug />} />
          <Route path="/performance" element={<PerformanceMonitor />} />
          
          {/* Protected Routes */}
          <Route path="/my-games" element={currentUser ? <MyGames /> : <Navigate to="/login" />} />
          <Route path="/borrow" element={currentUser ? <BorrowGames /> : <Navigate to="/login" />} />
          <Route path="/groups" element={currentUser ? <ComingSoon /> : <Navigate to="/login" />} />
          <Route path="/game-nights" element={currentUser ? <GameNights /> : <Navigate to="/login" />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/friends" element={currentUser ? <Friends /> : <Navigate to="/login" />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/email-test" element={<EmailTest />} />
          <Route path="/groups/invite/:inviteId" element={<GroupInvite />} />
          <Route path="/users" element={currentUser?.email === 'kenny@springwavestudios.com' ? <Users /> : <Navigate to="/" />} />
          <Route 
            path="/admin" 
            element={
              currentUser && isAdmin ? <AdminDashboard /> : <Navigate to="/" />
            } 
          />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
        </Routes>
      </main>

    </div>
  );
}

function App() {
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <BugReportProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </BugReportProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;

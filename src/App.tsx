import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BugReportProvider } from './contexts/BugReportContext';
import { TutorialProvider } from './components/tutorial/TutorialProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingPlaceholder } from './components/LoadingStates';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyGames from './pages/MyGames';
import BorrowGames from './pages/BorrowGames';
import Groups from './pages/Groups';
import GameNights from './pages/GameNights';
import Profile from './pages/Profile';
import EmailTest from './pages/EmailTest';
import ApiTest from './pages/ApiTest';
import GroupInvite from './pages/GroupInvite';
import Users from './pages/Users';
import { useAuth } from './contexts/AuthContext';
import WelcomeModal from './components/onboarding/WelcomeModal';
import VisionDebug from './pages/VisionDebug';

function AppRoutes() {
  const { currentUser, showWelcome, setShowWelcome } = useAuth();

  return (
    <div className="min-h-screen bg-vintage-cream">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={!currentUser ? <Home /> : <Navigate to="/my-games" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/my-games" />} />
          <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/my-games" />} />
          <Route path="/vision-debug" element={<VisionDebug />} />
          
          {/* Protected Routes */}
          <Route path="/my-games" element={currentUser ? <MyGames /> : <Navigate to="/login" />} />
          <Route path="/borrow" element={currentUser ? <BorrowGames /> : <Navigate to="/login" />} />
          <Route path="/groups" element={currentUser ? <Groups /> : <Navigate to="/login" />} />
          <Route path="/game-nights" element={currentUser ? <GameNights /> : <Navigate to="/login" />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/email-test" element={<EmailTest />} />
          <Route path="/groups/invite/:inviteId" element={<GroupInvite />} />
          <Route path="/users" element={currentUser?.email === 'kenny@springwavestudios.com' ? <Users /> : <Navigate to="/" />} />
        </Routes>
      </main>

      {showWelcome && (
        <WelcomeModal onClose={() => setShowWelcome(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <BugReportProvider>
            <TutorialProvider>
              <AppRoutes />
            </TutorialProvider>
          </BugReportProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
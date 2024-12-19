import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TutorialStep from './TutorialStep';

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  route: string;
}

interface TutorialContextType {
  currentStep: TutorialStep | null;
  nextStep: () => void;
  skipTutorial: () => void;
  isActive: boolean;
  startTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'add-games',
    target: '[data-tutorial="add-game-button"]',
    title: 'Build Your Collection',
    content: 'Start by adding your board games to your collection. Click here to add your first game!',
    placement: 'bottom',
    route: '/my-games'
  },
  {
    id: 'borrow',
    target: '[data-tutorial="borrow-link"]',
    title: 'Borrow Games',
    content: 'Browse and borrow games from your friends. See what games are available in your network!',
    placement: 'right',
    route: '/borrow'
  },
  {
    id: 'groups',
    target: '[data-tutorial="groups-link"]',
    title: 'Join Groups',
    content: 'Connect with friends by joining groups. Share your collection and organize game nights!',
    placement: 'right',
    route: '/groups'
  }
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { currentUser, isNewUser, showWelcome } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const startTutorial = () => {
    console.log('[Tutorial] Starting tutorial...');
    
    if (showWelcome) {
      console.log('[Tutorial] Welcome modal is still open, waiting...');
      return;
    }

    setIsActive(true);
    setIsPaused(false);
    setCurrentStepIndex(0);
    
    if (location.pathname !== TUTORIAL_STEPS[0].route) {
      console.log('[Tutorial] Navigating to:', TUTORIAL_STEPS[0].route);
      navigate(TUTORIAL_STEPS[0].route);
    }
  };

  const pauseTutorial = () => {
    console.log('[Tutorial] Pausing tutorial...');
    setIsPaused(true);
  };

  const resumeTutorial = () => {
    console.log('[Tutorial] Resuming tutorial...');
    setIsPaused(false);
    
    // Move to next step when resuming
    if (currentStepIndex === 0) {
      nextStep();
    }
  };

  const nextStep = async () => {
    console.log('[Tutorial] Moving to next step...');
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      const nextStep = TUTORIAL_STEPS[nextIndex];
      
      if (location.pathname !== nextStep.route) {
        console.log('[Tutorial] Navigating to:', nextStep.route);
        navigate(nextStep.route);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStepIndex(nextIndex);
    } else {
      completeTutorial();
    }
  };

  const skipTutorial = () => {
    console.log('[Tutorial] Tutorial skipped');
    completeTutorial();
  };

  const completeTutorial = () => {
    console.log('[Tutorial] Tutorial completed');
    setIsActive(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    localStorage.setItem('hasCompletedTutorial', 'true');
  };

  useEffect(() => {
    if (currentUser && isNewUser && !showWelcome && !isActive) {
      console.log('[Tutorial] Checking tutorial status:', {
        currentUser: !!currentUser,
        isNewUser,
        showWelcome,
        isActive
      });
      
      const hasSeenTutorial = localStorage.getItem('hasCompletedTutorial');
      if (!hasSeenTutorial) {
        console.log('[Tutorial] Starting tutorial after welcome modal closed');
        const timer = setTimeout(startTutorial, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser, isNewUser, showWelcome, isActive]);

  const currentStep = currentStepIndex >= 0 ? TUTORIAL_STEPS[currentStepIndex] : null;

  return (
    <TutorialContext.Provider value={{ 
      currentStep, 
      nextStep, 
      skipTutorial, 
      isActive,
      startTutorial,
      pauseTutorial,
      resumeTutorial
    }}>
      {children}
      {currentStep && isActive && !isPaused && (
        <TutorialStep
          step={currentStep}
          totalSteps={TUTORIAL_STEPS.length}
          currentStep={currentStepIndex + 1}
          onNext={nextStep}
          onSkip={skipTutorial}
        />
      )}
    </TutorialContext.Provider>
  );
}

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
import React, { useState } from 'react';
import StepGameTypes from './StepGameTypes';
import StepQuickAddGames from './StepQuickAddGames';
import { useAuth } from '../../contexts/AuthContext';

function OnboardingFlow() {
  const { setShowWelcome } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const totalSteps = 2;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowWelcome(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepGameTypes
            onNext={(categories) => {
              setSelectedCategories(categories);
              handleNext();
            }}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      case 2:
        return (
          <StepQuickAddGames
            selectedCategories={selectedCategories}
            onComplete={() => setShowWelcome(false)}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-vintage-cream py-8">
      <div className="container mx-auto px-4">
        {renderStep()}
      </div>
    </div>
  );
}

export default OnboardingFlow;

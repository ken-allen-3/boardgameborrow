import React, { useState } from 'react';
import Step1Welcome from './Step1Welcome';
import StepGameTypes from './StepGameTypes';
import StepQuickAddGames from './StepQuickAddGames';
import StepLocation from './StepLocation';
import Step6Completion from './Step6Completion';
import { useAuth } from '../../contexts/AuthContext';

function OnboardingFlow() {
  const { setShowWelcome } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
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
          <Step1Welcome
            onNext={handleNext}
          />
        );
      case 2:
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
      case 3:
        return (
          <StepQuickAddGames
            selectedCategories={selectedCategories}
            onComplete={handleNext}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      case 4:
        return (
          <StepLocation
            onNext={handleNext}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        );
      case 5:
        return (
          <Step6Completion
            onNext={() => setShowWelcome(false)}
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

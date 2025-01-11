import React, { useState } from 'react';
import Step1Welcome from './Step1Welcome';
import Step2AccountSetup from './Step2AccountSetup';
import Step3AddGame from './Step3AddGame';
import Step4Connect from './Step4Connect';
import Step5Explore from './Step5Explore';
import Step6Completion from './Step6Completion';
import { useAuth } from '../../contexts/AuthContext';

function OnboardingFlow() {
  const { setShowWelcome } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 6) {
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
        return <Step1Welcome onNext={handleNext} />;
      case 2:
        return <Step2AccountSetup onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3AddGame onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <Step4Connect onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Step5Explore onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <Step6Completion onFinish={() => setShowWelcome(false)} />;
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

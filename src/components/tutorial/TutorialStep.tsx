import React, { useEffect, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

interface TutorialStepProps {
  step: {
    id: string;
    target: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
  };
  totalSteps: number;
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}

function TutorialStep({ step, totalSteps, currentStep, onNext, onSkip }: TutorialStepProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const findAndPositionTooltip = () => {
      const element = document.querySelector(step.target);
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        
        // Calculate position based on placement
        let top = rect.bottom + 12; // default bottom placement
        let left = rect.left + (rect.width / 2) - 160; // center horizontally
        
        if (step.placement === 'top') {
          top = rect.top - 12;
        } else if (step.placement === 'right') {
          top = rect.top + (rect.height / 2) - 75;
          left = rect.right + 12;
        } else if (step.placement === 'left') {
          top = rect.top + (rect.height / 2) - 75;
          left = rect.left - 332;
        }
        
        setPosition({ top, left });
        
        // Add highlight effect
        element.classList.add('relative', 'z-50');
      }
    };

    findAndPositionTooltip();
    window.addEventListener('resize', findAndPositionTooltip);
    
    return () => {
      window.removeEventListener('resize', findAndPositionTooltip);
      if (targetElement) {
        targetElement.classList.remove('relative', 'z-50');
      }
    };
  }, [step]);

  if (!targetElement) return null;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/60 z-40" />

      {/* Highlight cutout */}
      <div
        className="fixed z-40 bg-white/10 border-2 border-indigo-500 rounded-lg pointer-events-none"
        style={{
          top: targetElement.getBoundingClientRect().top - 4,
          left: targetElement.getBoundingClientRect().left - 4,
          width: targetElement.getBoundingClientRect().width + 8,
          height: targetElement.getBoundingClientRect().height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
        }}
      />

      {/* Tutorial tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl p-4 w-80 transition-all duration-300"
        style={{
          top: position.top,
          left: position.left
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900">{step.title}</h3>
          <button
            onClick={onSkip}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">{step.content}</p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
          <button
            onClick={onNext}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default TutorialStep;
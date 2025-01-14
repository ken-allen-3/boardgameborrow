import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useAuth } from '../../contexts/AuthContext';

interface Step6CompletionProps {
  onNext: () => void;
}

function Step6Completion({ onNext }: Step6CompletionProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 relative">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">
          You're All Set!
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Have fun exploring the app! You're ready to start borrowing, lending, and making memories. Try using our magic AI camera to scan in the rest of your board game collection all at once!
        </p>

        <button
          onClick={onNext}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}

export default Step6Completion;

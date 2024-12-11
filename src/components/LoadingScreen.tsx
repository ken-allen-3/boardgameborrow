import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

function LoadingScreen({ message = 'Processing your photo...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center z-50 p-4">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white text-lg font-medium text-center">{message}</p>
    </div>
  );
}

export default LoadingScreen;
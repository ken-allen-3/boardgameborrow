import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: { size?: LoadingProps['size'] }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
  );
}

export function LoadingOverlay({ message, size = 'lg' }: LoadingProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size={size} />
        {message && (
          <p className="mt-4 text-gray-600 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

export function LoadingPlaceholder({ message, size = 'md', waitTime }: LoadingProps & { waitTime?: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <LoadingSpinner size={size} />
      {(message || waitTime) && (
        <div className="mt-4 text-center">
          <p className="text-gray-600">{message}</p>
          {waitTime && (
            <p className="text-sm text-gray-500 mt-1">
              Please wait {Math.ceil(waitTime / 1000)} seconds...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
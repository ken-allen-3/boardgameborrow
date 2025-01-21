import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  code?: string;
}

function ErrorMessage({ message, code }: ErrorMessageProps) {
  const isRateLimit = code === 'RATE_LIMIT_ERROR';
  const isPermission = message.includes('Please allow');

  return (
    <div className={`p-4 ${
      isPermission ? 'bg-blue-50 border border-blue-200' :
      isRateLimit ? 'bg-yellow-50 border border-yellow-200' :
      'bg-red-50 border border-red-200'
    } rounded-lg flex items-start gap-3`}>
      {isRateLimit ? (
        <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className={`h-5 w-5 ${
          isPermission ? 'text-blue-500' : 'text-red-500'
        } flex-shrink-0 mt-0.5`} />
      )}
      <div className={`text-sm ${
        isPermission ? 'text-blue-700' :
        isRateLimit ? 'text-yellow-700' :
        'text-red-700'
      }`}>{message}</div>
    </div>
  );
}

export default ErrorMessage;

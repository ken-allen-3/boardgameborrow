import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className={`p-4 ${
      message.includes('Please allow') 
        ? 'bg-blue-50 border border-blue-200' 
        : 'bg-red-50 border border-red-200'
    } rounded-lg flex items-start gap-3`}>
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className={`text-sm ${
        message.includes('Please allow') ? 'text-blue-700' : 'text-red-700'
      }`}>{message}</div>
    </div>
  );
}

export default ErrorMessage;
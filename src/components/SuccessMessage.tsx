import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-green-700">{message}</div>
    </div>
  );
}

export default SuccessMessage;
import React from 'react';
import { Users } from 'lucide-react';

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <Users className="h-16 w-16 text-brand-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">Coming Soon!</h1>
      <p className="text-brand-gray-600 text-center max-w-md">
        We're working hard to bring you an amazing groups feature. Stay tuned!
      </p>
    </div>
  );
}

export default ComingSoon;

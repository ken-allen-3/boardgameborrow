import React from 'react';

interface SampleContentTagProps {
  className?: string;
}

export const SampleContentTag: React.FC<SampleContentTagProps> = ({ className = '' }) => {
  return (
    <div 
      className={`
        absolute top-2 right-2 
        inline-flex items-center
        px-2 py-0.5 
        bg-gray-100 bg-opacity-90
        rounded-full
        text-xs font-medium uppercase
        text-gray-600
        ${className}
      `}
      title="This is demo content to showcase the app's features"
    >
      <span>Sample Content</span>
      <span className="ml-1 text-gray-500">ℹ️</span>
    </div>
  );
};

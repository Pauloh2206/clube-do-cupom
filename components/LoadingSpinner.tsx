import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
};

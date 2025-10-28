import React from 'react';

const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse border border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="w-3/4 h-6 bg-gray-700 rounded"></div>
                <div className="w-20 h-6 bg-gray-700 rounded-full"></div>
            </div>
            <div className="mb-6">
                <div className="w-full h-4 bg-gray-700 rounded mb-2"></div>
                <div className="w-5/6 h-4 bg-gray-700 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
                <div className="w-1/3 h-10 bg-gray-700 rounded"></div>
                <div className="w-1/4 h-5 bg-gray-700 rounded"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;

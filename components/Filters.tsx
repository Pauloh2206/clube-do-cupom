import React from 'react';
import { Platform, CouponStatus } from '../types';
import { RotateCw } from 'lucide-react';

interface FiltersProps {
    platforms: Platform[];
    activeFilter: Platform | 'all';
    onFilterChange: (filter: Platform | 'all') => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    activeViewMode: CouponStatus;
    onViewModeChange: (mode: CouponStatus) => void;
}

const platformDisplayNames: Record<Platform, string> = {
    uber: 'Uber',
    '99': '99',
    ifood: 'iFood',
    rappi: 'Rappi',
    mercadolivre: 'Mercado Livre',
    magazineluiza: 'Magazine Luiza'
};

const platformStyles: Record<Platform, string> = {
    uber: 'bg-black text-white hover:bg-gray-800',
    '99': 'bg-yellow-500 text-black hover:bg-yellow-600',
    ifood: 'bg-red-600 text-white hover:bg-red-700',
    rappi: 'bg-orange-500 text-white hover:bg-orange-600',
    mercadolivre: 'bg-yellow-400 text-black hover:bg-yellow-500',
    magazineluiza: 'bg-blue-600 text-white hover:bg-blue-700'
};


const Filters: React.FC<FiltersProps> = ({ platforms, activeFilter, onFilterChange, onRefresh, isRefreshing, activeViewMode, onViewModeChange }) => {
    const allPlatforms: (Platform | 'all')[] = ['all', ...platforms];

    return (
        <div className="mb-8">
            <div className="flex justify-center items-center gap-2 mb-4 bg-gray-800 p-1 rounded-full w-max mx-auto">
                <button
                    onClick={() => onViewModeChange('active')}
                    className={`px-6 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${activeViewMode === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                    Novos
                </button>
                <button
                    onClick={() => onViewModeChange('expired')}
                    className={`px-6 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${activeViewMode === 'expired' ? 'bg-gray-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                    Expirados
                </button>
            </div>
            <div className="flex justify-center items-center flex-wrap gap-2 md:gap-3">
                {allPlatforms.map((platform) => {
                    const isActive = activeFilter === platform;
                    const displayName = platform === 'all' ? 'Todos' : platformDisplayNames[platform];
                    
                    const baseClasses = 'px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500';

                    let colorClasses = '';
                    if (isActive) {
                        colorClasses = 'bg-indigo-600 text-white shadow-md';
                    } else if (platform === 'all') {
                        colorClasses = 'bg-gray-700 text-gray-300 hover:bg-gray-600';
                    } else {
                        colorClasses = platformStyles[platform];
                    }

                    return (
                        <button
                            key={platform}
                            onClick={() => onFilterChange(platform)}
                            className={`${baseClasses} ${colorClasses}`}
                        >
                            {displayName}
                        </button>
                    );
                })}
                 <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-2.5 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                    aria-label="Atualizar cupons"
                >
                    <RotateCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default Filters;

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import CouponCard from './components/CouponCard';
import SkeletonCard from './components/SkeletonCard';
import { fetchCoupons } from './services/geminiService';
import { Coupon, Platform, CouponStatus } from './types';

const App: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<Platform | 'all'>('all');
    const [viewMode, setViewMode] = useState<CouponStatus>('active');

    const platforms: Platform[] = ['uber', '99', 'ifood', 'rappi', 'mercadolivre', 'magazineluiza'];

    const loadCoupons = useCallback(async (filter: Platform | 'all') => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCoupons = await fetchCoupons(filter);
            setCoupons(fetchedCoupons);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido.');
            }
            setCoupons([]); // Clear coupons on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCoupons(activeFilter);
    }, [activeFilter, loadCoupons]);

    const handleFilterChange = (filter: Platform | 'all') => {
        setActiveFilter(filter);
    };
    
    const handleViewModeChange = (mode: CouponStatus) => {
        setViewMode(mode);
    };

    const handleRefresh = () => {
        loadCoupons(activeFilter);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erro! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            );
        }
        
        const filteredCoupons = coupons.filter(c => c.status === viewMode);

        if (filteredCoupons.length === 0) {
            return <p className="text-center text-gray-400 mt-8">Nenhum cupom {viewMode === 'active' ? 'ativo' : 'expirado'} encontrado para a seleção atual.</p>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoupons.map((coupon) => (
                    <CouponCard key={coupon.id} coupon={coupon} />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
            <div className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
                <Header />
                <Filters 
                    platforms={platforms}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    onRefresh={handleRefresh}
                    isRefreshing={isLoading}
                    activeViewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                />
                <main>
                    {renderContent()}
                </main>
            </div>
            <footer className="text-center py-4 mt-8">
                <p className="text-sm text-gray-500">
                    Desenvolvido por Paulo Hernani Costa.
                </p>
            </footer>
        </div>
    );
};

export default App;

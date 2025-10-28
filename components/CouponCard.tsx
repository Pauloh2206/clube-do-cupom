import React, { useState } from 'react';
import { Coupon, Platform } from '../types';
import { Copy, Check } from 'lucide-react';

interface CouponCardProps {
    coupon: Coupon;
}

const platformDisplayNames: Record<Platform, string> = {
    uber: 'Uber',
    '99': '99',
    ifood: 'iFood',
    rappi: 'Rappi',
    mercadolivre: 'Mercado Livre',
    magazineluiza: 'Magazine Luiza'
};


const CouponCard: React.FC<CouponCardProps> = ({ coupon }) => {
    const [copied, setCopied] = useState(false);
    const isExpired = coupon.status === 'expired';

    const handleCopy = () => {
        if (isExpired) return;
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`relative bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between border border-gray-700 hover:border-indigo-500 transition-all duration-300 ${isExpired ? 'opacity-60 grayscale' : ''}`}>
             {isExpired && (
                <div className="absolute top-3 right-3 bg-red-800/80 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                    Expirado
                </div>
            )}
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white pr-4">{coupon.title}</h3>
                    <span className="text-sm font-semibold bg-gray-700 text-indigo-300 px-2.5 py-1 rounded-full whitespace-nowrap">{platformDisplayNames[coupon.platform]}</span>
                </div>
                <p className="text-gray-400 mb-6 text-sm">{coupon.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
                <button
                    onClick={handleCopy}
                    disabled={isExpired}
                    className={`flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                        isExpired
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    <span className={`border-l-2 pl-2 ${isExpired ? 'border-gray-500' : 'border-indigo-400'}`}>{coupon.code}</span>
                </button>
                <span className="text-sm text-gray-500 text-right">{coupon.validity}</span>
            </div>
        </div>
    );
};

export default CouponCard;

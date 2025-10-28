import React from 'react';
import { TicketPercent } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-2">
                <TicketPercent className="w-10 h-10 text-indigo-400" />
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    Clube do Cupom
                </h1>
            </div>
            <p className="text-lg text-gray-400">Seu agregador de cupons de desconto, com a ajuda de IA.</p>
        </header>
    );
};

export default Header;

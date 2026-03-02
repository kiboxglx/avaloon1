import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ message = "Nenhum cliente encontrado", subMessage = "Tente ajustar seus filtros ou adicione um novo perfil." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-zinc-900/50 p-6 rounded-full mb-4 border border-zinc-800">
                <SearchX size={48} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{message}</h3>
            <p className="text-zinc-500 max-w-sm">{subMessage}</p>
        </div>
    );
};

export default EmptyState;

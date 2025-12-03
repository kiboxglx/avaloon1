import React from 'react';
import { Home, Monitor, Plus, RefreshCw } from 'lucide-react';

const MobileNav = ({
    isTvMode,
    setIsTvMode,
    onRefresh,
    isRefreshing,
    onAddClick,
    onHomeClick
}) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="glass-panel border-t border-white/10 pb-safe pt-2 px-6">
                <div className="flex justify-between items-center h-16">
                    <button
                        onClick={onHomeClick}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors ${!isTvMode ? 'text-secondary' : 'text-zinc-400'}`}
                    >
                        <Home size={24} />
                        <span className="text-[10px] font-medium">Início</span>
                    </button>

                    <button
                        onClick={() => setIsTvMode(!isTvMode)}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors ${isTvMode ? 'text-secondary' : 'text-zinc-400'}`}
                    >
                        <Monitor size={24} />
                        <span className="text-[10px] font-medium">TV</span>
                    </button>

                    <div className="relative -top-6">
                        <button
                            onClick={onAddClick}
                            className="bg-secondary text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,87,34,0.4)] hover:scale-105 transition-transform border-4 border-[#050505]"
                        >
                            <Plus size={28} strokeWidth={3} />
                        </button>
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={`flex flex-col items-center gap-1 p-2 transition-colors ${isRefreshing ? 'opacity-50' : 'text-zinc-400 active:text-white'}`}
                    >
                        <RefreshCw size={24} className={isRefreshing ? 'animate-spin' : ''} />
                        <span className="text-[10px] font-medium">Atualizar</span>
                    </button>

                    {/* Placeholder for symmetry or future button, maybe Profile/Settings */}
                    <div className="w-10" />
                </div>
            </div>
        </div>
    );
};

export default MobileNav;

import React, { useState, useEffect } from 'react';

const getTimeAgo = (dateString) => {
    if (!dateString) return 'Hoje';
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now - posted;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
        return `${diffMinutes} min atrás`;
    } else if (diffHours < 24) {
        return `${diffHours}h atrás`;
    } else {
        return 'Hoje';
    }
};

const TvModeTable = ({ clients, onExit }) => {
    const [startIndex, setStartIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const ITEMS_PER_PAGE = 7;
    const PAGE_DURATION = 10000; // 10 seconds per page

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setStartIndex((prev) => {
                const next = prev + ITEMS_PER_PAGE;
                return next >= clients.length ? 0 : next;
            });
        }, PAGE_DURATION);
        return () => clearInterval(interval);
    }, [clients.length]);

    const visibleClients = clients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
    const currentPage = Math.floor(startIndex / ITEMS_PER_PAGE) + 1;

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col font-sans selection:bg-yellow-500 selection:text-black">
            {/* Header for TV Mode */}
            <div className="bg-zinc-900 p-6 border-b border-zinc-800 flex justify-between items-center shadow-lg z-20">
                <div className="flex items-center gap-8">
                    <h1 className="text-4xl font-black text-white tracking-tight font-sans">
                        MONITORAMENTO <span className="text-secondary">/</span> AVALOON
                    </h1>
                    <div className="h-10 w-px bg-zinc-700"></div>
                    <div className="text-yellow-500 font-sans text-3xl font-bold flex gap-4">
                        <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-zinc-500 font-sans text-xl">
                        {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
                <button
                    onClick={onExit}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold transition-colors border border-zinc-600 hover:border-white"
                >
                    Sair
                </button>
            </div>

            {/* Table Header (Fixed) */}
            <div className="bg-zinc-950 border-b-2 border-zinc-800 z-10 shadow-xl">
                <div className="grid grid-cols-12 gap-4 p-4 px-8 text-zinc-500 font-bold text-lg">
                    <div className="col-span-4">Cliente</div>
                    <div className="col-span-3 text-center">Gerente</div>
                    <div className="col-span-2 text-center">Último Post</div>
                    <div className="col-span-3 text-right">Situação</div>
                </div>
            </div>

            {/* Body with Flip Animation */}
            <div className="flex-1 p-6 overflow-hidden bg-zinc-950 perspective-1000">
                <div className="flex flex-col gap-3">
                    {visibleClients.map((client, index) => {
                        const isAlert = client.days >= 3;
                        const isWarning = client.days === 2;
                        // Key includes startIndex to trigger re-render and animation on page change
                        const uniqueKey = `${client.id}-${startIndex}`;

                        return (
                            <div
                                key={uniqueKey}
                                className={`grid grid-cols-12 gap-4 p-4 px-8 border border-zinc-800/50 bg-zinc-900/50 items-center rounded-sm animate-flip-in shadow-lg`}
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                    borderLeft: isAlert ? '4px solid #ef4444' : isWarning ? '4px solid #eab308' : '4px solid #22c55e'
                                }}
                            >
                                {/* Client Name & Username */}
                                <div className="col-span-4">
                                    <div className="text-3xl font-bold text-white mb-1 truncate font-sans tracking-tight">
                                        {client.name}
                                    </div>
                                    <div className="text-zinc-500 text-lg font-sans truncate">
                                        {client.username}
                                    </div>
                                </div>

                                {/* Manager */}
                                <div className="col-span-3 text-center">
                                    <div className="text-zinc-300 text-2xl font-sans">
                                        {client.manager || 'João Silva'}
                                    </div>
                                </div>

                                {/* Last Post Time */}
                                <div className="col-span-2 text-center">
                                    <div className={`text-2xl font-bold font-sans ${isAlert ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {client.days === 0 ? getTimeAgo(client.latestPostDate) : `${client.days} DIAS`}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="col-span-3 flex justify-end">
                                    {isAlert ? (
                                        <span className="text-red-500 font-black text-2xl tracking-tight animate-pulse">
                                            ATRASADO
                                        </span>
                                    ) : isWarning ? (
                                        <span className="text-yellow-500 font-bold text-2xl tracking-tight">
                                            ATENÇÃO
                                        </span>
                                    ) : (
                                        <span className="text-green-500 font-bold text-2xl tracking-tight">
                                            EM DIA
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty rows filler to maintain layout stability */}
                    {visibleClients.length < ITEMS_PER_PAGE && Array.from({ length: ITEMS_PER_PAGE - visibleClients.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-[88px] border border-zinc-900/30 bg-zinc-950/30 rounded-sm"></div>
                    ))}
                </div>
            </div>

            {/* CSS for the Flip Animation */}
            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                @keyframes flipIn {
                    0% {
                        opacity: 0;
                        transform: rotateX(-90deg);
                    }
                    100% {
                        opacity: 1;
                        transform: rotateX(0);
                    }
                }
                .animate-flip-in {
                    animation: flipIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
                    transform-origin: top;
                    backface-visibility: hidden;
                }
            `}</style>

            {/* Footer / Progress */}
            <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-between items-center text-zinc-400 text-lg relative">
                {/* Progress Bar */}
                <div
                    key={startIndex}
                    className="absolute top-0 left-0 h-1 bg-yellow-500"
                    style={{
                        width: '100%',
                        animation: `progress ${PAGE_DURATION}ms linear`
                    }}
                ></div>
                <style>{`
                    @keyframes progress {
                        from { width: 0%; }
                        to { width: 100%; }
                    }
                `}</style>

                <div className="z-10 font-sans text-xl">
                    Página <span className="text-white font-bold">{currentPage}</span> / <span className="text-white font-bold">{totalPages}</span>
                </div>

                <div className="z-10 flex items-center gap-6">
                    <div className="font-sans text-base text-yellow-500 font-bold tracking-wide animate-pulse">
                        DADOS EM TEMPO REAL
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TvModeTable;

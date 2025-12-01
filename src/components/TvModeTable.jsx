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
    const ITEMS_PER_PAGE = 8; // Increased for fullscreen
    const INTERVAL_MS = 10000; // 10 seconds per page

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setStartIndex((prevIndex) => {
                const nextIndex = prevIndex + ITEMS_PER_PAGE;
                return nextIndex >= clients.length ? 0 : nextIndex;
            });
        }, INTERVAL_MS);

        return () => clearInterval(interval);
    }, [clients.length]);

    const visibleClients = clients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
    const currentPage = Math.floor(startIndex / ITEMS_PER_PAGE) + 1;

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-in fade-in duration-300">
            {/* Header for TV Mode */}
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">Avaloon Monitor</h1>
                    <div className="h-8 w-px bg-zinc-700"></div>
                    <div className="text-zinc-400 font-mono text-xl">
                        {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        <span className="text-sm ml-2 text-zinc-500">{currentTime.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                </div>
                <button
                    onClick={onExit}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors border border-zinc-700"
                >
                    Sair do Modo TV
                </button>
            </div>

            <div className="flex-1 overflow-hidden p-6">
                <div className="h-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <table className="w-full text-left border-collapse h-full">
                            <thead>
                                <tr className="bg-zinc-950 text-white uppercase text-lg tracking-wider sticky top-0 z-10 shadow-md border-b border-zinc-800">
                                    <th className="p-4 font-bold w-1/3">Conta</th>
                                    <th className="p-4 font-bold text-center w-1/4">Status Postagem</th>
                                    <th className="p-4 font-bold w-1/4">Gerente</th>
                                    <th className="p-4 font-bold text-center w-1/6">Situação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {visibleClients.map((client, index) => {
                                    const isAlert = client.days > 2;
                                    const isWarning = client.days >= 1 && client.days <= 2;

                                    return (
                                        <tr key={client.id} className={`${index % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'} ${isAlert ? 'animate-pulse-red border-2 border-red-500/50 relative z-10' : isWarning ? 'border-l-4 border-l-orange-500' : ''} transition-colors animate-in slide-in-from-right-4 duration-500`} style={{ animationDelay: `${index * 50}ms` }}>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <div className="font-bold text-3xl text-white mb-1">{client.name}</div>
                                                        <div className="text-zinc-400 text-lg">{client.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center align-middle">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-4xl font-bold ${isAlert ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-white'}`}>
                                                        {client.days}d
                                                    </span>
                                                    <span className={`text-base font-medium uppercase tracking-wide mt-1 ${isAlert ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-zinc-500'}`}>
                                                        {client.days === 0 ? getTimeAgo(client.latestPostDate) : 'Sem postar'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="text-zinc-300 font-bold text-2xl">
                                                    {client.manager || 'João Silva'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center align-middle">
                                                {isAlert ? (
                                                    <span className="inline-block px-8 py-3 bg-red-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-red-500/30 animate-pulse text-xl">
                                                        ATRASADO
                                                    </span>
                                                ) : isWarning ? (
                                                    <span className="inline-block px-8 py-3 bg-orange-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-orange-500/30 text-xl">
                                                        ATENÇÃO
                                                    </span>
                                                ) : (
                                                    <span className={`inline-block px-8 py-3 rounded-xl font-bold tracking-wide text-xl ${client.days === 0 ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-zinc-800 text-zinc-400 opacity-50'}`}>
                                                        EM DIA
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Fill empty rows to keep layout stable */}
                                {visibleClients.length < ITEMS_PER_PAGE && Array.from({ length: ITEMS_PER_PAGE - visibleClients.length }).map((_, i) => (
                                    <tr key={`empty-${i}`} className="flex-1">
                                        <td colSpan="4"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="bg-zinc-950 p-6 border-t border-zinc-800 flex justify-between items-center text-zinc-400 text-lg relative overflow-hidden">
                        {/* Progress Bar */}
                        <div
                            key={startIndex}
                            className="absolute top-0 left-0 h-2 bg-secondary"
                            style={{
                                width: '100%',
                                animation: `progress ${INTERVAL_MS}ms linear`
                            }}
                        ></div>
                        <style>{`
                            @keyframes progress {
                                from { width: 0%; }
                                to { width: 100%; }
                            }
                        `}</style>

                        <div className="z-10 font-mono">
                            Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
                        </div>

                        <div className="z-10 flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                                <span>Atualizando em tempo real</span>
                            </div>
                            <div className="font-mono text-base opacity-50">
                                Próxima página em 10s
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TvModeTable;

import React, { useState, useEffect, useRef } from 'react';

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
    const [currentTime, setCurrentTime] = useState(new Date());
    const scrollRef = useRef(null);

    // Duplicate clients to create a seamless loop
    const scrollingClients = [...clients, ...clients];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate duration based on number of items to maintain consistent speed
    // e.g., 3 seconds per item
    const duration = clients.length * 4;

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col font-sans">
            {/* Header for TV Mode */}
            <div className="bg-zinc-900 p-6 border-b border-zinc-800 flex justify-between items-center shadow-lg z-20">
                <div className="flex items-center gap-8">
                    <h1 className="text-4xl font-black text-white tracking-widest uppercase font-mono">
                        DEPARTURES <span className="text-secondary">/</span> SAÍDAS
                    </h1>
                    <div className="h-10 w-px bg-zinc-700"></div>
                    <div className="text-yellow-500 font-mono text-3xl font-bold tracking-wider flex gap-4">
                        <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-zinc-500 font-mono text-xl uppercase tracking-widest">
                        {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </div>
                <button
                    onClick={onExit}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-none font-bold uppercase tracking-widest transition-colors border border-zinc-600 hover:border-white"
                >
                    Exit Mode
                </button>
            </div>

            {/* Table Header (Fixed) */}
            <div className="bg-zinc-950 border-b-2 border-zinc-800 z-10 shadow-xl">
                <div className="grid grid-cols-12 gap-4 p-4 px-8 text-zinc-500 uppercase tracking-[0.2em] font-bold text-lg">
                    <div className="col-span-4">Client / Cliente</div>
                    <div className="col-span-3 text-center">Manager / Gerente</div>
                    <div className="col-span-2 text-center">Last Post</div>
                    <div className="col-span-3 text-right">Status</div>
                </div>
            </div>

            {/* Scrolling Body */}
            <div className="flex-1 overflow-hidden relative bg-zinc-950">
                <div
                    className="absolute w-full"
                    style={{
                        animation: `scrollVertical ${duration}s linear infinite`
                    }}
                >
                    {scrollingClients.map((client, index) => {
                        const isAlert = client.days > 2;
                        const isWarning = client.days >= 1 && client.days <= 2;
                        const uniqueKey = `${client.id}-${index}`; // Ensure unique key for duplicated items

                        return (
                            <div
                                key={uniqueKey}
                                className={`grid grid-cols-12 gap-4 p-4 px-8 border-b border-zinc-900 items-center ${index % 2 === 0 ? 'bg-zinc-900/30' : 'bg-transparent'}`}
                            >
                                {/* Client Name & Username */}
                                <div className="col-span-4">
                                    <div className="text-3xl font-bold text-white mb-1 truncate font-mono tracking-tight">
                                        {client.name.toUpperCase()}
                                    </div>
                                    <div className="text-zinc-500 text-lg font-mono truncate">
                                        {client.username}
                                    </div>
                                </div>

                                {/* Manager */}
                                <div className="col-span-3 text-center">
                                    <div className="text-zinc-300 text-2xl font-mono uppercase">
                                        {client.manager || 'JOÃO SILVA'}
                                    </div>
                                </div>

                                {/* Last Post Time */}
                                <div className="col-span-2 text-center">
                                    <div className={`text-2xl font-bold font-mono ${isAlert ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'}`}>
                                        {client.days === 0 ? getTimeAgo(client.latestPostDate) : `${client.days} DIAS`}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="col-span-3 flex justify-end">
                                    {isAlert ? (
                                        <span className="text-red-500 font-black text-2xl tracking-widest uppercase animate-pulse">
                                            DELAYED
                                        </span>
                                    ) : isWarning ? (
                                        <span className="text-yellow-500 font-bold text-2xl tracking-widest uppercase">
                                            ATTENTION
                                        </span>
                                    ) : (
                                        <span className="text-green-500 font-bold text-2xl tracking-widest uppercase">
                                            ON TIME
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CSS for the scroll animation */}
            <style>{`
                @keyframes scrollVertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
            `}</style>

            {/* Footer / Ticker */}
            <div className="bg-yellow-500 text-black p-3 font-mono font-bold text-xl uppercase tracking-widest overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee">
                    *** AVALOON MONITORING SYSTEM *** UPDATING REAL-TIME DATA FROM INSTAGRAM *** KEEP YOUR POSTS UP TO DATE *** CONTACT SUPPORT FOR ASSISTANCE ***
                    *** AVALOON MONITORING SYSTEM *** UPDATING REAL-TIME DATA FROM INSTAGRAM *** KEEP YOUR POSTS UP TO DATE *** CONTACT SUPPORT FOR ASSISTANCE ***
                </div>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TvModeTable;

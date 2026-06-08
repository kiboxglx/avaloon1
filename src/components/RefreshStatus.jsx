import React, { useEffect, useState } from 'react';
import { Clock, Timer } from 'lucide-react';

// Mantido em sincronia com o auto-refresh do App.jsx.
export const AUTO_REFRESH_HOURS = 6;

const relativeFrom = (ms, now) => {
    if (!ms) return 'nunca';
    const m = Math.floor((now - ms) / 60000);
    if (m < 1) return 'agora mesmo';
    if (m < 60) return `há ${m} min`;
    if (m < 1440) return `há ${Math.floor(m / 60)}h`;
    return `há ${Math.floor(m / 1440)} dia(s)`;
};

const nextFrom = (ms, now) => {
    if (!ms) return 'a qualquer momento';
    const diff = ms + AUTO_REFRESH_HOURS * 3600000 - now;
    if (diff <= 0) return 'a qualquer momento';
    const m = Math.floor(diff / 60000);
    if (m < 60) return `em ~${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem ? `em ~${h}h ${rem}min` : `em ~${h}h`;
};

// Mostra no home quando foi a ultima atualizacao e quando cai o proximo auto-refresh.
// Re-renderiza a cada minuto para os contadores ficarem vivos.
const RefreshStatus = ({ lastRefreshAt, isRefreshing }) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(t);
    }, []);

    const lastMs = lastRefreshAt ? new Date(lastRefreshAt).getTime() : null;

    return (
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-1 mb-6 text-sm">
            <span className="inline-flex items-center gap-2 text-zinc-400">
                <Clock size={14} className="text-zinc-500" />
                Atualizado <span className="text-zinc-200 font-medium">{isRefreshing ? 'agora...' : relativeFrom(lastMs, now)}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-zinc-400">
                <Timer size={14} className="text-secondary" />
                Próximo automático <span className="text-zinc-200 font-medium">{nextFrom(lastMs, now)}</span>
            </span>
        </div>
    );
};

export default RefreshStatus;

import React from 'react';
import { Users, AlertTriangle, CheckCircle, Flame, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, valueClass = 'text-white' }) => (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between flex-1 min-w-[150px]">
        <div>
            <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">{title}</p>
            <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgClass}`}>
            <Icon size={24} className={colorClass} />
        </div>
    </div>
);

const StatsOverview = ({ clients }) => {
    const totalClients = clients.length;
    const alertClients = clients.filter(c => c.days > 2).length;
    const onTrackClients = totalClients - alertClients;
    // Metricas de constancia da equipe: o pior atraso atual e o % em dia hoje.
    const worstDelay = clients.reduce((max, c) => Math.max(max, c.days || 0), 0);
    const pctOnTrack = totalClients === 0 ? 100 : Math.round((onTrackClients / totalClients) * 100);
    const worstIsCritical = worstDelay >= 3;
    const consistencyHealthy = pctOnTrack >= 80;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <StatCard
                title="Total de Contas"
                value={totalClients}
                icon={Users}
                colorClass="text-zinc-100"
                bgClass="bg-zinc-800"
            />
            <StatCard
                title="Em Alerta"
                value={alertClients}
                icon={AlertTriangle}
                colorClass="text-red-500"
                bgClass="bg-red-500/10"
            />
            <StatCard
                title="Em Dia"
                value={onTrackClients}
                icon={CheckCircle}
                colorClass="text-green-500"
                bgClass="bg-green-500/10"
            />
            <StatCard
                title="Pior Atraso"
                value={worstDelay === 0 ? 'Em dia' : `${worstDelay}d`}
                icon={Flame}
                colorClass={worstIsCritical ? 'text-red-500' : 'text-zinc-300'}
                bgClass={worstIsCritical ? 'bg-red-500/10' : 'bg-zinc-800'}
                valueClass={worstIsCritical ? 'text-red-400' : 'text-white'}
            />
            <StatCard
                title="Constância Hoje"
                value={`${pctOnTrack}%`}
                icon={Activity}
                colorClass={consistencyHealthy ? 'text-green-500' : 'text-orange-400'}
                bgClass={consistencyHealthy ? 'bg-green-500/10' : 'bg-orange-500/10'}
                valueClass={consistencyHealthy ? 'text-white' : 'text-orange-300'}
            />
        </div>
    );
};

export default StatsOverview;

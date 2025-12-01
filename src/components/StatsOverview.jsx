import React from 'react';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="glass-panel p-4 rounded-xl flex items-center justify-between flex-1 min-w-[150px]">
        <div>
            <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
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

    return (
        <div className="flex flex-wrap gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
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
        </div>
    );
};

export default StatsOverview;

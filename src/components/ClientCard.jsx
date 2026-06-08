import React, { useState, useEffect } from 'react';
import { Clock, Edit, Trash2, ExternalLink, AlertTriangle, Camera, RefreshCw } from 'lucide-react';

// Cooldown do refresh individual: 30 min apos atualizar aquele card.
const COOLDOWN_MS = 30 * 60 * 1000;

const timeAgoShort = (iso, now) => {
    if (!iso) return null;
    const ms = new Date(iso).getTime();
    if (Number.isNaN(ms)) return null;
    const m = Math.floor((now - ms) / 60000);
    if (m < 1) return 'agora mesmo';
    if (m < 60) return `há ${m} min`;
    if (m < 1440) return `há ${Math.floor(m / 60)}h`;
    return `há ${Math.floor(m / 1440)} dia(s)`;
};

// Story status com o MESMO criterio de cor do post: verde (<=1d), laranja (=2d), vermelho (>=3d).
// null/undefined = sem dado coletado ainda (cinza).
const storyStatus = (d) => {
    if (d === null || d === undefined) {
        return { label: 'sem dados de story', badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: 'text-zinc-500' };
    }
    if (d >= 3) {
        return { label: `${d} dias sem story`, badge: 'bg-red-500/10 text-red-400 border-red-500/20', icon: 'text-red-500' };
    }
    if (d === 2) {
        return { label: '2 dias sem story', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: 'text-orange-500' };
    }
    return { label: d === 0 ? 'story hoje' : '1 dia sem story', badge: 'bg-green-500/10 text-green-400 border-green-500/20', icon: 'text-green-500' };
};

const getTimeAgo = (dateString) => {
    if (!dateString) return 'Postou hoje';
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now - posted;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 60) {
        return `Postou há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else {
        return `Postou há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    }
};

const ClientCard = ({ client, onEdit, onDelete, isAdmin, onRefreshOne, isRefreshing }) => {
    const { name, username, manager, days, followers, following, posts, engagement, latestPostDate, story_days, last_refreshed_at } = client;
    const isAlert = days >= 3;
    const isWarning = days === 2;
    const story = storyStatus(story_days);

    // Tick leve (30s) para manter "atualizado ha X" e o cooldown vivos.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    const lastRefMs = last_refreshed_at ? new Date(last_refreshed_at).getTime() : null;
    const cooldownRemaining = lastRefMs ? Math.max(0, COOLDOWN_MS - (now - lastRefMs)) : 0;
    const inCooldown = cooldownRemaining > 0;
    const cooldownMin = Math.ceil(cooldownRemaining / 60000);
    const updatedLabel = timeAgoShort(last_refreshed_at, now);

    return (
        <div className={`glass-panel rounded-2xl p-5 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isAlert ? 'animate-pulse-red border-red-500' : isWarning ? 'border-orange-500/50' : ''}`}>
            {/* Actions */}
            {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={onEdit} className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-secondary transition-colors">
                        <Edit size={14} />
                    </button>
                    <button onClick={onDelete} className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight mb-1 truncate pr-2">{name}</h3>
                        <a href={`https://instagram.com/${username.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 hover:text-secondary flex items-center gap-1 transition-colors truncate block max-w-[200px]">
                            {username} <ExternalLink size={12} className="inline-block flex-shrink-0" />
                        </a>
                    </div>
                    {isAlert && (
                        <div className="bg-red-500 text-white p-1.5 rounded-lg animate-pulse">
                            <AlertTriangle size={16} fill="currentColor" />
                        </div>
                    )}
                    {isWarning && (
                        <div className="bg-orange-500 text-white p-1.5 rounded-lg">
                            <AlertTriangle size={16} fill="currentColor" />
                        </div>
                    )}
                </div>
            </div>

            {/* Manager Info */}
            <div className="mb-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Gestor</div>
                <div className="text-sm text-zinc-300">{manager}</div>
            </div>

            {/* Days without posting */}
            <div className="mb-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${isAlert ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    isWarning ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                    <Clock size={14} className={isAlert ? 'text-red-500' : isWarning ? 'text-orange-500' : ''} />
                    {days === 0 ? getTimeAgo(latestPostDate) :
                        isWarning ? 'Atenção: ' + days + (days === 1 ? ' dia' : ' dias') :
                            `${days} dias sem postar`}
                </div>

                {/* Story: mesmo destaque do post (badge colorido pelos mesmos limites) */}
                <div className="mt-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${story.badge}`}>
                        <Camera size={14} className={story.icon} />
                        {story.label}
                    </div>
                </div>
            </div>

            {/* Footer - Stats */}
            <div className="mt-4 pt-4 border-t border-zinc-700">
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                        <div className="text-white font-bold">{followers}</div>
                        <div className="text-xs text-zinc-500">Seguidores</div>
                    </div>
                    <div>
                        <div className="text-white font-bold">{following}</div>
                        <div className="text-xs text-zinc-500">Seguindo</div>
                    </div>
                    <div>
                        <div className="text-white font-bold">{posts}</div>
                        <div className="text-xs text-zinc-500">Posts</div>
                    </div>
                </div>

                {/* Engagement Bar */}
                <div className="bg-zinc-700/50 rounded-lg p-2 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Engajamento</span>
                    <span className="text-xs font-bold text-green-400">{engagement}</span>
                </div>

                {/* Atualizar SO este perfil (economia: gasta credito de 1 conta, nao de todas) */}
                {isAdmin && (
                    <div className="mt-3">
                        <div className="text-[11px] text-zinc-500 text-center mb-1.5">
                            {updatedLabel ? `Atualizado ${updatedLabel}` : 'Nunca atualizado individualmente'}
                        </div>
                        <button
                            onClick={onRefreshOne}
                            disabled={isRefreshing || inCooldown}
                            title={inCooldown ? `Aguarde — disponível em ${cooldownMin} min` : 'Atualizar só este perfil (gasta menos créditos)'}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold glass-button text-zinc-300 border border-white/10 hover:border-secondary/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        >
                            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Atualizando...' : inCooldown ? `Disponível em ${cooldownMin} min` : 'Atualizar este'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientCard;

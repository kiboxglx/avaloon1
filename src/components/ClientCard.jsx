import React from 'react';
import { Clock, Edit, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';

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

const ClientCard = ({ client, onEdit, onDelete }) => {
    const { name, username, manager, days, followers, following, posts, engagement, latestPostDate } = client;
    const isAlert = days >= 3;
    const isWarning = days === 2;

    return (
        <div className={`glass-panel rounded-2xl p-5 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isAlert ? 'animate-pulse-red border-red-500' : isWarning ? 'border-orange-500/50' : ''}`}>
            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                <button onClick={onEdit} className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-secondary transition-colors">
                    <Edit size={14} />
                </button>
                <button onClick={onDelete} className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight mb-1">{name}</h3>
                        <a href={`https://instagram.com/${username.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-sm text-zinc-400 hover:text-secondary flex items-center gap-1 transition-colors">
                            {username} <ExternalLink size={12} />
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
            </div>
        </div>
    );
};

export default ClientCard;

import React, { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, RefreshCw } from 'lucide-react';

const CONFIRM_WORD = 'ATUALIZAR';

// Formata a ultima atualizacao em "relativo + absoluto" (ex: "ha 3h" / "hoje 14:20").
const formatLast = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    let rel;
    if (diffMin < 1) rel = 'agora mesmo';
    else if (diffMin < 60) rel = `há ${diffMin} min`;
    else if (diffMin < 1440) rel = `há ${Math.floor(diffMin / 60)}h`;
    else rel = `há ${Math.floor(diffMin / 1440)} dia(s)`;
    const abs = d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return { rel, abs };
};

const RefreshConfirmModal = ({ isOpen, onClose, onConfirm, lastRefreshAt, count, isRefreshing }) => {
    const inputRef = useRef(null);
    const [typed, setTyped] = useState('');
    const matches = typed.trim().toUpperCase() === CONFIRM_WORD;

    useEffect(() => {
        if (isOpen) setTyped('');
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape' && !isRefreshing) onClose(); };
        window.addEventListener('keydown', onKey);
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => { window.removeEventListener('keydown', onKey); clearTimeout(t); };
    }, [isOpen, isRefreshing, onClose]);

    if (!isOpen) return null;

    const last = formatLast(lastRefreshAt);

    const tryConfirm = () => {
        if (matches && !isRefreshing) onConfirm();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !isRefreshing && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="refresh-modal-title"
        >
            <div
                className="w-full max-w-md rounded-2xl border border-red-500/40 bg-zinc-950 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Faixa de advertencia */}
                <div className="flex items-center gap-3 bg-red-500/15 border-b border-red-500/30 px-6 py-4">
                    <AlertTriangle size={22} className="text-red-500 flex-shrink-0" />
                    <h2 id="refresh-modal-title" className="text-lg font-bold text-white uppercase tracking-wide flex-1">
                        Atualização geral
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isRefreshing}
                        aria-label="Fechar"
                        className="text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Advertencia grave */}
                    <p className="text-sm text-zinc-300 leading-relaxed">
                        Esta ação dispara o scraping de
                        <strong className="text-white"> {typeof count === 'number' ? count : 'todos os'} perfil{count === 1 ? '' : 's'}</strong> de
                        uma vez e <strong className="text-red-400">consome créditos pagos da Apify</strong> a cada execução.
                        Execute somente quando for realmente necessário.
                    </p>

                    {/* Ultima atualizacao */}
                    <div className="flex items-center justify-between rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Última atualização</span>
                        {last ? (
                            <span className="text-sm text-zinc-200 font-medium">{last.rel} <span className="text-zinc-600">· {last.abs}</span></span>
                        ) : (
                            <span className="text-sm text-zinc-400">Nunca</span>
                        )}
                    </div>

                    {/* Alternativa de menor custo */}
                    <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-zinc-700 pl-3">
                        Para um único cliente, prefira <span className="text-zinc-300 font-semibold">"Atualizar este"</span> no card —
                        o custo é muito menor. Antes de atualizar tudo, confira no Instagram se há mesmo novidade.
                    </p>

                    {/* Confirmacao obrigatoria por digitacao */}
                    <div>
                        <label htmlFor="refresh-confirm-input" className="block text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2">
                            Para prosseguir, digite <span className="text-red-400 font-bold">{CONFIRM_WORD}</span>
                        </label>
                        <input
                            id="refresh-confirm-input"
                            ref={inputRef}
                            type="text"
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') tryConfirm(); }}
                            placeholder={CONFIRM_WORD}
                            disabled={isRefreshing}
                            autoComplete="off"
                            className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors placeholder-zinc-700 tracking-[0.3em] uppercase font-semibold ${matches ? 'border-green-500/60' : 'border-zinc-700 focus:border-red-500/60'}`}
                            aria-label={`Digite ${CONFIRM_WORD} para liberar a atualização`}
                        />
                    </div>

                    {/* Acoes */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isRefreshing}
                            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-semibold transition-colors disabled:opacity-40"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={tryConfirm}
                            disabled={isRefreshing || !matches}
                            title={!matches ? `Digite ${CONFIRM_WORD} para liberar` : undefined}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Atualizando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefreshConfirmModal;

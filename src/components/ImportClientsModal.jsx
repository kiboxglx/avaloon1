import React, { useState } from 'react';
import { X, Upload, Check, AlertTriangle, FileText } from 'lucide-react';
import { supabase } from '../services/supabase';

const ImportClientsModal = ({ isOpen, onClose, onImportSuccess, existingUsernames = [] }) => {
    const [inputText, setInputText] = useState('');
    const [previewData, setPreviewData] = useState([]);
    const [step, setStep] = useState('input'); // input, preview, importing
    const [isProcessing, setIsProcessing] = useState(false);
    const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0, skipped: 0 });

    if (!isOpen) return null;

    const processText = () => {
        const lines = inputText.split('\n');
        const processed = [];

        // Normalizar usernames existentes para comparação (remover @ e lowercase)
        const normalizedExisting = new Set(existingUsernames.map(u => u.replace('@', '').toLowerCase().trim()));

        lines.forEach(line => {
            if (!line.trim()) return;

            // Tentar identificar padrão: Nome [tab/espaço] Link/Username ou apenas Link
            // Estratégia simples: procurar por URLs de instagram ou strings que pareçam usernames

            let name = '';
            let username = '';

            // Checar se tem URL
            const urlMatch = line.match(/(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/);
            if (urlMatch) {
                username = urlMatch[3];
                // O resto da string pode ser o nome
                name = line.replace(urlMatch[0], '').trim();
            } else {
                // Tentar dividir por tabulação (comum em cpy paste de excel/notion)
                const parts = line.split('\t');
                if (parts.length >= 2) {
                    // Assumir ordem: Nome | Link ou Link | Nome?
                    // Verificar qual parece username
                    if (parts[0].includes('instagram.com') || parts[0].startsWith('@')) {
                        username = parts[0];
                        name = parts[1];
                    } else {
                        name = parts[0];
                        username = parts[1];
                    }
                } else {
                    // Apenas uma string, verificar se parece username
                    if (line.trim().startsWith('@')) {
                        username = line.trim();
                        name = username;
                    } else if (line.includes(',')) {
                        // Tentar CSV
                        const parts = line.split(',');
                        name = parts[0];
                        username = parts[1] || parts[0];
                    }
                }
            }

            // Limpeza final
            if (username) {
                // Extrair username se ainda for url
                const finalUrlMatch = username.match(/(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?/);
                if (finalUrlMatch) username = finalUrlMatch[3];

                username = username.replace('@', '').trim();
                if (!name) name = username; // Fallback name

                // Verificar duplicidade
                const isDuplicate = normalizedExisting.has(username.toLowerCase());

                processed.push({
                    name: name.trim(),
                    username: '@' + username,
                    rawUsername: username,
                    status: isDuplicate ? 'duplicate' : 'ready'
                });
            }
        });

        setPreviewData(processed);
        setStep('preview');
    };

    const handleImport = async () => {
        setIsProcessing(true);
        let successCount = 0;
        let failedCount = 0;
        let skippedCount = 0;

        const clientsToInsert = previewData.filter(item => item.status === 'ready');
        skippedCount = previewData.length - clientsToInsert.length;

        // Inserir um por um para garantir (ou em batch se preferir, mas um por um lida melhor com erros individuais)
        for (const client of clientsToInsert) {
            try {
                const clientPayload = {
                    name: client.name,
                    username: client.username,
                    manager: 'Não atribuído', // Default manager
                    days: 0,
                    followers: '0',
                    following: '0',
                    posts: '0',
                    engagement: '0%',
                    latest_post_date: new Date().toISOString()
                };

                const { error } = await supabase.from('clients').insert([clientPayload]);

                if (error) {
                    console.error("Erro ao importar:", client.username, error);
                    failedCount++;
                } else {
                    successCount++;
                }
            } catch (err) {
                console.error("Exceção ao importar:", client.username, err);
                failedCount++;
            }
        }

        setImportStats({
            total: previewData.length,
            success: successCount,
            failed: failedCount,
            skipped: skippedCount
        });

        setIsProcessing(false);
        setStep('result');
        if (successCount > 0) {
            onImportSuccess();
        }
    };

    const handleReset = () => {
        setInputText('');
        setPreviewData([]);
        setStep('input');
        setImportStats({ total: 0, success: 0, failed: 0, skipped: 0 });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Upload size={20} className="text-secondary" />
                        Importar Clientes em Massa
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700">

                    {step === 'input' && (
                        <div className="space-y-4">
                            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-4">
                                <p className="text-secondary text-sm font-medium mb-1">Como usar:</p>
                                <p className="text-zinc-400 text-sm">
                                    Vá até a tabela do Notion, selecione as linhas com Nome e Link do Instagram, copie (Ctrl+C) e cole abaixo.
                                    O sistema tentará identificar automaticamente o nome e o usuário.
                                </p>
                            </div>

                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Exemplo:
Maria Silva    https://instagram.com/mariasilva
João Pedro     @joaopedro
..."
                                className="w-full h-64 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-white text-sm font-mono focus:outline-none focus:border-secondary transition-all resize-none"
                            />
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                <span>Total detectado: {previewData.length}</span>
                                <span>Novos: {previewData.filter(i => i.status === 'ready').length}</span>
                            </div>

                            <div className="border border-white/10 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-800 text-zinc-400">
                                        <tr>
                                            <th className="p-3">Nome</th>
                                            <th className="p-3">Usuário</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {previewData.map((item, idx) => (
                                            <tr key={idx} className={item.status === 'duplicate' ? 'bg-red-500/5' : 'bg-green-500/5'}>
                                                <td className="p-3 text-white">{item.name}</td>
                                                <td className="p-3 text-zinc-300">{item.username}</td>
                                                <td className="p-3">
                                                    {item.status === 'duplicate' ? (
                                                        <span className="text-red-400 text-xs flex items-center gap-1">
                                                            <AlertTriangle size={12} /> Já existe
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-400 text-xs flex items-center gap-1">
                                                            <Check size={12} /> Pronto
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Check size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Importação Concluída!</h3>

                            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                                <div className="bg-zinc-900 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-white">{importStats.success}</div>
                                    <div className="text-xs text-zinc-500">Adicionados</div>
                                </div>
                                <div className="bg-zinc-900 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-zinc-400">{importStats.skipped}</div>
                                    <div className="text-xs text-zinc-500">Ignorados (Duplicados)</div>
                                </div>
                                <div className="bg-zinc-900 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-bold text-red-500">{importStats.failed}</div>
                                    <div className="text-xs text-zinc-500">Erros</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3">
                    {step === 'input' && (
                        <>
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={processText}
                                disabled={!inputText.trim()}
                                className="bg-secondary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Processar
                            </button>
                        </>
                    )}

                    {step === 'preview' && (
                        <>
                            <button onClick={() => setStep('input')} className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors">
                                Voltar
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={isProcessing || previewData.filter(i => i.status === 'ready').length === 0}
                                className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? 'Importando...' : 'Confirmar Importação'}
                            </button>
                        </>
                    )}

                    {step === 'result' && (
                        <>
                            <button onClick={handleReset} className="px-5 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors">
                                Importar Mais
                            </button>
                            <button onClick={onClose} className="bg-secondary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-secondary/90 transition-all">
                                Fechar
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ImportClientsModal;

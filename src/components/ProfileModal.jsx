import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        manager: '',
        username: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                manager: initialData.manager || '',
                username: initialData.username || ''
            });
        } else {
            setFormData({ name: '', manager: '', username: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const isEditing = !!initialData;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-panel rounded-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">
                        {isEditing ? 'Editar Perfil' : '+ Adicionar Perfil'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Conta</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Empresa X"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-600 input-glow"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Gerente de Contas</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: João Silva"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-600 input-glow"
                            value={formData.manager}
                            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome de Usuário</label>
                        <input
                            type="text"
                            required
                            placeholder="@username"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-600 input-glow"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                        />
                    </div>

                    <div className="pt-4">
                        {!isEditing && (
                            <p className="text-xs text-slate-500 mb-4 text-center">
                                Nota: Buscar dados do perfil pode levar 30-60 segundos.
                            </p>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 glass-button text-white rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary hover:bg-slate-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                            >
                                {isEditing ? 'Salvar Alterações' : 'Adicionar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;

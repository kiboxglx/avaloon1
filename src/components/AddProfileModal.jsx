import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddProfileModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        manager: '',
        username: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: '', manager: '', username: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">+ Adicionar Perfil</h2>
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
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-600"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Gerente de Contas</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: João Silva"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-600"
                            value={formData.manager}
                            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome de Usuário</label>
                        <input
                            type="text"
                            required
                            placeholder="@username"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder-slate-600"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <p className="text-xs text-slate-500 mb-4 text-center">
                            Nota: Buscar dados do perfil pode levar 30-60 segundos.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProfileModal;

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Monitor, RefreshCw, Plus, LogOut } from 'lucide-react';
import ClientCard from './components/ClientCard';
import ProfileModal from './components/ProfileModal';
import TvModeTable from './components/TvModeTable';
import { fetchInstagramData } from './services/apify';
import StatsOverview from './components/StatsOverview';
import EmptyState from './components/EmptyState';

import AvaloonLogo from './components/AvaloonLogo';

import { initialClients } from './data/clients';

function App() {
  const [clients, setClients] = useState(() => {
    const savedClients = localStorage.getItem('avaloon_clients');
    if (savedClients) {
      // Check if we need to force migration (optional logic could go here)
      // For now, we return saved clients, but we will provide a way to reset
      return JSON.parse(savedClients);
    }
    return initialClients;
  });

  useEffect(() => {
    localStorage.setItem('avaloon_clients', JSON.stringify(clients));
  }, [clients]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'alert'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const handleSaveProfile = async (data) => {
    if (editingClient) {
      // Edit Mode
      setClients(prevClients => prevClients.map(client =>
        client.id === editingClient.id
          ? { ...client, name: data.name, manager: data.manager, username: data.username }
          : client
      ));
      setEditingClient(null);
      setIsModalOpen(false);
    } else {
      // Add Mode
      const newId = Date.now();
      const newClient = {
        id: newId,
        name: data.name,
        username: data.username,
        manager: data.manager,
        days: 0,
        followers: '...',
        following: '...',
        posts: '...',
        engagement: '...',
        profilePicUrl: null
      };

      // Adiciona imediatamente à lista
      setClients(prev => [newClient, ...prev]);
      setIsModalOpen(false);

      // Busca dados reais em segundo plano
      try {
        const usernameClean = data.username.replace('@', '');
        console.log(`Buscando dados para novo perfil: ${usernameClean}`);

        const updates = await fetchInstagramData([usernameClean]);

        if (updates[usernameClean]) {
          setClients(prev => prev.map(c =>
            c.id === newId ? { ...c, ...updates[usernameClean] } : c
          ));
        }
      } catch (error) {
        console.error("Erro ao buscar dados do novo cliente:", error);
      }
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este perfil?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  const handleUpdateAll = useCallback(async () => {
    setIsUpdating(true);
    const usernames = clients.map(c => c.username.replace('@', '')); // Remove @ for API if needed

    try {
      const updates = await fetchInstagramData(usernames);

      setClients(prevClients => prevClients.map(client => {
        const usernameKey = client.username.replace('@', '');
        if (updates[usernameKey]) {
          return { ...client, ...updates[usernameKey] };
        }
        // Fallback: if we used the mock generator which returns keys exactly as passed
        if (updates[client.username]) {
          return { ...client, ...updates[client.username] };
        }
        return client;
      }));
    } catch (error) {
      console.error("Failed to update clients", error);
    } finally {
      setIsUpdating(false);
    }
  }, [clients]);

  // Atualização automática a cada 6 horas
  useEffect(() => {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const interval = setInterval(() => {
      console.log('Executando atualização automática (6h)...');
      handleUpdateAll();
    }, SIX_HOURS);
    return () => clearInterval(interval);
  }, [handleUpdateAll]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' ? true : client.days > 2;

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Prioridade: Vermelho (> 2) > Laranja (>= 1) > Verde (0)
    const getPriority = (days) => {
      if (days > 2) return 3;
      if (days >= 1) return 2;
      return 1;
    };

    const priorityA = getPriority(a.days);
    const priorityB = getPriority(b.days);

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Maior prioridade primeiro
    }

    return b.days - a.days; // Mais dias de atraso primeiro
  });

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <AvaloonLogo className="h-20 md:h-24" />
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border ${isTvMode ? 'bg-secondary border-secondary text-white shadow-[0_0_20px_rgba(255,87,34,0.4)]' : 'glass-button text-zinc-300 border-white/10 hover:border-secondary/50'}`}
          >
            <Monitor size={18} /> <span className="hidden sm:inline">Modo TV</span>
          </button>

          <button
            onClick={handleUpdateAll}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border glass-button text-zinc-300 border-white/10 hover:border-secondary/50 hover:text-white ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isUpdating ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          <button
            onClick={() => {
              setEditingClient(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary rounded-xl hover:shadow-[0_0_25px_rgba(255,87,34,0.5)] hover:scale-105 transition-all duration-300 font-bold text-white border border-white/10"
          >
            <Plus size={20} strokeWidth={3} /> <span className="hidden sm:inline">Adicionar</span>
          </button>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border glass-button text-zinc-400 hover:text-red-400 hover:border-red-500/30">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      {!isTvMode && <StatsOverview clients={clients} />}

      {/* Filters */}
      <div className="glass-panel rounded-2xl p-2 mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-secondary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar perfis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none placeholder-zinc-600 input-glow transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto p-1 bg-black/20 rounded-xl">
          <button
            onClick={() => setFilterType('alert')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${filterType === 'alert' ? 'bg-secondary text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            Em Alerta
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${filterType === 'all' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Grid or TV Mode */}
      {isTvMode ? (
        <TvModeTable clients={filteredClients} onExit={() => setIsTvMode(false)} />
      ) : (
        <>
          {filteredClients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClients.map(client => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={() => handleEditClient(client)}
                  onDelete={() => handleDeleteClient(client.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message={searchTerm ? `Nenhum resultado para "${searchTerm}"` : "Nenhum cliente encontrado"}
              subMessage={filterType === 'alert' ? "Nenhum cliente está em alerta no momento." : "Adicione um novo perfil para começar."}
            />
          )}
        </>
      )}

      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={editingClient}
      />
    </div>
  );
}

export default App;

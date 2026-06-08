import React, { useState, useEffect, useCallback } from 'react';
import { Search, Monitor, RefreshCw, Plus, LogOut, Upload, MessageSquare } from 'lucide-react';
import ClientCard from './components/ClientCard';
import ProfileModal from './components/ProfileModal';
import ImportClientsModal from './components/ImportClientsModal';
import RefreshConfirmModal from './components/RefreshConfirmModal';
import TvModeTable from './components/TvModeTable';
import { fetchInstagramData, fetchInstagramStories, resolveStoryDays } from './services/apify';
import StatsOverview from './components/StatsOverview';
import RefreshStatus from './components/RefreshStatus';
import EmptyState from './components/EmptyState';
import AvaloonLogo from './components/AvaloonLogo';
import MobileNav from './components/MobileNav';
import Login from './components/Login';
import MaintenanceScreen from './components/MaintenanceScreen';
import { supabase } from './services/supabase';

// Lista de e-mails que são administradores (Gerentes)
// Você pode adicionar mais e-mails aqui ou usar user_metadata.role = 'admin' no Supabase
const ADMIN_EMAILS = [
  'admin@avaloon.com',
  'gerente@avaloon.com',
  'dono@avaloon.com'
];

function App() {
  const [clients, setClients] = useState([]);
  const [session, setSession] = useState(null); // Auth State
  const [authLoading, setAuthLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(null); // Kill-switch: { title, message } quando ativo
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, alert, onTrack
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRefreshConfirmOpen, setIsRefreshConfirmOpen] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);
  const [isTvMode, setIsTvMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null); // id do card em refresh individual
  const [editingClient, setEditingClient] = useState(null);
  const [selectedManager, setSelectedManager] = useState('all');
  const [isTestingAlert, setIsTestingAlert] = useState(false);

  // Check if current user is admin
  const isAdmin = session?.user && (
    ADMIN_EMAILS.includes(session.user.email) ||
    session.user.user_metadata?.role === 'admin'
  );

  // Extrair gestores únicos para o filtro
  const uniqueManagers = [...new Set(clients.map(client => client.manager).filter(Boolean))].sort();

  // Kill-switch de manutenção: lê avaloon_settings antes de tudo.
  // Fail-safe: qualquer erro de leitura NÃO bloqueia o app (só bloqueia quando a flag está explicitamente ligada).
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data, error } = await supabase
          .from('avaloon_settings')
          .select('maintenance_mode, maintenance_title, maintenance_message')
          .eq('id', 1)
          .single();

        if (!error && data?.maintenance_mode) {
          setMaintenance({
            title: data.maintenance_title,
            message: data.maintenance_message,
          });
        }
      } catch (err) {
        console.error('Erro ao verificar status do sistema:', err);
      } finally {
        setSettingsLoading(false);
      }
    };

    checkMaintenance();
  }, []);

  // Le a ultima atualizacao global (query isolada: se a coluna nao existir, nao quebra o kill-switch).
  useEffect(() => {
    const loadLastRefresh = async () => {
      try {
        const { data, error } = await supabase
          .from('avaloon_settings')
          .select('last_refresh_at')
          .eq('id', 1)
          .single();
        if (!error && data?.last_refresh_at) {
          setLastRefreshAt(data.last_refresh_at);
          return;
        }
      } catch (err) {
        console.error('Erro ao ler ultima atualizacao:', err);
      }
      // Fallback local (por dispositivo) quando o global nao esta disponivel.
      const local = localStorage.getItem('avaloon_last_refresh');
      if (local) setLastRefreshAt(local);
    };
    loadLastRefresh();
  }, []);

  // Handle Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch clients from Supabase on load (only if logged in)
  useEffect(() => {
    if (session) {
      fetchClients();
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;

      // Map Supabase columns to app state (snake_case to camelCase if needed, but we kept it simple).
      // Banco vazio = lista vazia (EmptyState). Sem auto-seed: clientes excluidos nao voltam.
      const formattedData = (data || []).map(client => ({
        ...client,
        latestPostDate: client.latest_post_date, // Map database column to app property
        latestStoryDate: client.last_story_date, // Story tracking (secundario)
        // Stories nao tem historico: o "dias sem story" precisa subir mesmo sem scraping novo.
        // Recalculamos a partir do ultimo carimbo toda vez que o app carrega.
        story_days: resolveStoryDays(client.last_story_date, null).storyDays
      }));
      setClients(formattedData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (newClient) => {
    try {
      const clientToSave = {
        name: newClient.name,
        username: newClient.username,
        manager: newClient.manager,
        manager_phone: newClient.manager_phone,
        days: 0,
        followers: '0',
        following: '0',
        posts: '0',
        engagement: '0%',
        latest_post_date: new Date().toISOString()
      };

      const { data, error } = await supabase.from('clients').insert([clientToSave]).select();

      if (error) throw error;

      if (data) {
        const addedClient = { ...data[0], latestPostDate: data[0].latest_post_date };
        setClients(prev => [...prev, addedClient]);
        setIsModalOpen(false);
        // Optionally refresh data immediately
        handleRefresh([addedClient]);
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Erro ao adicionar cliente. Tente novamente.');
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveProfile = async (formData) => {
    if (!isAdmin) {
      alert('Você não tem permissão para realizar esta ação.');
      return;
    }

    if (editingClient) {
      // Update existing
      try {
        const { error } = await supabase
          .from('clients')
          .update({
            name: formData.name,
            username: formData.username,
            manager: formData.manager,
            manager_phone: formData.manager_phone
          })
          .eq('id', editingClient.id);

        if (error) throw error;

        setClients(clients.map(c =>
          c.id === editingClient.id ? { ...c, ...formData } : c
        ));
        setIsModalOpen(false);
        setEditingClient(null);
      } catch (error) {
        console.error('Error updating client:', error);
        alert('Erro ao atualizar cliente.');
      }
    } else {
      // Add new
      handleAddClient(formData);
    }
  };

  const handleDeleteClient = async (id) => {
    if (!isAdmin) {
      alert('Você não tem permissão para excluir clientes.');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        setClients(clients.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Erro ao excluir cliente.');
      }
    }
  };

  const handleRefresh = useCallback(async (clientsToUpdate = clients) => {
    setIsRefreshing(true);
    const usernames = clientsToUpdate.map(c => c.username.replace('@', '')); // Remove @ for API if needed

    try {
      const refreshedAt = new Date().toISOString();
      const updates = await fetchInstagramData(usernames);

      // Stories: camada aditiva e independente. Se falhar, seguimos so com posts.
      let storyUpdates = {};
      try {
        storyUpdates = await fetchInstagramStories(usernames);
      } catch (storyError) {
        console.error('Falha ao buscar stories (seguindo sem stories):', storyError);
      }

      const pickUpdate = (map, client) => map[client.username.replace('@', '')] || map[client.username];

      // Recalcula posts (inalterado) + stories (incremental: conta desde o ultimo registro).
      const updatedClients = clients.map(client => {
        const update = pickUpdate(updates, client); // Check both formats
        const storyUpdate = pickUpdate(storyUpdates, client);
        const prevStoryDate = client.latestStoryDate || client.last_story_date || null;
        const story = resolveStoryDays(prevStoryDate, storyUpdate && storyUpdate.activeStoryDate);

        let merged = client;
        if (update) {
          merged = { ...merged, ...update, last_refreshed_at: refreshedAt };
        }
        if (story.latestStoryDate) {
          merged = { ...merged, story_days: story.storyDays, latestStoryDate: story.latestStoryDate };
        }
        return merged;
      });

      setClients(updatedClients);

      // Persiste no Supabase (um a um, MVP). Posts e stories vao no mesmo patch.
      for (const client of updatedClients) {
        const update = pickUpdate(updates, client); // Check both formats
        const patch = {};
        if (update) {
          patch.days = update.days;
          patch.followers = update.followers;
          patch.following = update.following;
          patch.posts = update.posts;
          patch.engagement = update.engagement;
          patch.latest_post_date = update.latestPostDate;
          patch.last_refreshed_at = refreshedAt; // carimba o card consultado
        }
        if (client.latestStoryDate) {
          patch.story_days = client.story_days;
          patch.last_story_date = client.latestStoryDate;
        }
        if (Object.keys(patch).length > 0) {
          await supabase.from('clients').update(patch).eq('id', client.id);
        }
      }

      // Carimba a ultima atualizacao GLOBAL (Supabase + fallback local).
      try {
        await supabase.from('avaloon_settings').update({ last_refresh_at: refreshedAt }).eq('id', 1);
      } catch (settingsError) {
        console.error('Nao foi possivel salvar a ultima atualizacao no Supabase:', settingsError);
      }
      localStorage.setItem('avaloon_last_refresh', refreshedAt);
      setLastRefreshAt(refreshedAt);

    } catch (error) {
      console.error("Failed to refresh data:", error);
      alert("Falha ao atualizar dados do Instagram. Verifique o console.");
    } finally {
      setIsRefreshing(false);
    }
  }, [clients]); // Dependency on clients to ensure it uses the latest list

  // Clique manual em "Atualizar" abre o modal de confirmacao (economia de creditos Apify).
  // Os refreshes automaticos (6h, add, import) NAO passam pelo modal.
  const handleRefreshClick = () => setIsRefreshConfirmOpen(true);

  const confirmRefresh = async () => {
    await handleRefresh(clients);
    setIsRefreshConfirmOpen(false);
  };

  // Atualiza SO um cliente (economia). NAO grava o last_refresh_at global — atualizar
  // 1 card nao deve adiar o auto-refresh de TODOS nem mexer no "ultima atualizacao" geral.
  const handleRefreshOne = useCallback(async (client) => {
    if (!isAdmin || refreshingId) return;
    setRefreshingId(client.id);
    const usernameKey = client.username.replace('@', '');
    try {
      const updates = await fetchInstagramData([usernameKey]);
      let storyUpdates = {};
      try {
        storyUpdates = await fetchInstagramStories([usernameKey]);
      } catch (storyError) {
        console.error('Falha ao buscar story deste cliente:', storyError);
      }

      const update = updates[usernameKey] || updates[client.username];
      const storyUpdate = storyUpdates[usernameKey] || storyUpdates[client.username];
      const prevStoryDate = client.latestStoryDate || client.last_story_date || null;
      const story = resolveStoryDays(prevStoryDate, storyUpdate && storyUpdate.activeStoryDate);

      const refreshedAt = new Date().toISOString();
      const patch = { last_refreshed_at: refreshedAt }; // sempre carimba (inicia o cooldown)
      if (update) {
        patch.days = update.days;
        patch.followers = update.followers;
        patch.following = update.following;
        patch.posts = update.posts;
        patch.engagement = update.engagement;
        patch.latest_post_date = update.latestPostDate;
      }
      if (story.latestStoryDate) {
        patch.story_days = story.storyDays;
        patch.last_story_date = story.latestStoryDate;
      }

      await supabase.from('clients').update(patch).eq('id', client.id);

      // Atualiza so este cliente no estado local.
      setClients(prev => prev.map(c => {
        if (c.id !== client.id) return c;
        let merged = { ...c, ...(update || {}), last_refreshed_at: refreshedAt };
        if (story.latestStoryDate) {
          merged = { ...merged, story_days: story.storyDays, latestStoryDate: story.latestStoryDate };
        }
        return merged;
      }));
    } catch (error) {
      console.error('Falha ao atualizar este cliente:', error);
      alert('Falha ao atualizar este perfil. Tente novamente.');
    } finally {
      setRefreshingId(null);
    }
  }, [isAdmin, refreshingId]);

  const handleTestAlert = async () => {
    if (!isAdmin) return;

    setIsTestingAlert(true);
    try {
      // Chamada manual para a API Route de alertas
      const response = await fetch('/api/check-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        if (data.alerts_sent.length > 0) {
          alert(`✅ Sucesso! Alertas de WhatsApp enviados para: ${data.alerts_sent.join(', ')}`);
        } else {
          alert('ℹ️ Verificação concluída. Nenhuma conta atingiu o limite de dias para alerta hoje.');
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido na API');
      }
    } catch (error) {
      console.error('Erro ao testar alertas:', error);
      alert(`❌ Falha ao processar alertas: ${error.message}`);
    } finally {
      setIsTestingAlert(false);
    }
  };

  // Auto-refresh a cada 6h CONTADAS A PARTIR DA ULTIMA ATUALIZACAO (manual ou automatica).
  // Se alguem atualiza manualmente, lastRefreshAt muda, este efeito reinicia e o proximo
  // automatico e adiado — evitando dois refreshes (e dois gastos) na mesma janela de 6h.
  useEffect(() => {
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const CHECK_INTERVAL = 60 * 1000; // verifica de minuto em minuto
    const tick = () => {
      if (isRefreshing) return;
      const lastMs = lastRefreshAt ? new Date(lastRefreshAt).getTime() : 0;
      if (Date.now() - lastMs >= SIX_HOURS) {
        console.log('Auto-refresh: 6h desde a ultima atualizacao.');
        handleRefresh();
      }
    };
    const interval = setInterval(tick, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [handleRefresh, lastRefreshAt, isRefreshing]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' ? true : client.days >= 3;
    const matchesManager = selectedManager === 'all' ? true : client.manager === selectedManager;

    return matchesSearch && matchesFilter && matchesManager;
  }).sort((a, b) => {
    // Prioridade: Vermelho (> 2) > Laranja (>= 1) > Verde (0)
    const getPriority = (days) => {
      if (days >= 3) return 3;
      if (days === 2) return 2;
      return 1;
    };

    const priorityA = getPriority(a.days);
    const priorityB = getPriority(b.days);

    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Maior prioridade primeiro
    }

    return b.days - a.days; // Mais dias de atraso primeiro
  });

  // Enquanto verifica o kill-switch, segura a renderização (evita flash do painel antes do bloqueio)
  if (settingsLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;
  }

  // Bloqueio total: cobre tudo, inclusive o login
  if (maintenance) {
    return <MaintenanceScreen title={maintenance.title} message={maintenance.message} />;
  }

  if (authLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 md:pb-8 font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <AvaloonLogo className="h-20 md:h-24" />
        </div>

        <div className="hidden md:flex flex-wrap justify-center gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsTvMode(!isTvMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border ${isTvMode ? 'bg-secondary border-secondary text-white shadow-[0_0_20px_rgba(255,87,34,0.4)]' : 'glass-button text-zinc-300 border-white/10 hover:border-secondary/50'} `}
          >
            <Monitor size={18} /> <span className="hidden sm:inline">Modo TV</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border glass-button text-zinc-300 border-white/10 hover:border-secondary/50 hover:text-white ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''} `}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isRefreshing ? 'Atualizando...' : 'Atualizar todos'}</span>
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border glass-button text-zinc-300 border-white/10 hover:border-secondary/50 hover:text-white"
                title="Importar Clientes"
              >
                <Upload size={20} /> <span className="hidden lg:inline">Importar</span>
              </button>

              <button
                onClick={handleTestAlert}
                disabled={isTestingAlert}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border glass-button text-zinc-300 border-white/10 hover:border-green-500/50 hover:text-white ${isTestingAlert ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Testar Envio de WhatsApp"
              >
                <MessageSquare size={18} className={isTestingAlert ? 'animate-pulse text-green-500' : ''} />
                <span className="hidden lg:inline">{isTestingAlert ? 'Verificando...' : 'Testar Alertas'}</span>
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
            </>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium border glass-button text-zinc-400 hover:text-red-400 hover:border-red-500/30"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      {!isTvMode && <StatsOverview clients={clients} />}
      {!isTvMode && <RefreshStatus lastRefreshAt={lastRefreshAt} isRefreshing={isRefreshing} />}

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

        {/* Manager Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
            className="w-full bg-black/20 text-white px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-secondary/50 appearance-none cursor-pointer hover:bg-black/30 transition-colors"
            style={{ backgroundImage: 'none' }} // Remove default arrow if needed, but standard select is fine for MVP
          >
            <option value="all" className="bg-zinc-900 text-zinc-300">Todos Gestores</option>
            {uniqueManagers.map(manager => (
              <option key={manager} value={manager} className="bg-zinc-900 text-white">
                {manager}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto p-1 bg-black/20 rounded-xl">
          <button
            onClick={() => setFilterType('alert')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${filterType === 'alert' ? 'bg-secondary text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'} `}
          >
            Em Alerta
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${filterType === 'all' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'} `}
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
                  isAdmin={isAdmin} // Pass admin role
                  onRefreshOne={() => handleRefreshOne(client)}
                  isRefreshing={refreshingId === client.id}
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

      <RefreshConfirmModal
        isOpen={isRefreshConfirmOpen}
        onClose={() => setIsRefreshConfirmOpen(false)}
        onConfirm={confirmRefresh}
        lastRefreshAt={lastRefreshAt}
        count={clients.length}
        isRefreshing={isRefreshing}
      />

      <ImportClientsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          setIsImportModalOpen(false);
          handleRefresh(clients); // Refresh list
          fetchClients(); // Re-fetch from DB
        }}
        existingUsernames={clients.map(c => c.username)}
      />

      <MobileNav
        isTvMode={isTvMode}
        setIsTvMode={setIsTvMode}
        onRefresh={handleRefreshClick}
        isRefreshing={isRefreshing}
        onAddClick={() => {
          setEditingClient(null);
          setIsModalOpen(true);
        }}
        onHomeClick={() => setIsTvMode(false)}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default App;

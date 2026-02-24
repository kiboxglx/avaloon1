import { fetchInstagramData } from '../src/services/apify.js';
import { sendWhatsAppAlert } from '../src/services/whatsapp.js';
import { supabase } from '../src/services/supabase.js';

export default async function handler(req, res) {
    console.log('Iniciando verificação de Instagram para alertas segmentados...');

    try {
        const threshold = parseInt(process.env.VITE_ALERT_THRESHOLD_DAYS || '3', 10);
        const directorPhone = process.env.VITE_DIRECTOR_WHATSAPP_NUMBER;

        if (!directorPhone) {
            console.error('ERRO: VITE_DIRECTOR_WHATSAPP_NUMBER não configurado.');
            return res.status(500).json({ error: 'Configuração faltante: VITE_DIRECTOR_WHATSAPP_NUMBER' });
        }

        // Buscar todos os clientes do Supabase (incluindo o telefone do gerente)
        const { data: clients, error: supabaseError } = await supabase
            .from('clients')
            .select('username, name, manager, manager_phone');

        if (supabaseError) {
            console.error('Erro ao buscar clientes no Supabase:', supabaseError);
            return res.status(500).json({ error: 'Falha ao buscar clientes no banco de dados' });
        }

        if (!clients || clients.length === 0) {
            return res.status(200).json({ message: 'Nenhum cliente cadastrado no banco de dados.' });
        }

        const accounts = clients.map(c => c.username.replace('@', '').trim());
        console.log(`Verificando ${accounts.length} contas...`);

        const results = await fetchInstagramData(accounts);

        const alertsSummary = [];

        for (const client of clients) {
            const cleanUsername = client.username.replace('@', '').trim();
            const data = results[cleanUsername];

            if (!data) continue;

            if (data.days >= threshold) {
                const lastDate = data.latestPostDate ? new Date(data.latestPostDate).toLocaleDateString('pt-BR') : 'Desconhecida';

                // Mensagem para o Gerente
                const managerMessage = `🚨 *Alerta de Postagem - Avaloon*\n\nOlá *${client.manager || 'Gerente'}*,\n\nO perfil *${client.name}* (@${cleanUsername}) sob sua responsabilidade está há *${data.days}* dias sem postar!\n\n📅 Última postagem: ${lastDate}\n🔗 https://instagram.com/${cleanUsername}`;

                // Mensagem para o Diretor (inclui quem é o gerente)
                const directorMessage = `🚨 *Alerta Geral - Avaloon*\n\nO perfil *${client.name}* (@${cleanUsername}) está há *${data.days}* dias sem postar.\n\n👤 Gerente: ${client.manager || 'Não atribuído'}\n📅 Última postagem: ${lastDate}\n🔗 https://instagram.com/${cleanUsername}`;

                // 1. Envia para o Gerente (se tiver número cadastrado)
                if (client.manager_phone) {
                    const cleanPhone = client.manager_phone.replace(/\s+/g, '').replace('+', '');
                    console.log(`Enviando alerta para o Gerente ${client.manager} (${cleanPhone})...`);
                    await sendWhatsAppAlert(cleanPhone, managerMessage);
                }

                // 2. Envia sempre para o Diretor
                console.log(`Enviando cópia para o Diretor...`);
                const cleanDirectorPhone = directorPhone.replace(/\s+/g, '').replace('+', '');
                await sendWhatsAppAlert(cleanDirectorPhone, directorMessage);

                alertsSummary.push({ client: client.name, manager: client.manager });
            }
        }

        return res.status(200).json({
            success: true,
            alerts_sent_count: alertsSummary.length,
            details: alertsSummary,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro crítico no processamento de alertas:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

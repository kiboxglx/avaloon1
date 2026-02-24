import { fetchInstagramData } from '../src/services/apify.js';
import { sendWhatsAppAlert } from '../src/services/whatsapp.js';
import { supabase } from '../src/services/supabase.js';

export default async function handler(req, res) {
    console.log('Iniciando verificação de Instagram para TODOS os clientes cadastrados...');

    try {
        const threshold = parseInt(process.env.VITE_ALERT_THRESHOLD_DAYS || '3', 10);
        const destination = process.env.VITE_WHATSAPP_DESTINATION;

        if (!destination) {
            console.error('ERRO: VITE_WHATSAPP_DESTINATION não configurado.');
            return res.status(500).json({ error: 'Configuração faltante: VITE_WHATSAPP_DESTINATION' });
        }

        // Buscar todos os clientes do Supabase
        const { data: clients, error: supabaseError } = await supabase
            .from('clients')
            .select('username, name');

        if (supabaseError) {
            console.error('Erro ao buscar clientes no Supabase:', supabaseError);
            return res.status(500).json({ error: 'Falha ao buscar clientes no banco de dados' });
        }

        if (!clients || clients.length === 0) {
            return res.status(200).json({ message: 'Nenhum cliente cadastrado no banco de dados.' });
        }

        // Extrair apenas os usernames (removendo @ se existir)
        const accounts = clients.map(c => c.username.replace('@', '').trim());

        console.log(`Verificando ${accounts.length} contas: ${accounts.join(', ')} (Threshold: ${threshold} dias)`);

        const results = await fetchInstagramData(accounts);

        const alertsSent = [];

        for (const client of clients) {
            const cleanUsername = client.username.replace('@', '').trim();
            const data = results[cleanUsername];

            if (!data) {
                console.warn(`Dados não encontrados para ${client.username}`);
                continue;
            }

            console.log(`${client.username}: ${data.days} dias sem postar.`);

            if (data.days >= threshold) {
                const lastDate = data.latestPostDate ? new Date(data.latestPostDate).toLocaleDateString('pt-BR') : 'Desconhecida';
                const message = `🚨 *Alerta Avaloon*\n\nO perfil *${client.name}* (@${cleanUsername}) está há *${data.days}* dias sem postar!\n\n📅 Última postagem: ${lastDate}\n\n🔗 https://instagram.com/${cleanUsername}`;

                console.log(`Enviando alerta para ${client.name}...`);
                await sendWhatsAppAlert(destination, message);
                alertsSent.push(client.name);
            }
        }

        return res.status(200).json({
            success: true,
            alerts_sent: alertsSent,
            total_checked: accounts.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro crítico na execução do check-instagram:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

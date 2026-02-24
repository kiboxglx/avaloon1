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

        const alertsToNotifyDirector = [];
        const alertsSummary = [];

        for (const client of clients) {
            const cleanUsername = client.username.replace('@', '').trim();
            const data = results[cleanUsername];

            if (!data) continue;

            if (data.days >= threshold) {
                const lastDate = data.latestPostDate ? new Date(data.latestPostDate).toLocaleDateString('pt-BR') : 'Desconhecida';

                // Mensagem para o Gerente
                const managerMessage = `🚨 *Alerta de Postagem - Avaloon*\n\nOlá *${client.manager || 'Gerente'}*,\n\nO perfil *${client.name}* (@${cleanUsername}) sob sua responsabilidade está há *${data.days}* dias sem postar!\n\n📅 Última postagem: ${lastDate}\n🔗 https://instagram.com/${cleanUsername}`;

                // Adicionar à lista do Diretor
                alertsToNotifyDirector.push({
                    name: client.name,
                    username: cleanUsername,
                    days: data.days,
                    manager: client.manager || 'Não atribuído',
                    lastPost: lastDate
                });

                // 1. Envia para o Gerente (se tiver número cadastrado)
                if (client.manager_phone) {
                    const cleanPhone = client.manager_phone.replace(/\s+/g, '').replace('+', '').replace(/[()-\s]/g, '');
                    console.log(`Enviando alerta individual para o Gerente ${client.manager} (${cleanPhone})...`);
                    try {
                        await sendWhatsAppAlert(cleanPhone, managerMessage);
                    } catch (err) {
                        console.error(`Falha ao enviar para gerente ${client.manager}:`, err.message);
                    }
                }

                alertsSummary.push({ client: client.name, manager: client.manager });
            }
        }

        // 2. Envia RESUMO para o Diretor (se houver alertas)
        if (alertsToNotifyDirector.length > 0) {
            console.log(`Enviando resumo de ${alertsToNotifyDirector.length} alertas para o Diretor...`);

            let summaryMessage = `📊 *Resumo de Alertas - Avaloon*\n\nExistem *${alertsToNotifyDirector.length}* perfis precisando de atenção:\n\n`;

            alertsToNotifyDirector.forEach((alert, index) => {
                summaryMessage += `${index + 1}. *${alert.name}* (@${alert.username})\n   ⏳ ${alert.days} dias sem postar\n   👤 Gerente: ${alert.manager}\n   🔗 https://instagram.com/${alert.username}\n\n`;
            });

            summaryMessage += `_Total de alertas hoje: ${alertsToNotifyDirector.length}_`;

            const cleanDirectorPhone = directorPhone.replace(/\s+/g, '').replace('+', '').replace(/[()-\s]/g, '');
            try {
                await sendWhatsAppAlert(cleanDirectorPhone, summaryMessage);
            } catch (err) {
                console.error(`Falha ao enviar resumo para Diretor:`, err.message);
            }
        }

        return res.status(200).json({
            success: true,
            alerts_sent_count: alertsSummary.length,
            alerts_sent: alertsSummary.map(a => a.client),
            details: alertsSummary,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro crítico no processamento de alertas:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

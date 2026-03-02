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
        const alertsToNotifyCEO = []; // Alertas graves (> 5 dias)
        const alertsByManager = {}; // Alertas agrupados por gerente
        const alertsSummary = [];

        for (const client of clients) {
            const cleanUsername = client.username.replace('@', '').trim();
            const data = results[cleanUsername];

            if (!data) continue;

            if (data.days >= threshold) {
                const lastDate = data.latestPostDate ? new Date(data.latestPostDate).toLocaleDateString('pt-BR') : 'Desconhecida';

                // Adicionar à lista do Diretor
                const alertInfo = {
                    name: client.name,
                    username: cleanUsername,
                    days: data.days,
                    manager: client.manager || 'Não atribuído',
                    lastPost: lastDate
                };

                alertsToNotifyDirector.push(alertInfo);

                // Se tiver mais de 5 dias, vai para a lista do CEO
                if (data.days >= 5) {
                    alertsToNotifyCEO.push(alertInfo);
                }

                // Agrupar para envio individual para Gerente
                if (client.manager_phone) {
                    const cleanPhone = client.manager_phone.replace(/[()-\s+]/g, '');
                    if (!alertsByManager[cleanPhone]) {
                        alertsByManager[cleanPhone] = {
                            name: client.manager || 'Gerente',
                            alerts: []
                        };
                    }
                    alertsByManager[cleanPhone].alerts.push(alertInfo);
                }

                alertsSummary.push({ client: client.name, manager: client.manager });
            }
        }

        // 1. Enviar mensagens para os GERENTES (Resumo por gerente)
        for (const [phone, group] of Object.entries(alertsByManager)) {
            let managerMsg = `🚨 *Alertas de Gestão - Avaloon*\n\nOlá *${group.name}*,\n\nOs seguintes perfis sob sua responsabilidade precisam de postagem:\n\n`;
            group.alerts.forEach((a, i) => {
                managerMsg += `${i + 1}. *${a.name}* (@${a.username})\n   ⏳ ${a.days} dias sem postar\n   📅 Última: ${a.lastPost}\n\n`;
            });
            managerMsg += `_Por favor, verifique com os clientes._`;

            try {
                console.log(`Enviando resumo para Gerente ${group.name} (${phone})...`);
                await sendWhatsAppAlert(phone, managerMsg);
            } catch (err) {
                console.error(`Erro ao enviar para gerente ${group.name}:`, err.message);
            }
        }

        // 2. Envia RESUMO para o Diretor
        if (alertsToNotifyDirector.length > 0) {
            console.log(`Enviando resumo para o Diretor...`);
            let directorMsg = `📊 *Resumo Geral - Avaloon*\n\nExistem *${alertsToNotifyDirector.length}* perfis precisando de atenção:\n\n`;
            alertsToNotifyDirector.forEach((alert, index) => {
                directorMsg += `${index + 1}. *${alert.name}* (@${alert.username})\n   ⏳ ${alert.days} dias | 👤 ${alert.manager}\n\n`;
            });

            const cleanDirectorPhone = directorPhone.replace(/[()-\s+]/g, '');
            try {
                await sendWhatsAppAlert(cleanDirectorPhone, directorMsg);
            } catch (err) {
                console.error(`Erro ao enviar para Diretor:`, err.message);
            }
        }

        // 3. Envia RESUMO CRÍTICO para o CEO (> 5 dias)
        const ceoPhone = process.env.VITE_CEO_WHATSAPP_NUMBER;
        if (ceoPhone && alertsToNotifyCEO.length > 0) {
            console.log(`Enviando resumo crítico para o CEO...`);
            let ceoMsg = `🔥 *ALERTA CRÍTICO (CEO) - Avaloon*\n\nOs seguintes perfis estão há *mais de 5 dias* sem postar:\n\n`;
            alertsToNotifyCEO.forEach((alert, index) => {
                ceoMsg += `${index + 1}. *${alert.name}* (@${alert.username})\n   🚫 *${alert.days} dias* | 👤 Gerente: ${alert.manager}\n\n`;
            });
            ceoMsg += `_Ação imediata recomendada._`;

            const cleanCeoPhone = ceoPhone.replace(/[()-\s+]/g, '');
            try {
                await sendWhatsAppAlert(cleanCeoPhone, ceoMsg);
            } catch (err) {
                console.error(`Erro ao enviar para CEO:`, err.message);
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

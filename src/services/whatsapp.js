import twilio from 'twilio';

// Usar import.meta.env para o frontend (Vite) ou process.env para o backend (Node/Vercel)
const getEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    return process.env[key];
};

const client = twilio(
    getEnv('VITE_TWILIO_ACCOUNT_SID'),
    getEnv('VITE_TWILIO_AUTH_TOKEN')
);

export const sendWhatsAppAlert = async (to, message) => {
    try {
        const fromNumber = getEnv('VITE_TWILIO_WHATSAPP_NUMBER');
        console.log(`Enviando WhatsApp de ${fromNumber} para ${to}...`);

        const result = await client.messages.create({
            body: message,
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${to}`
        });

        console.log('WhatsApp enviado com sucesso:', result.sid);
        return result;
    } catch (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        throw error;
    }
};

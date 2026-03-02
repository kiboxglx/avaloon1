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

        const MAX_LENGTH = 1500;
        const chunks = [];

        let remainingMessage = message;
        while (remainingMessage.length > 0) {
            if (remainingMessage.length <= MAX_LENGTH) {
                chunks.push(remainingMessage);
                break;
            }

            // Find the last newline within the MAX_LENGTH limit
            let splitIndex = remainingMessage.lastIndexOf('\n', MAX_LENGTH);

            // If no newline is found, just hard split at MAX_LENGTH
            if (splitIndex === -1) {
                splitIndex = MAX_LENGTH;
            }

            chunks.push(remainingMessage.substring(0, splitIndex));
            remainingMessage = remainingMessage.substring(splitIndex).trim(); // trim leading newlines/spaces
        }

        let lastResult = null;
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const partInfo = chunks.length > 1 ? `\n*(Parte ${i + 1}/${chunks.length})*` : '';

            const bodyToSend = chunk + partInfo;
            console.log(`Enviando chunk ${i + 1}/${chunks.length} com ${bodyToSend.length} caracteres...`);

            lastResult = await client.messages.create({
                body: bodyToSend,
                from: `whatsapp:${fromNumber}`,
                to: `whatsapp:${to}`
            });
            console.log(`Chunk ${i + 1} enviado com sucesso:`, lastResult.sid);
        }

        return lastResult;
    } catch (error) {
        console.error('Erro ao enviar WhatsApp:', error);
        throw error;
    }
};

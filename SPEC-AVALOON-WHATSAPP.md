# SPEC.md - Integração WhatsApp no Avaloon (Customizado)

**Versão:** 1.0  
**Data:** 24/02/2026  
**Projeto:** Avaloon - Sistema de Alertas Instagram → WhatsApp  
**Base:** Projeto existente em `C:\Users\CLIENTE\Desktop\avaloon`

---

## 1. Contexto do Projeto Atual

### 1.1 O que já existe

| Componente | Status | Detalhes |
|------------|--------|----------|
| **Frontend** | ✅ Pronto | React 19 + Vite + Tailwind |
| **Apify Integration** | ✅ Pronto | `src/services/apify.js` já configurado |
| **Proxy API** | ✅ Pronto | `/api/apify` → `api.apify.com` |
| **Supabase** | ✅ Pronto | Backend configurado |
| **Instagram Scraper** | ✅ Pronto | Actor `apify~instagram-profile-scraper` |

### 1.2 O queprecisa adicionar

| Componente | Status | Detalhes |
|------------|--------|----------|
| **WhatsApp Integration** | ❌ Precisa criar | Twilio ou WPPConnect |
| **Backend API** | ❌ Precisa criar | Rotas para cron job |
| **Cron Job** | ❌ Precisa configurar | Vercel Cron |
| **Notificações** | ❌ Precisa criar | Sistema de alertas |

---

## 2. Arquitetura Nova (Integração)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AVALOON - ARQUITETURA                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐         ┌─────────────────────────────────┐ │
│  │   FRONTEND      │         │      BACKEND (API Routes)        │ │
│  │   (React/Vite)  │◀───────▶│      (Vercel Serverless)        │ │
│  └─────────────────┘         └────────────────┬────────────────┘ │
│                                              │                    │
│  ┌─────────────────┐                         │                   │
│  │   SUPABASE      │◀────────────────────────┤                   │
│  │   (Database)    │                         │                   │
│  └─────────────────┘                         │                   │
│                                              ▼                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              SERVIÇOS EXTERNOS                              │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │ │
│  │  │    APIFY     │    │   TWILIO     │    │   CRON JOB   │  │ │
│  │  │ (Instagram)  │    │ (WhatsApp)   │    │  (Vercel)    │  │ │
│  │  └──────────────┘    └──────────────┘    └──────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificação Técnica

### 3.1 Stack Atual + Novas Dependências

**Adicionar no `package.json`:**

```json
{
  "dependencies": {
    "twilio": "^4.19.0",
    "node-cron": "^3.0.3"
  }
}
```

**Configurações de Ambiente (`.env`):**

```env
# === JÁ EXISTE ===
VITE_APIFY_TOKEN=apify_api_X1gMaedLqAE1K1ll1z36F8lCKnOWFJkvUvNr
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === NOVAS ADICIONAR ===
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=+14155238886
WHATSAPP_DESTINATION=+5511999999999

# === CONFIGURAÇÃO DE ALERTAS ===
ALERT_THRESHOLD_DAYS=3
INSTAGRAM_ACCOUNTS=conta1,conta2,conta3
```

---

### 3.2 Nova Estrutura de Arquivos

```
avaloon/
├── src/
│   ├── services/
│   │   ├── apify.js          # ✅ JÁ EXISTE
│   │   ├── supabase.js       # ✅ JÁ EXISTE
│   │   ├── whatsapp.js       # 🆕 NOVO - Envio de mensagens
│   │   └── instagram.js      # 🆕 NOVO - Lógica de verificação
│   │
│   ├── api/                  # 🆕 NOVO - Backend routes
│   │   ├── check-instagram.js
│   │   ├── send-alert.js
│   │   └── cron.js
│   │
│   └── components/           # ✅ JÁ EXISTE
│
├── api/                      # 🆕 NOVO - Vercel API routes
│   ├── instagram-check.js
│   └── whatsapp-webhook.js
│
├── vercel.json              # ✅ JÁ EXISTE - adicionar cron
├── .env                     # ✅ JÁ EXISTE - adicionar vars
└── package.json             # ✅ JÁ EXISTE - adicionar deps
```

---

## 4. Implementação Detalhada

### 4.1 Novo Serviço: WhatsApp (`src/services/whatsapp.js`)

```javascript
import twilio from 'twilio';

const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const fromNumber = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

export const sendWhatsAppAlert = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`
    });
    
    console.log('WhatsApp enviado:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

export const formatWhatsAppMessage = (account, days) => {
  return `⚠️ ALERTA INSTAGRAM

Conta: @${account}
Dias sem postar: ${days} dias

⏰ Verifique e poste algo em breve!

#Avaloon`;
};
```

### 4.2 Novo Serviço: Instagram Check (`src/services/instagram.js`)

```javascript
import { fetchInstagramData } from './apify.js';

const ALERT_THRESHOLD_DAYS = parseInt(import.meta.env.VITE_ALERT_THRESHOLD_DAYS || '3');
const ACCOUNTS = import.meta.env.VITE_INSTAGRAM_ACCOUNTS?.split(',') || [];

export const checkInstagramAccounts = async () => {
  const results = {
    checked: [],
    alerts: []
  };

  for (const account of ACCOUNTS) {
    try {
      const data = await fetchInstagramData([account.trim()]);
      const accountData = data[account.trim()];
      
      const days = accountData?.days || 0;
      
      results.checked.push({
        account,
        days,
        needsAlert: days >= ALERT_THRESHOLD_DAYS
      });

      if (days >= ALERT_THRESHOLD_DAYS) {
        results.alerts.push({
          account,
          days,
          message: `⚠️ @${account} está há ${days} dias sem postar!`
        });
      }
    } catch (error) {
      console.error(`Erro ao verificar ${account}:`, error);
    }
  }

  return results;
};
```

### 4.3 API Route: Instagram Check (`api/instagram-check.js`)

```javascript
import { checkInstagramAccounts } from '../src/services/instagram.js';
import { sendWhatsAppAlert, formatWhatsAppMessage } from '../src/services/whatsapp.js';

export default async function handler(req, res) {
  // Verificar método
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verificar contas Instagram
    const results = await checkInstagramAccounts();
    
    // 2. Enviar alertas se necessário
    const sentAlerts = [];
    for (const alert of results.alerts) {
      const destination = process.env.WHATSAPP_DESTINATION;
      const message = formatWhatsAppMessage(alert.account, alert.days);
      
      const result = await sendWhatsAppAlert(destination, message);
      sentAlerts.push({ ...alert, sent: result.success });
    }

    // 3. Retornar resultado
    return res.status(200).json({
      checked: results.checked,
      alertsSent: sentAlerts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no check:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### 4.4 Configuração Cron no Vercel (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/instagram-check",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 5. Fluxo de Execução

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CRON VERCEL (9:00 diário)                       │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. APIFY: Buscar dados do Instagram                               │
│     - Para cada conta configurada                                  │
│     - Usar actor existente                                         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. PROCESSAR: Calcular dias desde último post                     │
│     - Verificar se dias >= threshold (3 dias)                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. DECISÃO: Precisa enviar alerta?                                │
│                                                                     │
│     SIM              │         NÃO                                 │
│     ▼                │         ▼                                   │
│  Enviar WhatsApp     │   Não enviar nada                           │
│  via Twilio         │   (Loggar verificação)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Dados de Configuração

### 6.1 Variáveis de Ambiente Necessárias

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `VITE_APIFY_TOKEN` | `apify_api_...` | ✅ Já existe |
| `VITE_TWILIO_ACCOUNT_SID` | `AC...` | 🆕 Novo |
| `VITE_TWILIO_AUTH_TOKEN` | `auth_token` | 🆕 Novo |
| `VITE_TWILIO_WHATSAPP_NUMBER` | `+14155238886` | 🆕 Novo |
| `VITE_WHATSAPP_DESTINATION` | `+5511999999999` | 🆕 Novo |
| `VITE_ALERT_THRESHOLD_DAYS` | `3` | 🆕 Novo |
| `VITE_INSTAGRAM_ACCOUNTS` | `conta1,conta2` | 🆕 Novo |

---

## 7. Checklist de Implementação

### Fase 1: Configuração
- [ ] Criar conta Twilio
- [ ] Ativar WhatsApp Sandbox
- [ ] Adicionar variáveis no `.env`
- [ ] Instalar dependências (`npm install twilio node-cron`)

### Fase 2: Desenvolvimento
- [ ] Criar `src/services/whatsapp.js`
- [ ] Criar `src/services/instagram.js`
- [ ] Criar `api/instagram-check.js`
- [ ] Atualizar `vercel.json` com cron

### Fase 3: Testes
- [ ] Testar endpoint `/api/instagram-check` manualmente
- [ ] Verificar se WhatsApp é enviado
- [ ] Testar cron em produção

### Fase 4: Deploy
- [ ] Fazer deploy (`vercel --prod`)
- [ ] Verificar cron job no dashboard Vercel
- [ ] Monitorar logs

---

## 8. Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Apify | Grátis (500 exec) | R$ 0 |
| Twilio | Sandbox | R$ 0 (testes) |
| Twilio | Produção | ~R$ 0,30/mensagem |
| Vercel | Pro (para cron) | R$ 20/mês |

---

## 9. Glossário

| Termo | Definição |
|-------|-----------|
| **Vercel Cron** | Agendador gratuito do Vercel |
| **WhatsApp Sandbox** | Ambiente de testes do Twilio |
| **Serverless Function** | Função que roda sob demanda |
| **Proxy API** | Meio campo que redireciona requisições |

---

## 10. Links Úteis

- **Twilio WhatsApp:** https://www.twilio.com/whatsapp
- **Vercel Cron Jobs:** https://vercel.com/docs/cron-jobs
- **Twilio Node.js SDK:** https://www.twilio.com/docs/libraries/node

---

*Documento customizado para o projeto Avaloon existente.*

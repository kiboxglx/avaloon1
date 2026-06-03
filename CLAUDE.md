# CLAUDE.md — Avaloon

## O que e
Dashboard de monitoramento de contas Instagram para agencias. Alertas automaticos via WhatsApp (Twilio) quando clientes ficam sem postar. 3 niveis: gestor, diretor, CEO.

## Stack
React 19 + Vite 7.2 | Tailwind 4.1 | Supabase (Auth+Postgres) | Twilio WhatsApp Sandbox | Apify (Instagram scraping) | Vercel (serverless + cron)

## Comandos
```bash
npm run dev          # Dev server
npm run build        # Build
```

## Estrutura principal
- `src/App.jsx` — Dashboard principal (auth + gestao de clientes)
- `src/components/` — 10 componentes (cards, stats, modals, TV mode)
- `src/services/` — apify.js, supabase.js, whatsapp.js
- `api/check-instagram.js` — Handler do cron diario (alertas WhatsApp)
- `vercel.json` — Cron: 0 12 * * * (9:00 BRT)

## Convencoes
- Apify para scraping Instagram (sem API oficial)
- Twilio sandbox (50 msgs/dia, migrar para numero dedicado em producao)
- Status por cores: verde (<=1d), laranja (2d), vermelho (>=3d sem postar)

## Vault
vault_path: C:\Users\CLIENTE\vault\01-Projects\avaloon\README.md
Decisoes e patterns documentados la. Atualizar apos mudancas significativas.

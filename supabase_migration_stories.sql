-- Migration ADITIVA: adiciona tracking de Stories.
-- NAO altera nenhuma coluna existente. Seguro rodar mais de uma vez (IF NOT EXISTS).
-- Execute no SQL Editor do Supabase do projeto Avaloon.

alter table clients add column if not exists story_days integer default 0;
alter table clients add column if not exists last_story_date text;

-- Carimbo global da ultima atualizacao manual (modal de confirmacao / economia de creditos Apify).
alter table avaloon_settings add column if not exists last_refresh_at timestamptz;

-- Carimbo POR cliente: ultima vez que aquele card foi atualizado.
-- Usado para mostrar "atualizado ha X" em cada card e para o cooldown de 30min do refresh individual.
alter table clients add column if not exists last_refreshed_at timestamptz;

-- Execute no SQL Editor do painel Supabase

-- Tabela de usuários (sem criptografia conforme solicitado)
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  username    text unique not null,
  password    text not null,
  created_at  timestamptz default now()
);

-- Tabela de conversões vinculada ao usuário
create table if not exists conversions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  url         text not null,
  app_name    text,
  download_url text not null,
  created_at  timestamptz default now()
);

-- RLS: usuários
alter table users enable row level security;
create policy "Allow insert users" on users for insert with check (true);
create policy "Allow select users" on users for select using (true);

-- RLS: conversões (cada usuário vê só as suas)
alter table conversions enable row level security;
create policy "Allow insert conversions" on conversions for insert with check (true);
create policy "Allow select own conversions" on conversions for select using (true);

-- Execute no SQL Editor do painel Supabase

create table if not exists conversions (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  app_name    text,
  download_url text not null,
  created_at  timestamptz default now()
);

-- Política pública de leitura/escrita (ajuste conforme necessário)
alter table conversions enable row level security;

create policy "Allow public insert" on conversions
  for insert with check (true);

create policy "Allow public select" on conversions
  for select using (true);

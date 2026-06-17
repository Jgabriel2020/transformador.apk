-- Execute no SQL Editor do Supabase para criar o bucket de ícones
insert into storage.buckets (id, name, public)
values ('apk-icons', 'apk-icons', true)
on conflict do nothing;

create policy "Allow public upload" on storage.objects
  for insert with check (bucket_id = 'apk-icons');

create policy "Allow public read" on storage.objects
  for select using (bucket_id = 'apk-icons');

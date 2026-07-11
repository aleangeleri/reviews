-- =========================================
-- Ale & Sasi Reviews — schema Supabase
-- Esegui questo script in: Supabase Dashboard > SQL Editor
-- =========================================

-- Tabella località
create table if not exists locations (
  id text primary key,
  name text not null,
  photo text,
  description text,
  created_at timestamptz not null default now()
);

-- Tabella ristoranti
create table if not exists restaurants (
  id text primary key,
  location_id text not null references locations(id) on delete cascade,
  name text not null,
  address text,
  cover text,
  photos text[] not null default '{}',
  description text,
  score_location numeric,
  score_service numeric,
  score_menu numeric,
  score_bill numeric,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table locations enable row level security;
alter table restaurants enable row level security;

-- Lettura pubblica (chiunque visiti il sito deve poter vedere i contenuti)
create policy "Public read locations" on locations
  for select using (true);

create policy "Public read restaurants" on restaurants
  for select using (true);

-- Scrittura solo per utenti autenticati (l'unico utente sarai tu, l'admin,
-- creato manualmente da Dashboard > Authentication > Users. Non attivare
-- la registrazione pubblica: così "authenticated" equivale a "admin".)
create policy "Authenticated write locations" on locations
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated write restaurants" on restaurants
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =========================================
-- Storage per le foto (al posto dei base64 salvati in localStorage)
-- =========================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Public read photos" on storage.objects
  for select using (bucket_id = 'photos');

create policy "Authenticated upload photos" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');

create policy "Authenticated delete photos" on storage.objects
  for delete using (bucket_id = 'photos' and auth.role() = 'authenticated');

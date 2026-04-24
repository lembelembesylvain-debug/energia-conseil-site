-- Dossiers clients sauvegardés depuis le dashboard RenovOptim IA
create table if not exists public.dossiers_clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_nom text,
  client_adresse text,
  dpe_actuel text,
  dpe_cible text,
  profil_mpr text,
  travaux_json jsonb not null default '{}'::jsonb,
  totaux_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists dossiers_clients_user_id_created_at_idx
  on public.dossiers_clients (user_id, created_at desc);

alter table public.dossiers_clients enable row level security;

create policy "dossiers_clients_select_own"
  on public.dossiers_clients for select
  using (auth.uid() = user_id);

create policy "dossiers_clients_insert_own"
  on public.dossiers_clients for insert
  with check (auth.uid() = user_id);

create policy "dossiers_clients_update_own"
  on public.dossiers_clients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "dossiers_clients_delete_own"
  on public.dossiers_clients for delete
  using (auth.uid() = user_id);

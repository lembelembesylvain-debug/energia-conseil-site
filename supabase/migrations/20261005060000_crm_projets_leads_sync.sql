-- CRM ENERGIA — table projets manuels + policies lecture leads_courtier (anon / authenticated)
-- Exécuter dans Supabase SQL Editor si besoin.

-- Colonnes utiles pour le CRM sur leads_courtier (idempotent)
alter table public.leads_courtier add column if not exists source text;
alter table public.leads_courtier add column if not exists partenaire_id text;
alter table public.leads_courtier add column if not exists reference text;
alter table public.leads_courtier add column if not exists type_projet text;
alter table public.leads_courtier add column if not exists statut text;
alter table public.leads_courtier add column if not exists montant_ht numeric;
alter table public.leads_courtier add column if not exists montant_ttc numeric;
alter table public.leads_courtier add column if not exists payload jsonb default '{}'::jsonb;

-- Lecture CRM (bandeau production) — SELECT pour anon + authenticated
drop policy if exists "leads_courtier_select_crm" on public.leads_courtier;
create policy "leads_courtier_select_crm"
  on public.leads_courtier for select
  to anon, authenticated
  using (true);

-- Insert leads depuis formulaires / CRM (anon) — à restreindre en prod si besoin
drop policy if exists "leads_courtier_insert_crm" on public.leads_courtier;
create policy "leads_courtier_insert_crm"
  on public.leads_courtier for insert
  to anon, authenticated
  with check (true);

-- Table projets CRM (Brunel, Pereira, Gilbertas, Massardier, Cloison SDB, Damien PV…)
create table if not exists public.crm_projets (
  id text primary key,
  reference text,
  client_nom text not null,
  statut text,
  type_projet text,
  source text,
  source_lead text,
  apporteur_id text,
  apporteur_nom text,
  telephone text,
  email text,
  ville text,
  code_postal text,
  montant_ht numeric,
  montant_ttc numeric,
  commission_ht numeric,
  marge_nette_ht numeric,
  categorie text,
  payload jsonb not null default '{}'::jsonb,
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_projets_updated_at_idx on public.crm_projets (updated_at desc);
create index if not exists crm_projets_apporteur_idx on public.crm_projets (apporteur_id);

alter table public.crm_projets enable row level security;

drop policy if exists "crm_projets_select_crm" on public.crm_projets;
create policy "crm_projets_select_crm"
  on public.crm_projets for select
  to anon, authenticated
  using (true);

drop policy if exists "crm_projets_upsert_crm" on public.crm_projets;
create policy "crm_projets_upsert_crm"
  on public.crm_projets for insert
  to anon, authenticated
  with check (true);

drop policy if exists "crm_projets_update_crm" on public.crm_projets;
create policy "crm_projets_update_crm"
  on public.crm_projets for update
  to anon, authenticated
  using (true)
  with check (true);

comment on table public.crm_projets is 'Projets CRM ENERGIA (manuels + officiels) — sync Vite /test-dashboard-crm';

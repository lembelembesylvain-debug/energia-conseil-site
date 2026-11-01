-- Leads diagnostic pré-qualifié Catarina / QR flyer.
-- Lecture : jamais exposée en public. Écriture : service_role uniquement.

create table if not exists public.leads_diagnostic_rapide (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text not null,
  code_postal text not null,
  annee_construction integer not null,
  surface_habitable integer not null,
  type_logement text not null,
  type_chauffage text not null,
  dpe text not null,
  objectif_projet text not null,
  consentement_contact boolean not null default false,
  consentement_email boolean not null default false,
  source text not null,
  partenaire_id text not null,
  statut_lead text not null default 'nouveau',
  date_transmission timestamptz not null default now(),
  score_prequalification integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, partenaire_id)
);

alter table public.leads_diagnostic_rapide enable row level security;

drop policy if exists leads_diagnostic_no_public_select on public.leads_diagnostic_rapide;
create policy leads_diagnostic_no_public_select
  on public.leads_diagnostic_rapide
  for select
  using (false);

comment on table public.leads_diagnostic_rapide is
  'Prospects pré-qualifiés via /diagnostic-rapide. Isolés par partenaire_id. Pas de SELECT anon.';

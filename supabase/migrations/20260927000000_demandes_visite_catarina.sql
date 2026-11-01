create table if not exists public.demandes_visite_catarina (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  telephone text not null,
  adresse_maison text not null,
  chauffage_actuel text not null,
  date_souhaitee date not null,
  consentement_contact boolean not null default false,
  origine text not null default 'Origine : Flyer Catarina',
  created_at timestamptz not null default now()
);

alter table public.demandes_visite_catarina enable row level security;

drop policy if exists demandes_visite_catarina_no_public_read
  on public.demandes_visite_catarina;
create policy demandes_visite_catarina_no_public_read
  on public.demandes_visite_catarina
  for select
  using (false);

comment on table public.demandes_visite_catarina is
  'Demandes privées de visite technique reçues depuis la route Catarina du flyer Energia.';

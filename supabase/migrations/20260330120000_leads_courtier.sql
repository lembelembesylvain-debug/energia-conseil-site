-- Table leads courtier — exécuter dans Supabase SQL Editor si besoin
create table if not exists public.leads_courtier (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text not null,
  travaux text[] not null default '{}',
  budget text,
  situation text,
  region text,
  description text,
  created_at timestamptz not null default now()
);

comment on table public.leads_courtier is 'Leads formulaire courtier travaux ENERGIA / Vivons Courtier';

alter table public.leads_courtier enable row level security;

-- La clé service_role (SUPABASE_SERVICE_ROLE_KEY) contourne le RLS côté API Next.js.
-- Sans service role, configurez une policy INSERT adaptée ou désactivez RLS en dev uniquement.

-- Colonnes étendues dossiers_clients (alignement formulaire dashboard + métadonnées)
alter table public.dossiers_clients
  add column if not exists client_prenom text,
  add column if not exists client_email text,
  add column if not exists client_telephone text,
  add column if not exists annee_construction integer,
  add column if not exists type_logement text,
  add column if not exists surface_habitable integer,
  add column if not exists chauffage_actuel text,
  add column if not exists revenus_annuels numeric,
  add column if not exists occupants integer,
  add column if not exists zone_idf boolean,
  add column if not exists statut text default 'en_cours',
  add column if not exists updated_at timestamptz not null default now();

create index if not exists dossiers_clients_user_id_updated_at_idx
  on public.dossiers_clients (user_id, updated_at desc);

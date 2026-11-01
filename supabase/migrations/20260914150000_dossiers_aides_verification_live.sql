-- Vérification live des aides par dossier client
alter table public.dossiers_clients
  add column if not exists source_verification_url text,
  add column if not exists aides_date_verification_web date,
  add column if not exists aides_verifiees_web boolean not null default false,
  add column if not exists aides_verifiees_web_at timestamptz,
  add column if not exists aides_verifiees_web_par text;

comment on column public.dossiers_clients.source_verification_url is
  'URL de la source officielle consultée pour les barèmes d’aides (ex. https://www.anah.gouv.fr).';

comment on column public.dossiers_clients.aides_verifiees_web is
  'True uniquement après marquage administrateur « Vérifiées Web ». Obligatoire avant passage Brouillon → Validé.';

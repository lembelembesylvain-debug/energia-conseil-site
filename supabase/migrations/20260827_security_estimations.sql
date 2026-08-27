-- Sécurité RLS — public.estimations
-- Accès futur uniquement via Supabase Auth (comptes équipe).
-- Aucune policy header, secret frontend, VITE_* ou sessionStorage.
-- Ne pas appliquer tant que l’écran de connexion n’existe pas.
-- Aucune ALTER sur audits, dossiers_clients ou projects.

drop policy if exists estimations_select_equipe on public.estimations;
drop policy if exists estimations_insert_equipe on public.estimations;
drop policy if exists estimations_update_equipe on public.estimations;
drop function if exists public.estimations_acces_autorise();

alter table public.estimations enable row level security;

revoke all on table public.estimations from anon;

create policy estimations_select_equipe
  on public.estimations
  for select
  to authenticated
  using ((select auth.uid()) is not null);

create policy estimations_insert_equipe
  on public.estimations
  for insert
  to authenticated
  with check ((select auth.uid()) is not null);

create policy estimations_update_equipe
  on public.estimations
  for update
  to authenticated
  using ((select auth.uid()) is not null)
  with check ((select auth.uid()) is not null);

-- Pas de policy DELETE.

grant select, insert, update on table public.estimations to authenticated;

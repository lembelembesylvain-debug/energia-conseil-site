-- Estimations commerciales (module ProjectEstimation)
-- Table autonome : aucune ALTER sur dossiers_clients, audits ou projects
-- (seule une FK de estimations.audit_id vers audits.id est ajoutée).
--
-- public.audits.id confirmé UUID → clé étrangère activée, ON DELETE CASCADE.
--
-- Métier : UNE estimation courante par audit (pas d’historique de versions).
-- Unique (audit_id) : un upsert ON CONFLICT (audit_id) met à jour la ligne existante.
-- Historique : nécessiterait une table estimations_versions (estimation_id, version, snapshot)
-- sans unique sur audit_id — hors périmètre.
--
-- RLS : aucune policy définitive.
-- Motif : authentification Vite ≠ Supabase Auth (mot de passe sessionStorage),
-- et ownership des audits non confirmé. Activer RLS + policies après ces points.

create table if not exists public.estimations (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null
    constraint estimations_audit_id_fkey
    references public.audits (id) on delete cascade
    constraint estimations_audit_id_unique unique,
  type_projet text not null
    constraint estimations_type_projet_check
    check (type_projet in ('photovoltaique', 'renovation_globale', 'autre')),
  statut text not null default 'brouillon'
    constraint estimations_statut_check
    check (statut in ('brouillon', 'enregistree')),
  lignes_json jsonb not null default '[]'::jsonb
    constraint estimations_lignes_json_is_array
    check (jsonb_typeof(lignes_json) = 'array'),
  total_materiel_ht numeric not null default 0
    constraint estimations_total_materiel_ht_non_negatif
    check (total_materiel_ht >= 0),
  total_artisans_ht numeric not null default 0
    constraint estimations_total_artisans_ht_non_negatif
    check (total_artisans_ht >= 0),
  total_cout_revient_ht numeric not null default 0
    constraint estimations_total_cout_revient_ht_non_negatif
    check (total_cout_revient_ht >= 0),
  total_vente_ht numeric not null default 0
    constraint estimations_total_vente_ht_non_negatif
    check (total_vente_ht >= 0),
  total_tva numeric not null default 0
    constraint estimations_total_tva_non_negatif
    check (total_tva >= 0),
  total_vente_ttc numeric not null default 0
    constraint estimations_total_vente_ttc_non_negatif
    check (total_vente_ttc >= 0),
  -- Marges : peuvent être négatives (alerte « Marge négative à vérifier »).
  marge_brute_totale numeric not null default 0,
  taux_marge_global numeric not null default 0,
  commission_damien_ht numeric not null default 0
    constraint estimations_commission_damien_ht_non_negatif
    check (commission_damien_ht >= 0),
  prestation_clyve_ht numeric not null default 0
    constraint estimations_prestation_clyve_ht_non_negatif
    check (prestation_clyve_ht >= 0),
  -- Peut être négative après commission Damien et prestation Clyve.
  marge_estimee_apres_frais_ht numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.estimations is
  'Estimations commerciales internes (lignes catalogue, totaux, commission Damien, prestation Clyve). Liées à public.audits(id).';

comment on column public.estimations.audit_id is
  'UUID du dossier audit. FK vers public.audits(id) ON DELETE CASCADE. Unique : une estimation courante par audit.';

comment on column public.estimations.lignes_json is
  'Tableau JSON des lignes : id, posteId, nom, categorie, unite, description, quantite, coutMaterielUnitaireHt, coutMainOeuvreUnitaireHt, prixVenteUnitaireHt, tauxTva.';

-- Unique aussi en CREATE UNIQUE INDEX : s’applique si la table existait déjà
-- sans contrainte unique (CREATE TABLE IF NOT EXISTS ne la rajoute pas).
-- Échoue s’il existe déjà des doublons audit_id : les dédupliquer avant.
create unique index if not exists estimations_audit_id_uidx
  on public.estimations (audit_id);

-- ---------------------------------------------------------------------------
-- RLS — À AJOUTER après confirmation auth Supabase + propriétaire des audits :
--
-- alter table public.estimations enable row level security;
-- create policy ... using (auth.uid() = ...);
-- ---------------------------------------------------------------------------

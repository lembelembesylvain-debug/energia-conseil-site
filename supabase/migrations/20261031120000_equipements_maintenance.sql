-- Parc machines ENERGIA Sérénité — GMAO & maintenance préventive
-- À exécuter dans l'éditeur SQL Supabase (ou via la migration).

-- 1. Table du Parc Machines & Équipements
CREATE TABLE IF NOT EXISTS public.equipements_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  client_nom TEXT NOT NULL,
  client_telephone TEXT,
  client_email TEXT,
  client_adresse TEXT NOT NULL,
  client_ville TEXT NOT NULL,
  client_code_postal TEXT NOT NULL,
  type_equipement TEXT NOT NULL DEFAULT 'PAC Air/Eau', -- 'PAC Air/Eau', 'PAC Air/Air', 'Chauffe-Eau Thermo', 'Solaire'
  marque TEXT NOT NULL, -- 'Atlantic', 'Daikin', 'Mitsubishi', etc.
  modele TEXT,
  numero_serie TEXT,
  fluide_type TEXT DEFAULT 'R32', -- 'R32', 'R410A', 'R290'
  charge_kg NUMERIC(4,2),
  date_mise_en_service DATE,
  derniere_visite DATE,
  prochaine_visite DATE NOT NULL,
  statut_contrat TEXT DEFAULT 'actif', -- 'actif', 'en_attente', 'resilie', 'en_retard', 'a_planifier'
  formule TEXT DEFAULT 'Essentiel (19.90€/m)', -- 'Essentiel (19.90€/m)', 'Intégrale (24.90€/m)'
  montant_mensuel_ttc NUMERIC(6,2) DEFAULT 19.90,
  stripe_subscription_id TEXT,
  technicien_assigne TEXT,
  opportunites_travaux JSONB DEFAULT '{"isolation_combles": false, "menuiseries": false, "solaire_pv": false}'::jsonb
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_equipements_prochaine_visite ON public.equipements_maintenance(prochaine_visite);
CREATE INDEX IF NOT EXISTS idx_equipements_client_ville ON public.equipements_maintenance(client_ville);

ALTER TABLE public.equipements_maintenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipements_maintenance_select_crm" ON public.equipements_maintenance;
CREATE POLICY "equipements_maintenance_select_crm"
  ON public.equipements_maintenance FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "equipements_maintenance_insert_crm" ON public.equipements_maintenance;
CREATE POLICY "equipements_maintenance_insert_crm"
  ON public.equipements_maintenance FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "equipements_maintenance_update_crm" ON public.equipements_maintenance;
CREATE POLICY "equipements_maintenance_update_crm"
  ON public.equipements_maintenance FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.equipements_maintenance IS 'Parc PAC / solaire ENERGIA Sérénité — GMAO, échéances décret 2020-912, abonnement Stripe';

/** Identifiant d’audit ENERGIA — Monsieur Marjollet (dossier local, hors UUID Supabase). */
export const MARJOLLET_AUDIT_ID = "AUDIT-MARJOLLET-2026-001";

export const MARJOLLET_HREF = "/test-maison-marjollet";

export const MARJOLLET_IDENTITE = {
  nom: "Monsieur Marjollet",
  adresse: "85 rue des Bleuets, 42210 Montrond-les-Bains",
  ville: "Montrond-les-Bains (42)",
  departement: "Loire – 42",
  typeProjet:
    "Production photovoltaïque, stockage d’énergie, climatisation réversible, chauffage de piscine et recharge d’un véhicule électrique",
  statut: "Devis en attente de signature / Lead qualifié",
  factureElectrique: "environ 120 € par mois",
  apporteur: "Damien Richards",
  interlocuteur: "Sylvain Lembelembe",
  telephone: "+33 7 82 39 42 15",
  email: "rh.marjollet@gmail.com",
  date: "2026-09-04",
} as const;

/** Lignes commerciales du devis Marjollet — prix client uniquement, sans coûts internes. */
export const MARJOLLET_DEVIS_LIGNES = [
  { designation: "Photovoltaïque 9 kWc", quantite: 1, unite: "forfait" },
  { designation: "Batterie de stockage environ 10 kWh", quantite: 1, unite: "unite" },
  { designation: "Climatisation réversible air/air — 3 splits", quantite: 3, unite: "unite" },
  { designation: "PAC piscine Full Inverter", quantite: 1, unite: "unite" },
  { designation: "Borne de recharge environ 7,4 kW", quantite: 1, unite: "unite" },
  { designation: "Étude et accompagnement", quantite: 1, unite: "forfait" },
] as const;

export const MARJOLLET_DEVIS_TOTAL_TTC = 47520;
export const MARJOLLET_DEVIS_NUMERO = "DEVIS-MARJOLLET-2026-001";

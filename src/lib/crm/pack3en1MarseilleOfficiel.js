/**
 * Pack 3 en 1 Marseille — Autonomie totale (PAC + PV 6 kWc/batterie + ballon 500 L).
 * Réf. EC-2026-PACK3EN1-MARSEILLE-01 — marché ferme Contractant Général.
 */

export const PACK3EN1_MARSEILLE_DOSSIER_ID = "pack3en1-marseille-01";
export const PACK3EN1_MARSEILLE_REFERENCE = "EC-2026-PACK3EN1-MARSEILLE-01";
export const PACK3EN1_MARSEILLE_CONTRAT_NUMERO = "CONTRAT-2026-PACK3EN1-MARSEILLE-01";
export const PACK3EN1_MARSEILLE_CONTRAT_DATE = "2026-10-05";
export const PACK3EN1_MARSEILLE_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — PACK 3 EN 1 MARSEILLE — AUTONOMIE TOTALE";
export const NOM_FICHIER_CONTRAT_PACK3EN1_MARSEILLE = "CONTRAT_PACK3EN1_MARSEILLE_2026_FINAL.html";
export const CHEMIN_CONTRAT_PACK3EN1_MARSEILLE = `/${NOM_FICHIER_CONTRAT_PACK3EN1_MARSEILLE}`;

export const CLIENT_PACK3EN1_MARSEILLE = {
  raisonSociale: "Maison Individuelle — Marseille Sud",
  ville: "Marseille",
  codePostal: "13000",
  lieu: "Maison individuelle — Marseille (13000)",
  typeBien: "Maison individuelle",
  factureEdfAn: 3000,
};

export const TOTAUX_PACK3EN1_MARSEILLE = {
  totalHt: 37500,
  totalTva: 4000,
  totalTtc: 41500,
  tauxTva: 0.1066666667,
  coutsTravauxHt: 27700,
  commissionDamienHt: 0,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: 9800,
};

export const FINANCEMENT_PACK3EN1_MARSEILLE = {
  acompte: 12450,
  intermediaire: 16600,
  solde: 12450,
  resteACharge: 41500,
};

/** 3 lots techniques (+ détail CG) — montants HT figés. */
export const POSTES_PACK3EN1_MARSEILLE_CONTRAT = [
  {
    id: "pack3-lot-1-pac",
    ordreContractuel: 1,
    nom: "Lot 1 — PAC Air/Eau R32 Haute Température",
    specifications:
      "Remplacement radiateurs/chaudière par unité thermodynamique haute performance COP > 4,2",
    artisan: "RGE QualiPAC — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 14500,
    tauxTva: 0.055,
    totalHt: 14500,
    totalTva: 797.5,
    totalTtc: 15297.5,
    verrouillageOfficiel: true,
  },
  {
    id: "pack3-lot-2-pv-batterie",
    ordreContractuel: 2,
    nom: "Lot 2 — Photovoltaïque 6 kWc + Batterie de stockage 10 kWh",
    specifications:
      "12 modules bi-verre TOPCon 500 Wc · batterie Lithium LiFePO4 10 kWh (stockage jour → conso nuit)",
    artisan: "RGE QualiPV — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 18500,
    tauxTva: 0.2,
    totalHt: 18500,
    totalTva: 3700,
    totalTtc: 22200,
    verrouillageOfficiel: true,
  },
  {
    id: "pack3-lot-3-ballon",
    ordreContractuel: 3,
    nom: "Lot 3 — Ballon Thermodynamique 500 L",
    specifications:
      "Chauffe-eau thermodynamique grand volume — ECS ultra-économique",
    artisan: "RGE — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 4500,
    tauxTva: 0.055,
    totalHt: 4500,
    totalTva: 247.5,
    totalTtc: 4747.5,
    verrouillageOfficiel: true,
  },
];

export const MENTION_PACK3EN1_MARSEILLE =
  "Pack autonomie totale — facture EDF initiale 3 000 €/an · cible ~750 €/an (−75 %, économie nette ~2 250 €/an) · ROI indicatif 6,8 ans. Aides 2026 à titre indicatif.";

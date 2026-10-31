/**
 * Monsieur Zoulou — Rénovation globale Paris (75000) — DPE D → B/A, 250 m².
 * Total 84 500 € TTC · Aides ANAH/CEE 38 500 € · RAC 46 000 € TTC.
 */

export const ZOULOU_PARIS_DOSSIER_ID = "renovation-zoulou-paris-2026";
export const ZOULOU_PARIS_REFERENCE = "EC-2026-RENOV-ZOULOU-PARIS-01";
export const ZOULOU_PARIS_CONTRAT_NUMERO = "CONTRAT-2026-RENOV-ZOULOU-PARIS-01";
export const ZOULOU_PARIS_CONTRAT_DATE = "2026-10-05";
export const ZOULOU_PARIS_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — MONSIEUR ZOULOU — RÉNOVATION GLOBALE PARIS";
export const NOM_FICHIER_CONTRAT_ZOULOU_PARIS = "CONTRAT_RENOVATION_ZOULOU_PARIS_2026.html";
export const CHEMIN_CONTRAT_ZOULOU_PARIS = `/${NOM_FICHIER_CONTRAT_ZOULOU_PARIS}`;

export const CLIENT_ZOULOU_PARIS = {
  prenom: "Monsieur",
  nom: "Zoulou",
  identite: "Monsieur Zoulou",
  telephone: "06 70 80 90 01",
  ville: "Paris",
  codePostal: "75000",
  adresse: "Paris (75000) — Maison individuelle 250 m²",
  typeBien: "Maison individuelle 250 m² — DPE D → B/A — Profil Anah Jaune (Modeste) IDF",
};

export const TOTAUX_ZOULOU_PARIS = {
  totalHt: 80094.79,
  totalTva: 4405.21,
  totalTtc: 84500,
  tauxTva: 0.055,
  aidesAnahCee: 38500,
  resteACharge: 46000,
  coutsTravauxHt: 62000,
  commissionDamienHt: 0,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: 18094.79,
};

/** Échéancier 30/40/30 sur le reste à charge 46 000 € TTC. */
export const FINANCEMENT_ZOULOU_PARIS = {
  acompte: 13800,
  intermediaire: 18400,
  solde: 13800,
  resteACharge: 46000,
};

export const POSTES_ZOULOU_PARIS_CONTRAT = [
  {
    id: "zoulou-lot-1-combles",
    ordreContractuel: 1,
    nom: "Lot 1 — Isolation des combles perdus / aménagés R ≥ 7 (RT2012 / RE2020)",
    specifications: "Ouate de cellulose ou laine minérale ACERMI · R ≥ 7 · traitement ponts thermiques",
    artisan: "Artisan RGE Isolation — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 9500,
    tauxTva: 0.055,
    totalHt: 9500,
    totalTva: 522.5,
    totalTtc: 10022.5,
    verrouillageOfficiel: true,
  },
  {
    id: "zoulou-lot-2-ite",
    ordreContractuel: 2,
    nom: "Lot 2 — Isolation thermique par l’extérieur (ITE) murs R ≥ 3,7",
    specifications: "ITE PSE / fibre de bois · enduit · R ≥ 3,7 · façades maison 250 m²",
    artisan: "Artisan RGE ITE — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 26500,
    tauxTva: 0.055,
    totalHt: 26500,
    totalTva: 1457.5,
    totalTtc: 27957.5,
    verrouillageOfficiel: true,
  },
  {
    id: "zoulou-lot-3-menuiseries",
    ordreContractuel: 3,
    nom: "Lot 3 — Menuiseries PVC/Alu double vitrage Uw ≤ 1,3",
    specifications: "Remplacement menuiseries · Uw ≤ 1,3 · pose RGE · étanchéité air",
    artisan: "Artisan RGE Fenêtres — coordination ENERGIA",
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
    id: "zoulou-lot-4-vmc",
    ordreContractuel: 4,
    nom: "Lot 4 — VMC double flux rendement ≥ 85 %",
    specifications: "VMC DF haut rendement · réseaux · bouches · mise en service",
    artisan: "Artisan RGE Ventilation — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 7200,
    tauxTva: 0.055,
    totalHt: 7200,
    totalTva: 396,
    totalTtc: 7596,
    verrouillageOfficiel: true,
  },
  {
    id: "zoulou-lot-5-pac-solaire",
    ordreContractuel: 5,
    nom: "Lot 5 — PAC air/eau COP ≥ 4 + photovoltaïque d’appoint (post-isolation)",
    specifications:
      "PAC air/eau dimensionnée post-isolation · modules PV d’appoint · raccordements · Consuel",
    artisan: "Artisans RGE QualiPAC / QualiPV — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 22394.79,
    tauxTva: 0.055,
    totalHt: 22394.79,
    totalTva: 1231.71,
    totalTtc: 23626.5,
    verrouillageOfficiel: true,
  },
];

export const MENTION_ZOULOU_PARIS =
  "Aides financières 2026 (estimation à titre indicatif) : MaPrimeRénov’ + CEE 38 500 €. À valider selon revenus réels (profil Jaune IDF). Montants définitifs après instruction ANAH et CEE. Reste à charge net 46 000 € TTC.";

/**
 * Dossier Joël GESNOUIN — Stockage batterie Zendure SolarFlow 2400 AC (couplage AC).
 * Direct site web / email — TVA 20 % — 3 postes devis — 890 € HT / 1 068 € TTC.
 */

import {
  ETAPE_ANAH_AUDIT,
  SOURCE_APPORTEUR_DIRECT,
  STATUT_COMMISSION_EN_ATTENTE,
} from "./operationnelCrm.js";

export const GESNOUIN_DOSSIER_ID = "dossier-gesnouin-batterie-ac-2026";
export const GESNOUIN_CLIENT_ID = "CL-2026-14-GESNOUIN";
export const GESNOUIN_REFERENCE = "DEV-2026-ELEC-GESNOUIN-01";
export const GESNOUIN_CONTRAT_NUMERO = "DEV-2026-ELEC-GESNOUIN-01";
export const GESNOUIN_CONTRAT_DATE = "2026-10-08";
export const GESNOUIN_CONTRAT_TITRE =
  "DEVIS OFFICIEL — STOCKAGE BATTERIE ZENDURE SOLARFLOW 2400 AC (COUPLAGE AC) — GIBERVILLE";
export const NOM_FICHIER_CONTRAT_GESNOUIN = "DEVIS_GESNOUIN_BATTERIE_AC_2026_FINAL.html";
export const CHEMIN_CONTRAT_GESNOUIN = `/${NOM_FICHIER_CONTRAT_GESNOUIN}`;
export const CHEMIN_DEVIS_GESNOUIN_PDF = "/devis/gesnouin";

export const STATUT_GESNOUIN = "Devis Émis — En attente signature client";
export const PHASE_GESNOUIN = "Devis émis — attente signature";
export const CATEGORIE_GESNOUIN = "Électricité & Stockage Énergétique (Couplage AC)";
export const SOURCE_GESNOUIN = "Demande entrante site web / email direct";
export const TITRE_GESNOUIN =
  "Stockage batterie Zendure SolarFlow 2400 AC — Couplage AC (Giberville)";

export const CLIENT_GESNOUIN = {
  clientId: GESNOUIN_CLIENT_ID,
  civilite: "Monsieur",
  nom: "GESNOUIN",
  prenom: "Joël",
  libelleSignature: "Monsieur Joël GESNOUIN",
  telephone: "06 72 78 71 11",
  email: "joel.gesnouin@gmail.com",
  adresse: "9 bis rue des Carlettes, 14730 Giberville",
  ville: "Giberville",
  codePostal: "14730",
  departement: "14",
  region: "Normandie — Calvados",
  typeBien: "Maison individuelle — PV 3 kWc existant + EDF OA",
  typeProjet: TITRE_GESNOUIN,
  categorie: CATEGORIE_GESNOUIN,
  dateCreation: "2026-10-08",
};

export const EQUIPE_GESNOUIN = {
  commercial: "DAMIEN",
  direction: "Sylvain LEMBELEMBE",
  commercialApporteur: "Direct site web / email — sans commission apporteur",
  apporteur: "Direct ENERGIA CONSEIL IA®",
  artisanLocal: "Électricien RGE local — secteur Caen (14)",
};

export const DETAILS_TECHNIQUES_GESNOUIN = {
  equipement:
    "Zendure SolarFlow 2400 AC + 2 modules AB3000X (capacité 5,76 kWh, onduleur bidirectionnel 2,4 kW CA)",
  pvExistant: "3 kWc photovoltaïque — contrat actif EDF Obligation d'Achat (EDF OA)",
  couplage: "Couplage AC indépendant — sanctuarisation contrat EDF OA",
  norme: "NF C 15-100",
  resume:
    "Pose & raccordement NF C 15-100 du Zendure SolarFlow 2400 AC + 2× AB3000X (5,76 kWh) fournis par le client, sur PV 3 kWc existant avec EDF OA sanctuarisé.",
};

/** Vente client ferme — TVA 20 %. */
export const TOTAUX_GESNOUIN = {
  totalHt: 890,
  totalTva: 178,
  totalTtc: 1068,
  tauxTva: 0.2,
  coutsTravauxHt: 490,
  commissionDamienHt: 0,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: 400,
  margeBrutePct: 45,
};

/** Échéancier 30 % / 70 % sur 1 068 € TTC (pas de jalon 40 %). */
export const FINANCEMENT_GESNOUIN = {
  acompte: 320.4,
  intermediaire: 0,
  solde: 747.6,
  resteACharge: 1068,
};

export const POSTES_GESNOUIN_CONTRAT = [
  {
    id: "gesnouin-poste-1-visite-raccordement",
    ordreContractuel: 1,
    nom: "Visite technique de conformité & raccordement NF C 15-100 (Matériel batterie 5,76 kWh fourni par le client)",
    specifications:
      "Fixation sécurisée, raccordement couplage AC indépendant, zéro impact sur le contrat EDF OA.",
    artisan: EQUIPE_GESNOUIN.artisanLocal,
    quantite: 1,
    unite: "forfait",
    puHt: 550,
    tauxTva: 0.2,
    totalHt: 550,
    totalTva: 110,
    totalTtc: 660,
    verrouillageOfficiel: true,
  },
  {
    id: "gesnouin-poste-2-protections",
    ordreContractuel: 2,
    nom: "Fourniture & pose appareillage de protection au tableau général",
    specifications:
      "Disjoncteur différentiel 30 mA Type F / Hpi 20A, liaisons équipotentielles, goulotte conforme.",
    artisan: EQUIPE_GESNOUIN.artisanLocal,
    quantite: 1,
    unite: "forfait",
    puHt: 150,
    tauxTva: 0.2,
    totalHt: 150,
    totalTva: 30,
    totalTtc: 180,
    verrouillageOfficiel: true,
  },
  {
    id: "gesnouin-poste-3-tore-mise-en-service",
    ordreContractuel: 3,
    nom: "Intégration Tore de Mesure (Linky) & Mise en service application Zendure",
    specifications:
      "Pose du tore de mesure de flux CT, paramétrage du pilotage d'injection zéro/surplus, tests dynamiques et PV de mise en service.",
    artisan: EQUIPE_GESNOUIN.artisanLocal,
    quantite: 1,
    unite: "forfait",
    puHt: 190,
    tauxTva: 0.2,
    totalHt: 190,
    totalTva: 38,
    totalTtc: 228,
    verrouillageOfficiel: true,
  },
];

export const MENTION_HORS_MPR_GESNOUIN =
  "Prestation d'électricité / stockage AC — hors MaPrimeRénov’ Parcours. Aucune aide ANAH déduite. Matériel batterie fourni par le client. Reste à charge = montant TTC du devis.";

export const CLAUSE_EDF_OA_GESNOUIN =
  "Raccordement en couplage alternatif (AC-Coupled) indépendant préservant intégralement le contrat d'achat EDF Obligation d'Achat (EDF OA) du client.";

export function editionOfficielleGesnouin() {
  return {
    devisOfficiel: {
      numero: GESNOUIN_REFERENCE,
      date: GESNOUIN_CONTRAT_DATE,
      titre: GESNOUIN_CONTRAT_TITRE,
      validiteJours: 30,
    },
    financement: {
      ecoPtzMontant: 0,
      ecoPtzDuree: 15,
      apportPersonnel: FINANCEMENT_GESNOUIN.resteACharge,
      acompte: FINANCEMENT_GESNOUIN.acompte,
      intermediaire: FINANCEMENT_GESNOUIN.intermediaire,
      solde: FINANCEMENT_GESNOUIN.solde,
    },
    travaux: POSTES_GESNOUIN_CONTRAT.map((poste) => ({
      ...poste,
      familleId: "electricite",
      categorieId: "electricite",
      prestationId: poste.id,
    })),
    postesContractuels: POSTES_GESNOUIN_CONTRAT,
    lignes: POSTES_GESNOUIN_CONTRAT,
    travauxCoches: POSTES_GESNOUIN_CONTRAT,
    mentionsJuridiques: [MENTION_HORS_MPR_GESNOUIN, CLAUSE_EDF_OA_GESNOUIN],
    photos: { paires: [] },
  };
}

export function syntheseFinanciereGesnouin() {
  return { ...TOTAUX_GESNOUIN };
}

export function lotsGesnouinPourTravaux() {
  return POSTES_GESNOUIN_CONTRAT.map((poste) => ({
    id: poste.id,
    nom: poste.nom,
    quantite: poste.quantite,
    unite: poste.unite,
    prixVentePuHt: poste.puHt,
    coutAchatPuHt: 0,
    tauxTva: poste.tauxTva,
    postes: [poste.specifications],
    totalHt: poste.totalHt,
    totalTva: poste.totalTva,
    totalTtc: poste.totalTtc,
    coutAchatHt: 0,
    margeBruteHt: poste.totalHt,
    ordre: poste.ordreContractuel,
    ordreContractuel: poste.ordreContractuel,
    puHt: poste.puHt,
    specifications: poste.specifications,
    artisan: poste.artisan,
    categorieId: "electricite",
    verrouillageOfficiel: true,
  }));
}

export const PROJET_GESNOUIN_DEFAUT = {
  id: GESNOUIN_DOSSIER_ID,
  clientId: GESNOUIN_CLIENT_ID,
  nom: CLIENT_GESNOUIN.libelleSignature,
  prenom: CLIENT_GESNOUIN.prenom,
  ville: CLIENT_GESNOUIN.ville,
  codePostal: CLIENT_GESNOUIN.codePostal,
  adresse: CLIENT_GESNOUIN.adresse,
  telephone: CLIENT_GESNOUIN.telephone,
  email: CLIENT_GESNOUIN.email,
  rfr: null,
  statut: STATUT_GESNOUIN,
  phase: PHASE_GESNOUIN,
  priorite: "Normale — Devis émis",
  reference: GESNOUIN_REFERENCE,
  numeroAuditMar: GESNOUIN_REFERENCE,
  typeBien: CLIENT_GESNOUIN.typeBien,
  typeProjet: `${CATEGORIE_GESNOUIN} — ${TITRE_GESNOUIN}`,
  description: `${DETAILS_TECHNIQUES_GESNOUIN.resume} Budget artisan local Caen 14 : ${TOTAUX_GESNOUIN.coutsTravauxHt} € HT · Marge CG ENERGIA ${TOTAUX_GESNOUIN.margeNetteEnergiaHt} € HT (45 %).`,
  categorie: CATEGORIE_GESNOUIN,
  detailsTechniques: DETAILS_TECHNIQUES_GESNOUIN,
  source: "manuel",
  sourceLead: SOURCE_GESNOUIN,
  createdAt: CLIENT_GESNOUIN.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DIRECT,
  apporteurNom: EQUIPE_GESNOUIN.apporteur,
  etapeAnah: ETAPE_ANAH_AUDIT,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_GESNOUIN,
  equipe: EQUIPE_GESNOUIN,
  montantEstimeTtc: TOTAUX_GESNOUIN.totalTtc,
  montantHt: TOTAUX_GESNOUIN.totalHt,
  coutsTravauxHt: TOTAUX_GESNOUIN.coutsTravauxHt,
  commissionDamienHt: TOTAUX_GESNOUIN.commissionDamienHt,
  margeNetteEnergiaHt: TOTAUX_GESNOUIN.margeNetteEnergiaHt,
  travaux: lotsGesnouinPourTravaux(),
  postesContractuels: POSTES_GESNOUIN_CONTRAT,
  lignes: POSTES_GESNOUIN_CONTRAT,
  travauxCoches: POSTES_GESNOUIN_CONTRAT,
  syntheseFinanciere: syntheseFinanciereGesnouin(),
  margeDirectionHt: TOTAUX_GESNOUIN.margeNetteEnergiaHt,
  margeDirectionTtc: Math.round(TOTAUX_GESNOUIN.margeNetteEnergiaHt * 1.2 * 100) / 100,
  alertes: [
    "Devis émis — matériel Zendure fourni par le client. Sanctuarisation EDF OA obligatoire (couplage AC).",
  ],
};

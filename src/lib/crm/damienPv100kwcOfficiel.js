/**
 * Dossier Damien — Centrale PV 100 kWc hangar (Ardèche 07).
 * Apport Éco-Technicien BtoC — TVA 20 % — 5 postes contractuels fermes.
 */

import {
  ETAPE_ANAH_AUDIT,
  SOURCE_APPORTEUR_DAMIEN,
  STATUT_COMMISSION_EN_ATTENTE,
} from "./operationnelCrm.js";

export const DAMIEN_PV_100KWC_DOSSIER_ID = "damien-pv-100kwc-07";
export const DAMIEN_PV_100KWC_REFERENCE = "EC-2026-PV-100KWC-07";
export const DAMIEN_PV_100KWC_CONTRAT_NUMERO = "CONTRAT-2026-PV-100KWC-07";
export const DAMIEN_PV_100KWC_CONTRAT_DATE = "2026-10-05";
export const DAMIEN_PV_100KWC_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — CENTRALE SOLAIRE PHOTOVOLTAÏQUE 100 kWc — TOITURE HANGAR (ARDÈCHE 07)";
export const NOM_FICHIER_CONTRAT_DAMIEN_PV_100KWC = "CONTRAT_DAMIEN_PV_100KWC_HANGAR_2026_FINAL.html";
export const CHEMIN_CONTRAT_DAMIEN_PV_100KWC = `/${NOM_FICHIER_CONTRAT_DAMIEN_PV_100KWC}`;

export const STATUT_DAMIEN_PV_100KWC = "Nouveau / Étude de faisabilité & Raccordement Enedis";
export const PHASE_DAMIEN_PV_100KWC = "Étude de faisabilité & raccordement Enedis";
export const CATEGORIE_DAMIEN_PV_100KWC = "Photovoltaïque & Énergie";
export const SOURCE_DAMIEN_PV_100KWC = "Éco Technicien BtoC";

export const TITRE_DAMIEN_PV_100KWC = "Centrale Solaire Photovoltaïque 100 kWc — Toiture Hangar";

export const CLIENT_DAMIEN_PV_100KWC = {
  raisonSociale: "Exploitation Tertiaire / Agricole",
  lieu: "Département 07 — Ardèche",
  nom: "Exploitation Tertiaire / Agricole",
  intitule: TITRE_DAMIEN_PV_100KWC,
  telephone: "",
  typeBien: "Hangar agricole / tertiaire — toiture",
  typeProjet: TITRE_DAMIEN_PV_100KWC,
  categorie: CATEGORIE_DAMIEN_PV_100KWC,
  dateCreation: "2026-10-05",
  ville: "Ardèche (07)",
  codePostal: "07000",
  departement: "07",
  adresse: "Département 07 — Ardèche",
  libelleSignature: "Exploitation Tertiaire / Agricole",
};

export const EQUIPE_DAMIEN_PV_100KWC = {
  commercial: "Damien",
  direction: "Sylvain LEMBELEMBE",
  commercialApporteur: "Damien (Éco-Technicien BtoC) — Commission 3 500 € HT",
  apporteur: "Damien (Éco-Technicien BtoC)",
};

export const DETAILS_TECHNIQUES_DAMIEN_PV_100KWC = {
  panneaux: "200 panneaux 500 Wc TOPCon",
  onduleur: "Onduleur triphasé 100 kW",
  puissanceKwc: 100,
  productionEstimeeKwhAn: 125000,
  rentabiliteAns: 6.5,
  resume:
    "200 panneaux 500 Wc TOPCon, onduleur triphasé 100 kW, production estimée 125 000 kWh/an, rentabilité 6,5 ans.",
};

/** Vente client ferme — TVA 20 %. */
export const TOTAUX_DAMIEN_PV_100KWC = {
  totalHt: 89000,
  totalTva: 17800,
  totalTtc: 106800,
  tauxTva: 0.2,
  /** Coûts sous-traitance / matériel = vente − marge nette − commission apporteur. */
  coutsTravauxHt: 71000,
  commissionDamienHt: 3500,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: 14500,
};

/** Échéancier ferme 30 / 40 / 30 sur 106 800 € TTC. */
export const FINANCEMENT_DAMIEN_PV_100KWC = {
  acompte: 32040,
  intermediaire: 42720,
  solde: 32040,
  resteACharge: 106800,
};

/**
 * 5 postes contractuels — somme HT 89 000 / TVA 17 800 / TTC 106 800.
 * Alias exposés aussi sous postesContractuels / lignes / travauxCoches.
 */
export const POSTES_DAMIEN_PV_100KWC_CONTRAT = [
  {
    id: "damien-pv-poste-1-ingenierie",
    ordreContractuel: 1,
    nom: "Ingénierie, étude de charge toiture, Déclaration Préalable Mairie, dossier Enedis (PTF > 36 kVA) & Consuel Pro C15-712",
    specifications:
      "Étude de charge toiture · DP Mairie · dossier Enedis PTF > 36 kVA · Consuel Pro C15-712",
    artisan: "Bureau d'études / ENERGIA — coordination Sylvain LEMBELEMBE",
    quantite: 1,
    unite: "forfait",
    puHt: 8500,
    tauxTva: 0.2,
    totalHt: 8500,
    totalTva: 1700,
    totalTtc: 10200,
    verrouillageOfficiel: true,
  },
  {
    id: "damien-pv-poste-2-modules",
    ordreContractuel: 2,
    nom: "Fourniture de 200 modules solaires bi-verre 500 Wc N-Type TOPCon (rendement 22,5%, garantie 30 ans)",
    specifications: "200 × 500 Wc bi-verre N-Type TOPCon · rendement 22,5 % · garantie 30 ans",
    artisan: "Fourniture modules — filière QualiPV",
    quantite: 200,
    unite: "u",
    puHt: 197.5,
    tauxTva: 0.2,
    totalHt: 39500,
    totalTva: 7900,
    totalTtc: 47400,
    verrouillageOfficiel: true,
  },
  {
    id: "damien-pv-poste-3-onduleur",
    ordreContractuel: 3,
    nom: "Onduleur triphasé industriel 100 kW (Huawei / Sungrow) + coffrets de protection AC/DC C15-712-1 parafoudres et coupure pompier",
    specifications:
      "Onduleur triphasé 100 kW Huawei / Sungrow · coffrets AC/DC C15-712-1 · parafoudres · coupure pompier",
    artisan: "Fourniture onduleur & protections — QualiPV",
    quantite: 1,
    unite: "forfait",
    puHt: 16000,
    tauxTva: 0.2,
    totalHt: 16000,
    totalTva: 3200,
    totalTtc: 19200,
    verrouillageOfficiel: true,
  },
  {
    id: "damien-pv-poste-4-structure",
    ordreContractuel: 4,
    nom: "Système de surimposition toiture certifié ETN bac acier et câblage solaire cuivre double isolation UV",
    specifications: "Surimposition ETN bac acier · câblage cuivre double isolation UV",
    artisan: "Structure & câblage — équipe QualiPV",
    quantite: 1,
    unite: "forfait",
    puHt: 9000,
    tauxTva: 0.2,
    totalHt: 9000,
    totalTva: 1800,
    totalTtc: 10800,
    verrouillageOfficiel: true,
  },
  {
    id: "damien-pv-poste-5-pose",
    ordreContractuel: 5,
    nom: "Pose complète, levage nacelle, raccordement, mise en service et tests de conformité par équipe certifiée QualiPV 500",
    specifications:
      "Pose complète · levage nacelle · raccordement · mise en service · tests conformité QualiPV 500",
    artisan: "Équipe certifiée QualiPV 500 — coordination ENERGIA",
    quantite: 1,
    unite: "forfait",
    puHt: 16000,
    tauxTva: 0.2,
    totalHt: 16000,
    totalTva: 3200,
    totalTtc: 19200,
    verrouillageOfficiel: true,
  },
];

/** Alias demandés par le générateur / exports. */
export const postesContractuels = POSTES_DAMIEN_PV_100KWC_CONTRAT;
export const lignes = POSTES_DAMIEN_PV_100KWC_CONTRAT;
export const travauxCoches = POSTES_DAMIEN_PV_100KWC_CONTRAT;

export const MENTION_HORS_MPR_DAMIEN_PV_100KWC =
  "Centrale photovoltaïque 100 kWc toiture hangar — marché professionnel TVA 20 %. Hors MaPrimeRénov’ Parcours résidentiel. Aucune aide ANAH déduite. Reste à charge client = montant ferme TTC du marché.";

export function editionOfficielleDamienPv100kwc() {
  return {
    client: {
      nom: CLIENT_DAMIEN_PV_100KWC.raisonSociale,
      prenom: "",
      telephone: CLIENT_DAMIEN_PV_100KWC.telephone,
      email: "",
      adresse: CLIENT_DAMIEN_PV_100KWC.lieu,
      adresseChantier: CLIENT_DAMIEN_PV_100KWC.lieu,
      surfaceHabitable: "",
      statutOccupation: "professionnel",
    },
    devisOfficiel: {
      numero: DAMIEN_PV_100KWC_CONTRAT_NUMERO,
      date: DAMIEN_PV_100KWC_CONTRAT_DATE,
      reference: DAMIEN_PV_100KWC_REFERENCE,
    },
    verrouillageOfficiel: true,
    aides: {
      profil: "",
      parcours: "",
      rfr: 0,
      parts: 0,
      gainClasses: 0,
      verrouillageOfficiel: true,
    },
    financement: {
      ecoPtzMontant: 0,
      ecoPtzDuree: 15,
      apportPersonnel: FINANCEMENT_DAMIEN_PV_100KWC.resteACharge,
      acompte: FINANCEMENT_DAMIEN_PV_100KWC.acompte,
      intermediaire: FINANCEMENT_DAMIEN_PV_100KWC.intermediaire,
      solde: FINANCEMENT_DAMIEN_PV_100KWC.solde,
    },
    travaux: POSTES_DAMIEN_PV_100KWC_CONTRAT.map((poste) => ({
      ...poste,
      familleId: "photovoltaique-energie",
      categorieId: "photovoltaique-energie",
      prestationId: poste.id,
    })),
    postesContractuels: POSTES_DAMIEN_PV_100KWC_CONTRAT,
    lignes: POSTES_DAMIEN_PV_100KWC_CONTRAT,
    travauxCoches: POSTES_DAMIEN_PV_100KWC_CONTRAT,
    mentionsJuridiques: [MENTION_HORS_MPR_DAMIEN_PV_100KWC],
    photos: { paires: [] },
  };
}

export function syntheseFinanciereDamienPv100kwc() {
  return { ...TOTAUX_DAMIEN_PV_100KWC };
}

export function lotsDamienPv100kwcPourTravaux() {
  return POSTES_DAMIEN_PV_100KWC_CONTRAT.map((poste) => ({
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
    categorieId: "photovoltaique-energie",
    verrouillageOfficiel: true,
  }));
}

export const PROJET_DAMIEN_PV_100KWC_DEFAUT = {
  id: DAMIEN_PV_100KWC_DOSSIER_ID,
  nom: TITRE_DAMIEN_PV_100KWC,
  prenom: "",
  ville: CLIENT_DAMIEN_PV_100KWC.ville,
  codePostal: CLIENT_DAMIEN_PV_100KWC.codePostal,
  adresse: CLIENT_DAMIEN_PV_100KWC.lieu,
  telephone: CLIENT_DAMIEN_PV_100KWC.telephone,
  email: "",
  rfr: null,
  statut: STATUT_DAMIEN_PV_100KWC,
  phase: PHASE_DAMIEN_PV_100KWC,
  priorite: "Haute — Étude faisabilité & raccordement Enedis",
  reference: DAMIEN_PV_100KWC_REFERENCE,
  numeroAuditMar: DAMIEN_PV_100KWC_REFERENCE,
  typeBien: CLIENT_DAMIEN_PV_100KWC.typeBien,
  typeProjet: `${CATEGORIE_DAMIEN_PV_100KWC} — ${TITRE_DAMIEN_PV_100KWC}`,
  description: `${CLIENT_DAMIEN_PV_100KWC.raisonSociale} — ${CLIENT_DAMIEN_PV_100KWC.lieu}. ${DETAILS_TECHNIQUES_DAMIEN_PV_100KWC.resume}`,
  categorie: CATEGORIE_DAMIEN_PV_100KWC,
  detailsTechniques: DETAILS_TECHNIQUES_DAMIEN_PV_100KWC,
  source: "manuel",
  sourceLead: SOURCE_DAMIEN_PV_100KWC,
  createdAt: CLIENT_DAMIEN_PV_100KWC.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: EQUIPE_DAMIEN_PV_100KWC.apporteur,
  etapeAnah: ETAPE_ANAH_AUDIT,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_DAMIEN_PV_100KWC,
  equipe: EQUIPE_DAMIEN_PV_100KWC,
  montantEstimeTtc: TOTAUX_DAMIEN_PV_100KWC.totalTtc,
  montantHt: TOTAUX_DAMIEN_PV_100KWC.totalHt,
  coutsTravauxHt: TOTAUX_DAMIEN_PV_100KWC.coutsTravauxHt,
  commissionDamienHt: TOTAUX_DAMIEN_PV_100KWC.commissionDamienHt,
  margeNetteEnergiaHt: TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt,
  travaux: lotsDamienPv100kwcPourTravaux(),
  postesContractuels: POSTES_DAMIEN_PV_100KWC_CONTRAT,
  lignes: POSTES_DAMIEN_PV_100KWC_CONTRAT,
  travauxCoches: POSTES_DAMIEN_PV_100KWC_CONTRAT,
  syntheseFinanciere: syntheseFinanciereDamienPv100kwc(),
  margeDirectionHt: TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt,
  margeDirectionTtc: Math.round(TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt * 1.2 * 100) / 100,
  alertes: [
    "Étude de faisabilité & raccordement Enedis à lancer — apport Damien (Éco-Technicien BtoC), commission 3 500 € HT.",
  ],
};

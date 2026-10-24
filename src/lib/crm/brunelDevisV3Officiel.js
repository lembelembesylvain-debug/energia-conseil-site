import { HONORAIRES_HUB_ADMIN_HT } from "./operationnelCrm.js";

/**
 * Contrat de Contractant Général FINAL — CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL.
 * Devis façade N° EC-2026-BRUNEL-FACADE-V1 du 18/09/2026.
 * TVA 5,5 % au centime près. 35 742,41 € HT / 1 965,83 € TVA / 37 708,24 € TTC.
 */

export const BRUNEL_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — MARCHÉ DE RÉNOVATION GLOBALE CLÉ EN MAIN";
export const BRUNEL_V3_NUMERO = "CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL";
export const BRUNEL_FINAL_NUMERO = BRUNEL_V3_NUMERO;
export const BRUNEL_V3_DATE = "2026-09-19";
export const FICHIER_DEVIS_BRUNEL_FINAL = "DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html";
export const CHEMIN_DEVIS_BRUNEL_FINAL = `/${FICHIER_DEVIS_BRUNEL_FINAL}`;

export const DEVIS_FACADE_NUMERO = "EC-2026-BRUNEL-FACADE-V1";
export const DEVIS_FACADE_DATE = "2026-09-18";

export const STATUT_DOSSIER_BRUNEL_V3 =
  "Devis V3 Contractant Général validé, en attente signature indivision et acompte";

/** Dossier CRM officiel V4 — marché 19/09/2026, porte d’entrée 1 950 € HT. */
export const STATUT_DOSSIER_BRUNEL_V4 =
  "Contrat Contractant Général validé — En attente signature indivision";
export const EMAIL_CLIENT_BRUNEL = "brunelemrick@gmail.com";
export const BRUNEL_V4_DATE = "2026-09-19";
export const BRUNEL_V4_VERSION = "V4";

export const NOTE_DEVIS_FACADE_V1 =
  "Devis façade N° EC-2026-BRUNEL-FACADE-V1 du 18/09/2026 — Lot 1 éligible (sous-ensemble façade & menuiseries, postes 2 à 4) : 11 300,00 € HT | TVA 5,5 % : 621,50 € | 11 921,50 € TTC. 4 fenêtres double vitrage RAL 7016 sablé + volets roulants motorisés (2 600,00 € HT), ensemble baie vitrée (ouverture mur porteur IPN 2 800,00 € HT + baie alu 215×240 RAL 7016 2 950,00 € HT + condamnation fenêtre intermédiaire 450,00 € HT) et porte d’entrée Ud ≤ 1,4.";

export const NOTE_PORTE_SERVICE_HORS_MARCHE =
  "LOT 2 — HORS SUBVENTION (non compris dans les aides de l’enveloppe chauffée) : Fourniture et pose Porte d’accès Local Technique / Garage RAL 7016 (panneau isolé, serrure multipoints) : 980,00 € HT | TVA 10,0 % : 98,00 € | 1 078,00 € TTC à la charge directe exclusive de M. Brunel.";

export const CADRE_JURIDIQUE_INDIVISION_815 =
  "Indivision (Article 815 du Code Civil — signature unanime obligatoire)";

export const CLAUSE_INDIVISION_COUBLE_815 =
  "Indivision COUBLE — Article 815 du Code Civil : accord unanime et signature obligatoire de TOUS les indivisaires sous peine de nullité du contrat et des aides";

export const ALERTE_INDIVISION_COUBLE_815 =
  "⚠️ INDIVISION COUBLE — Article 815 du Code Civil : Bien en indivision = plusieurs copropriétaires. TOUS les indivisaires doivent obligatoirement signer le présent contrat et la demande d'aides. Accord unanime obligatoire sous peine de nullité du contrat et des aides.";

export const PRESTATAIRE_ENERGIA = {
  nom: "ENERGIA-CONSEIL IA®",
  forme: "SASU au capital de 100 €",
  adresse: "16 Rue Cuvier, 69006 Lyon",
  siret: "94181942700019",
  rcs: "Lyon 941819427",
  tva: "FR01941819427",
  inpi: "5213845",
  assuranceDecennale: "Calipso Assurances n° LUNPIB2604975",
  representant: "Sylvain LEMBELEMBE",
  telephone: "06 10 59 68 98",
  email: "contact@energia-conseil-ia.com",
};

export const COORDINATION_ENERGIA = {
  nom: "ENERGIA-CONSEIL IA®",
  role: "Direction & Contractant Général",
  coordination: "Sylvain LEMBELEMBE",
};

export const COMBLES_V3_ID = "v3-poste-1-combles";
export const COMBLES_PU_HT = 41.68;
export const COMBLES_QTE_DEFAUT = 100;
export const COMBLES_QTE_OFFICIELLE = 100;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function calculerPosteCombles(quantite) {
  const q = Math.max(0, Number(quantite) || 0);
  const totalHt = round2(q * COMBLES_PU_HT);
  const totalTva = round2(totalHt * 0.055);
  return {
    quantite: q,
    puHt: COMBLES_PU_HT,
    tauxTva: 0.055,
    totalHt,
    totalTva,
    totalTtc: round2(totalHt + totalTva),
  };
}

export function appliquerQuantiteComblesV3(travaux, quantite = COMBLES_QTE_OFFICIELLE) {
  const calcule = calculerPosteCombles(quantite);
  return (travaux || []).map((ligne) => {
    if (ligne?.id !== COMBLES_V3_ID && !ligne?.quantiteFlexible) return ligne;
    return { ...ligne, ...calcule, quantiteFlexible: false, verrouillageOfficiel: true };
  });
}

export const CLIENT_BRUNEL_V3 = {
  nom: "BRUNEL",
  prenom: "Emrick",
  mandant: "Indivision COUBLE",
  cadreJuridique: CADRE_JURIDIQUE_INDIVISION_815,
  telephone: "06 50 26 31 83",
  email: EMAIL_CLIENT_BRUNEL,
  adresse: "48 Impasse des Lagunes, 42510 BUSSIÈRES",
  adresseChantier: "48 Impasse des Lagunes, 42510 BUSSIÈRES",
  adresseDomicile: "111 Rue Poliacus, 42110 POUILLY-LÈS-FEURS",
  ville: "BUSSIÈRES",
  codePostal: "42510",
  anneeConstruction: "",
  surfaceHabitable: "72",
  statutOccupation: "proprietaire_occupant",
  statutDossier: STATUT_DOSSIER_BRUNEL_V3,
};

export const TOTAUX_FACADE_BRUNEL = {
  totalHt: 11300,
  totalTva: 621.5,
  totalTtc: 11921.5,
};

export const TOTAUX_BRUNEL_V3 = {
  totalHt: 35742.41,
  totalTva: 1965.83,
  totalTtc: 37708.24,
};

/** Marché V4 au centime près : porte d’entrée 1 950 € HT (Δ −550 € vs V3). */
export const TOTAUX_BRUNEL_V4 = {
  totalHt: 35192.41,
  totalTva: 1935.58,
  totalTtc: 37127.99,
};

export const MARGE_NETTE_DIRECTION_BRUNEL = {
  ht: 5200,
  tva: 286,
  ttc: 5486,
};

export const PORTE_ENTREE_V4_HT = 1950;

export const AIDES_BRUNEL_V3 = {
  mpr: 21445,
  cee: 4875,
  locales: 1500,
  mar: 1600,
  coupDePouce: 0,
  totalAides: 29420,
  resteACharge: 8288.24,
  libelleMpr: "MaPrimeRénov’ Parcours Accompagné (Profil Jaune 60 %)",
  libelleCee: "Prime CEE Chauffage",
  libelleLocales: "Aide Régionale Auvergne-Rhône-Alpes",
  libelleMar: "Prise en charge prestation MAR",
};

export const AIDES_BRUNEL_V4 = {
  ...AIDES_BRUNEL_V3,
  resteACharge: 7707.99,
};

export const TOTAUX_FACADE_BRUNEL_V4 = {
  totalHt: 10750,
  totalTva: 591.25,
  totalTtc: 11341.25,
};

export const FINANCEMENT_BRUNEL_V3 = {
  ecoPtzMontant: 8288.24,
  ecoPtzDuree: 20,
  mensualite: 35,
  mensualiteExacte: 34.53,
  economiesMensuelles: 150,
  bilanNetMensuel: 115.47,
  acomptePct: 0.3,
  acompte: 11312.47,
  intermediairePct: 0.4,
  intermediaire: 15083.3,
  soldePct: 0.3,
  solde: 11312.47,
  apportPersonnel: 0,
};

/** Échéancier 30/40/30 V4 sur 37 127,99 € TTC (11 138,40 + 14 851,20 + 11 138,39). */
export const FINANCEMENT_BRUNEL_V4 = {
  ecoPtzMontant: 7707.99,
  ecoPtzDuree: 20,
  mensualite: 32,
  mensualiteExacte: 32.12,
  economiesMensuelles: 150,
  bilanNetMensuel: 117.88,
  acomptePct: 0.3,
  acompte: 11138.4,
  intermediairePct: 0.4,
  intermediaire: 14851.2,
  soldePct: 0.3,
  solde: 11138.39,
  apportPersonnel: 0,
};

export const POSTE_HORS_SUBVENTION_BRUNEL = {
  id: "v3-poste-lot2-porte-garage",
  familleId: "menuiseries",
  nom: "Fourniture et pose Porte d’accès Local Technique / Garage RAL 7016",
  specifications:
    "Panneau isolé, serrure multipoints. Hors subvention — hors enveloppe chauffée — charge directe exclusive de M. Brunel. Non compris dans les totaux du marché de rénovation globale ni dans l’échéancier 30/40/30.",
  artisan: "Bonheur d'Amarante (RGE)",
  quantite: 1,
  unite: "u",
  puHt: 980,
  tauxTva: 0.1,
  totalHt: 980,
  totalTva: 98,
  totalTtc: 1078,
  horsSubvention: true,
  lot: 2,
};

export const COMPOSANTS_POSTE_3_BAIE = [
  { libelle: "Création d’ouverture mur porteur moellons avec linteau acier IPN/HEB", ht: 2800 },
  {
    libelle: "Fourniture/pose Baie Vitrée coulissante alu 215×240 RAL 7016 motorisée",
    ht: 2950,
  },
  { libelle: "Condamnation et rebouchage maçonné ancienne fenêtre intermédiaire", ht: 450 },
];

export const POSTES_BRUNEL_V3 = [
  {
    id: COMBLES_V3_ID,
    familleId: "isolation",
    nom: "Isolation combles soufflage laine de roche 300 mm R=7,0 (100 m² verrouillés)",
    specifications: "Laine de roche soufflée 300 mm (R = 7,0), pare-vapeur, étanchéité — 100 m² verrouillés — C2L (RGE)",
    artisan: "C2L (RGE)",
    unite: "m²",
    quantiteFlexible: false,
    ...calculerPosteCombles(COMBLES_QTE_OFFICIELLE),
    ordreThermique: 1,
    ordreContractuel: "1",
  },
  {
    id: "v3-poste-2-fenetres-pvc",
    familleId: "menuiseries",
    nom: "4 Fenêtres double vitrage RAL 7016 sablé + volets roulants motorisés",
    specifications: `Devis façade N° ${DEVIS_FACADE_NUMERO} du 18/09/2026 (Ligne 1.4). Profilés alu/PVC haute isolation, Uw ≤ 1,3 W/m².K, Sw ≥ 0,40, volets roulants motorisés intégrés, teinte gris anthracite RAL 7016 — Bonheur d'Amarante (RGE)`,
    artisan: "Bonheur d'Amarante (RGE)",
    quantite: 4,
    unite: "u",
    puHt: 650,
    tauxTva: 0.055,
    totalHt: 2600,
    totalTva: 143,
    totalTtc: 2743,
    ordreThermique: 4,
    ordreContractuel: "2",
  },
  {
    id: "v3-poste-3-ensemble-baie",
    familleId: "menuiseries",
    nom: "Ensemble Baie Vitrée coulissante alu 215×240 RAL 7016 avec linteau acier IPN et condamnation",
    specifications: `Devis façade N° ${DEVIS_FACADE_NUMERO} (Lignes 1.1 + 1.2 + 1.3). Création d'ouverture mur porteur moellons avec linteau acier IPN/HEB (2 800,00 € HT) + fourniture/pose baie vitrée alu 215×240 motorisée (2 950,00 € HT) + condamnation et rebouchage maçonné ancienne fenêtre intermédiaire (450,00 € HT) — Bonheur d'Amarante (RGE)`,
    artisan: "Bonheur d'Amarante (RGE)",
    quantite: 1,
    unite: "lot",
    puHt: 6200,
    tauxTva: 0.055,
    totalHt: 6200,
    totalTva: 341,
    totalTtc: 6541,
    ordreThermique: 4,
    ordreContractuel: "3",
  },
  {
    id: "v3-poste-4-porte-entree",
    familleId: "menuiseries",
    nom: "Porte d’entrée principale haute performance isolée Ud ≤ 1,4 serrure A2P*",
    specifications: `Devis façade N° ${DEVIS_FACADE_NUMERO} du 18/09/2026. Ud ≤ 1,4, serrure A2P*. La porte de service garage / local technique est prise en charge directe par M. Brunel hors marché.`,
    artisan: "Bonheur d'Amarante (RGE)",
    quantite: 1,
    unite: "u",
    puHt: 2500,
    tauxTva: 0.055,
    totalHt: 2500,
    totalTva: 137.5,
    totalTtc: 2637.5,
    ordreThermique: 4,
    ordreContractuel: "4",
  },
  {
    id: "v3-poste-5-vmc",
    familleId: "ventilation",
    nom: "VMC simple flux hygroréglable 72 m²",
    specifications: "Débit adapté 72 m², gaines isolées + bouches hygro",
    artisan: "SMN Énergies (RGE)",
    quantite: 1,
    unite: "lot",
    puHt: 1500,
    tauxTva: 0.055,
    totalHt: 1500,
    totalTva: 82.5,
    totalTtc: 1582.5,
    ordreThermique: 5,
    ordreContractuel: "5",
  },
  {
    id: "v3-poste-6-pac",
    familleId: "chauffage",
    nom: "5 Splits PAC Air/Air réversibles multi-split inverter GAMME PREMIUM HAUTE PERFORMANCE (Daikin / Mitsubishi Electric — compresseur haute efficacité SCOP A+++, ultra-silencieux 19 dB, filtration d’air active, design contemporain, télécommandes individuelles)",
    specifications: "Gamme Premium haute performance — dimensionnement post-isolation",
    artisan: "SMN Énergies (RGE)",
    quantite: 5,
    unite: "u",
    puHt: 2274.88,
    tauxTva: 0.055,
    totalHt: 11374.41,
    totalTva: 625.59,
    totalTtc: 12000,
    ordreThermique: 6,
    ordreContractuel: "6",
  },
  {
    id: "v3-poste-7-cet",
    familleId: "ecs",
    nom: "Ballon thermodynamique 200 L COP >= 3,5",
    specifications: "COP ≥ 3,5, Thermor / Atlantic, remplacement cumulus 100 L",
    artisan: "SMN Énergies (RGE)",
    quantite: 1,
    unite: "u",
    puHt: 2200,
    tauxTva: 0.055,
    totalHt: 2200,
    totalTva: 121,
    totalTtc: 2321,
    ordreThermique: 7,
    ordreContractuel: "7",
  },
  {
    id: "v3-poste-8-coordination",
    familleId: "",
    nom: "Pilotage, Direction Contractant Général & Suivi de chantier — Sylvain LEMBELEMBE (ENERGIA-CONSEIL IA®)",
    specifications: "Pilotage Sylvain LEMBELEMBE, direction Contractant Général, coordination artisans RGE et suivi de chantier",
    artisan: "ENERGIA-CONSEIL IA®",
    quantite: 1,
    unite: "lot",
    puHt: 5200,
    tauxTva: 0.055,
    totalHt: 5200,
    totalTva: 286,
    totalTtc: 5486,
    ordreThermique: 9,
    ordreContractuel: "8",
  },
];

export function lignesTravauxBrunelV3(quantiteCombles = COMBLES_QTE_OFFICIELLE) {
  return appliquerQuantiteComblesV3(
    POSTES_BRUNEL_V3.map((poste) => ({
      ...poste,
      verrouillageOfficiel: true,
      quantiteFlexible: false,
      sourcePrix: "devis-final-officiel",
      prestationId: poste.id,
    })),
    COMBLES_QTE_OFFICIELLE,
  );
}

export function editionOfficielleBrunelV3() {
  return {
    version: 1,
    verrouillageOfficiel: true,
    devisOfficiel: {
      numero: BRUNEL_FINAL_NUMERO,
      date: BRUNEL_V3_DATE,
      validite: "3 mois",
      duplicata: false,
      version: "FINAL",
      surfaceComblesM2: COMBLES_QTE_OFFICIELLE,
      devisFacade: {
        numero: DEVIS_FACADE_NUMERO,
        date: DEVIS_FACADE_DATE,
        totaux: TOTAUX_FACADE_BRUNEL,
      },
    },
    client: { ...CLIENT_BRUNEL_V3 },
    travaux: lignesTravauxBrunelV3(),
    horsSubvention: { ...POSTE_HORS_SUBVENTION_BRUNEL },
    aides: {
      profil: "jaune",
      parcours: "parcours",
      gainClasses: 2,
      region: "AURA",
      verrouillageOfficiel: true,
      rfr: 20216,
      overrides: {
        mpr: AIDES_BRUNEL_V3.mpr,
        cee: AIDES_BRUNEL_V3.cee,
        locales: AIDES_BRUNEL_V3.locales,
        mar: AIDES_BRUNEL_V3.mar,
        coupDePouce: 0,
      },
    },
    financement: {
      ecoPtzMontant: FINANCEMENT_BRUNEL_V3.ecoPtzMontant,
      ecoPtzDuree: FINANCEMENT_BRUNEL_V3.ecoPtzDuree,
      apportPersonnel: FINANCEMENT_BRUNEL_V3.apportPersonnel,
      acompte: FINANCEMENT_BRUNEL_V3.acompte,
      intermediaire: FINANCEMENT_BRUNEL_V3.intermediaire,
      solde: FINANCEMENT_BRUNEL_V3.solde,
    },
    mentionsJuridiques: [
      CLAUSE_INDIVISION_COUBLE_815,
      ALERTE_INDIVISION_COUBLE_815,
      NOTE_DEVIS_FACADE_V1,
      NOTE_PORTE_SERVICE_HORS_MARCHE,
    ],
    prestataire: PRESTATAIRE_ENERGIA,
    mar: COORDINATION_ENERGIA,
    finances: {
      coutClyveHt: HONORAIRES_HUB_ADMIN_HT,
    },
    valorisation: {
      prixM2Constate: null,
      dpeActuel: "F",
      dpeCible: "D",
      dpeReference: "2442E2720555M",
    },
  };
}

export function totauxContractuelsBrunelV3() {
  const lignes = lignesTravauxBrunelV3();
  return {
    lignes,
    totalHt: round2(lignes.reduce((s, l) => s + l.totalHt, 0)),
    totalTva: round2(lignes.reduce((s, l) => s + l.totalTva, 0)),
    totalTtc: round2(lignes.reduce((s, l) => s + l.totalTtc, 0)),
  };
}

const PATCHES_POSTES_BRUNEL_V4 = {
  "v3-poste-2-fenetres-pvc": {
    nom: "4 Fenêtres double vitrage RAL 7016 sablé motorisées (Bonheur d'Amarante)",
  },
  "v3-poste-3-ensemble-baie": {
    nom: "Ensemble Baie Vitrée 215x240 avec ouverture linteau IPN et rebouchage (Bonheur d'Amarante)",
  },
  "v3-poste-4-porte-entree": {
    nom: "Porte d'entrée principale haute performance Ud <= 1,4 (Bonheur d'Amarante)",
    puHt: PORTE_ENTREE_V4_HT,
    totalHt: PORTE_ENTREE_V4_HT,
    totalTva: round2(PORTE_ENTREE_V4_HT * 0.055),
    totalTtc: round2(PORTE_ENTREE_V4_HT * 1.055),
  },
  "v3-poste-5-vmc": {
    nom: "VMC hygro 72 m² (SMN)",
  },
  "v3-poste-6-pac": {
    nom: "5 Splits PAC Air/Air Daikin Premium A+++ 19 dB (SMN)",
  },
  "v3-poste-7-cet": {
    nom: "Ballon thermodynamique 200 L (SMN)",
  },
  "v3-poste-8-coordination": {
    nom: "Direction & Pilotage Contractant Général (Sylvain LEMBELEMBE - ENERGIA)",
  },
};

export function lignesTravauxBrunelV4() {
  return lignesTravauxBrunelV3().map((ligne) => {
    const patch = PATCHES_POSTES_BRUNEL_V4[ligne.id];
    if (!patch) {
      return { ...ligne, sourcePrix: "devis-v4-officiel", versionOfficielle: BRUNEL_V4_VERSION };
    }
    return {
      ...ligne,
      ...patch,
      sourcePrix: "devis-v4-officiel",
      versionOfficielle: BRUNEL_V4_VERSION,
    };
  });
}

export function totauxContractuelsBrunelV4() {
  const lignes = lignesTravauxBrunelV4();
  return {
    lignes,
    totalHt: round2(lignes.reduce((s, l) => s + l.totalHt, 0)),
    totalTva: round2(lignes.reduce((s, l) => s + l.totalTva, 0)),
    totalTtc: round2(lignes.reduce((s, l) => s + l.totalTtc, 0)),
  };
}

export function editionOfficielleBrunelV4() {
  const v3 = editionOfficielleBrunelV3();
  return {
    ...v3,
    version: BRUNEL_V4_VERSION,
    verrouillageOfficiel: true,
    devisOfficiel: {
      ...v3.devisOfficiel,
      date: BRUNEL_V4_DATE,
      version: BRUNEL_V4_VERSION,
      devisFacade: {
        ...v3.devisOfficiel.devisFacade,
        totaux: TOTAUX_FACADE_BRUNEL_V4,
      },
    },
    client: {
      ...v3.client,
      statutDossier: STATUT_DOSSIER_BRUNEL_V4,
    },
    travaux: lignesTravauxBrunelV4(),
    aides: {
      ...v3.aides,
    },
    financement: {
      ecoPtzMontant: FINANCEMENT_BRUNEL_V4.ecoPtzMontant,
      ecoPtzDuree: FINANCEMENT_BRUNEL_V4.ecoPtzDuree,
      apportPersonnel: FINANCEMENT_BRUNEL_V4.apportPersonnel,
      acompte: FINANCEMENT_BRUNEL_V4.acompte,
      intermediaire: FINANCEMENT_BRUNEL_V4.intermediaire,
      solde: FINANCEMENT_BRUNEL_V4.solde,
    },
    finances: {
      ...v3.finances,
      margeDirectionHt: MARGE_NETTE_DIRECTION_BRUNEL.ht,
      margeDirectionTtc: MARGE_NETTE_DIRECTION_BRUNEL.ttc,
    },
  };
}

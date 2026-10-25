/**
 * Contrat de Contractant Général — David Emmanuel PEREIRA, Nervieux (42).
 * Panier sans ITI, sans Velux, sans rampants. Marché de travaux de Contractant Général du 26/10/2026.
 * Fiscalité : avis d’imposition 2025 (situation 2026) — RFR 27 522 €, 1 part, province.
 * Distinct du fixture de test `demo-pereira` (ne pas fusionner).
 */

import {
  COORDINATION_ENERGIA,
  PRESTATAIRE_ENERGIA,
} from "./brunelDevisV3Officiel.js";
import {
  ETAPE_ANAH_VALIDATION_MAR,
  HONORAIRES_HUB_ADMIN_HT,
  SOURCE_APPORTEUR_DIRECT,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export { PRESTATAIRE_ENERGIA };

export const PEREIRA_NERVIEUX_DOSSIER_ID = "projet-manuel-pereira-nervieux";
export const PEREIRA_NERVIEUX_NUMERO = "DEV-2026-PEREIRA-01";
export const PEREIRA_NERVIEUX_DATE = "2026-10-26";
export const PEREIRA_NERVIEUX_DATE_VISITE = "2026-09-03";
export const PEREIRA_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — MARCHÉ DE RÉNOVATION GLOBALE CLÉ EN MAIN";
export const PEREIRA_NERVIEUX_TITRE = PEREIRA_CONTRAT_TITRE;
export const FICHIER_DEVIS_PEREIRA_NERVIEUX = "DEVIS_PEREIRA_NERVIEUX_2026_FINAL.html";
export const CHEMIN_DEVIS_PEREIRA_NERVIEUX = `/${FICHIER_DEVIS_PEREIRA_NERVIEUX}`;
export const FICHIER_RAPPORT_PEREIRA_NERVIEUX = "RAPPORT_TECHNIQUE_PEREIRA_NERVIEUX_2026.html";
export const CHEMIN_RAPPORT_PEREIRA_NERVIEUX = `/${FICHIER_RAPPORT_PEREIRA_NERVIEUX}`;
export const FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX = "client-pereira-nervieux-sans-iti.json";
export const FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX_CALCULE = "client-pereira-nervieux-calcule.json";
export const FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX_LEGACY = "client-pereira-nervieux.json";

const TVA_TRAVAUX = 0.055;
const TVA_CG = 0.055;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export const METRES_PEREIRA_NERVIEUX = {
  comblesM2: 60,
  comblesResistance: "R ≥ 7,0",
  comblesPuHt: 19.75,
  rampantsM2: 0,
  rampantsExclusM2: 70,
  plancherM2: 19,
  plancherResistance: "R ≥ 3,0",
  plancherPuHt: 165.01,
  menuiseriesM2: 19.38,
  fenetresNb: 7,
  fixesOpaquesNb: 3,
  chassisTotal: 10,
  veluxNb: 0,
  veluxExclusNb: 3,
  veluxExclusFormat: "0,78 × 0,78",
  itiM2: 0,
};

export const EXCLUSION_ITI_PEREIRA = {
  m2: 0,
  economieHt: 34316.59,
  economieTtc: 36204,
  mention:
    "Exclusion formelle de l’isolation des murs (ITI 12 cm) : 0 m². Économie directe 34 316,59 € HT / 36 204 € TTC. Préservation des 164 m² habitables, 0 nuisance de doublage.",
};

export const FISCALITE_AVIS_PEREIRA = {
  source: "Avis d’imposition sur les revenus 2025 — situation déclarative établie en 2026 (DGFIP).",
  dateEtablissement: "2026-05-28",
  identiteAvis: "PEREIRA DAVID DAVID",
  adresseAvis: "1 RTE DE SAINT GERMAIN LAVAL, 42510 NERVIEUX",
  numeroFiscal: "0096599959008",
  rfr: 27522,
  parts: 1,
  personnesFoyer: 1,
  zone: "hors_idf",
  departement: "42",
  impot: 44,
  profil: "violet",
  libelleProfil: "Violet — intermédiaires (barème MaPrimeRénov’ 2026, province, 1 part)",
  mention:
    "RFR 27 522 €, 1,0 part, hors Île-de-France. Seuil Violet 2026 (1 part) : ≥ 22 259 € et < 31 185 €. Avis lu le 16/09/2026. Montants d’aides à titre indicatif, définitifs après instruction ANAH.",
};

export const CONTACTS_PEREIRA_CONTRAT = [
  {
    role: "Direction & Contractant Général",
    nom: "Sylvain LEMBELEMBE",
    detail: "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com",
  },
  {
    role: "Gestionnaire Administrative Partenaire",
    nom: "Clyve",
    detail:
      "Gestion administrative, instruction et montage des dossiers de subventions ANAH / MaPrimeRénov’",
  },
  {
    role: "Courtier en travaux & financements",
    nom: "FABIEN — VIVONS COURTIER",
    detail: "06 71 19 96 45 — Prêts travaux (6 000 € à 75 000 €), trésorerie et solutions de financement",
  },
  {
    role: "Juriste ENERGIA-CONSEIL IA®",
    nom: "Julia",
    detail: "Avis juridique, conformité contractuelle & clause de protection des aides",
  },
];

/** Photos officielles du contrat — copies stables dans public/images/pereira/. */
export const DOSSIER_IMAGES_PEREIRA = "/images/pereira";

export const PAIRES_PHOTOS_CONTRAT_PEREIRA = [
  {
    id: "facade-menuiseries",
    titre: "Photo 1 — Façade et menuiseries (19,38 m²)",
    cote: "19,38 m² — 10 châssis verticaux (7 + 3), 0 Velux",
    etatUsure:
      "Menuiseries bois / simple vitrage, tableaux anciens, ponts thermiques. Façade et ouvertures d’origine (visite AUDIT-PEREIRA-2026-001).",
    preconisationRge:
      "Remplacement RGE par menuiseries haute isolation Uw ≤ 1,30 (aluminium à rupture de pont thermique). Teinte définitive à confirmer.",
    avantSrc: `${DOSSIER_IMAGES_PEREIRA}/01-facade-menuiseries-avant.png`,
    apresSrc: `${DOSSIER_IMAGES_PEREIRA}/01-facade-menuiseries-apres.jpg`,
    legendAvant: "Avant — façade et menuiseries actuelles (bois / simple vitrage).",
    legendApres: "Après — projection menuiseries haute isolation Uw ≤ 1,30 (image simulée, non contractuelle).",
  },
  {
    id: "chaufferie-pac",
    titre: "Photo 2 — Chaufferie / chaudière fioul",
    cote: "1 lot PAC air/eau HT chauffage seul + CET 250 L indépendant",
    etatUsure:
      "Chaudière fioul en cave, ballon ECS séparé, réseaux HT existants, maçonnerie pierre. Usure avancée, combustible fossile.",
    preconisationRge:
      "Dépose fioul + PAC air/eau haute température (chauffage seul, radiateurs fonte) et ballon thermodynamique 250 L indépendant. Artisan RGE (ECO SYSTÈME DURABLE à confirmer).",
    avantSrc: `${DOSSIER_IMAGES_PEREIRA}/02-chaufferie-fioul-avant.jpg`,
    apresSrc: `${DOSSIER_IMAGES_PEREIRA}/02-pac-ae-apres.jpg`,
    legendAvant: "Avant — chaudière fioul en cave (état initial).",
    legendApres: "Après — projection emplacement PAC air/eau HT chauffage seul (image simulée).",
  },
  {
    id: "combles",
    titre: "Photo 3 — Combles perdus 60 m²",
    cote: "60 m² combles perdus — R ≥ 7,0 — 0 m² de rampant",
    etatUsure:
      "Comble faiblement ventilé, plafond solives bois non isolé (audit BATIAUDIT). Enveloppe toiture visible en façade.",
    preconisationRge:
      "Isolation déroulée R ≥ 7,0 sur 60 m², artisan RGE, 2–3 devis. Photo après-pose à verser à réception.",
    avantSrc: `${DOSSIER_IMAGES_PEREIRA}/03-combles-enveloppe-avant.png`,
    apresSrc: null,
    legendAvant: "Avant — enveloppe toiture / accès combles (état des lieux).",
    legendApres: "Après — déroulé d’isolant R ≥ 7 sur 60 m² (photo de pose à annexer à réception).",
  },
  {
    id: "plancher",
    titre: "Photo 4 — Plancher bas / sous-sol 19 m²",
    cote: "19 m² plancher bas cave accessible — R ≥ 3,0",
    etatUsure:
      "Cave maçonnée accessible, dalle/plancher non isolé, chaufferie en place. Surface réelle 19 m² (hors 60 m² théoriques).",
    preconisationRge:
      "Isolation sous-face R ≥ 3,0, 19 m², artisan RGE. Photo après-pose à verser à réception.",
    avantSrc: `${DOSSIER_IMAGES_PEREIRA}/04-plancher-cave-avant.jpg`,
    apresSrc: null,
    legendAvant: "Avant — cave / plancher bas 19 m² (accès technique).",
    legendApres: "Après — isolation plancher bas R ≥ 3 (photo de pose à annexer à réception).",
  },
];

export function pairesPhotosPereiraPourEdition(edition) {
  const ajouts = edition?.photos?.ajouts && typeof edition.photos.ajouts === "object" ? edition.photos.ajouts : {};
  return PAIRES_PHOTOS_CONTRAT_PEREIRA.map((paire) => {
    const local = ajouts[paire.id] && typeof ajouts[paire.id] === "object" ? ajouts[paire.id] : {};
    return {
      ...paire,
      avantSrc: local.avantSrc || paire.avantSrc,
      apresSrc: local.apresSrc || paire.apresSrc,
    };
  });
}

export const PHOTOS_CONTRAT_PEREIRA = {
  mentionLegale:
    "Photographies réelles prises lors de la visite technique préalable du dossier AUDIT-PEREIRA-2026-001.",
  mentionProjection:
    "Image simulée — projection visuelle indicative. Ne constitue pas une photo réelle après travaux ni un engagement de résultat.",
  dossierPublic: DOSSIER_IMAGES_PEREIRA,
  paires: PAIRES_PHOTOS_CONTRAT_PEREIRA,
  chauffage: PAIRES_PHOTOS_CONTRAT_PEREIRA[1],
  menuiseries: PAIRES_PHOTOS_CONTRAT_PEREIRA[0],
  accesTechniques: [
    {
      src: `${DOSSIER_IMAGES_PEREIRA}/04-plancher-cave-avant.jpg`,
      titre: "Cave — accès plancher bas 19 m²",
      legend: "Photo réelle — chaufferie / cave accessible (plancher bas mesuré 19 m², hors 60 m² théoriques).",
    },
    {
      src: `${DOSSIER_IMAGES_PEREIRA}/03-combles-enveloppe-avant.png`,
      titre: "Enveloppe toiture — accès combles 60 m²",
      legend: "Photo réelle — façade d’angle / toiture, combles perdus 60 m² à isoler R ≥ 7.",
    },
  ],
  etatLieux: [
    {
      src: "/test-maison-pereira/galerie/avant-01.jpg",
      titre: "Vue 1 — pièce intérieure",
      legend: "Photo réelle — état des lieux initial, 164 m² habitables à préserver (sans ITI).",
    },
    {
      src: "/test-maison-pereira/galerie/avant-03.jpg",
      titre: "Vue 3 — pièce technique",
      legend: "Photo réelle — pièce technique (évier / baie), menuiseries existantes.",
    },
    {
      src: "/test-maison-pereira/galerie/avant-07.jpg",
      titre: "Vue 4 — radiateur et baie",
      legend: "Photo réelle — radiateur haute température et baie, justificatif du bouquet PAC + menuiseries.",
    },
  ],
};

export const MENTION_AIDES_PEREIRA_NERVIEUX =
  "Aides financières 2026 (estimation à titre indicatif). MaPrimeRénov’ Parcours Accompagné, saut certifié 3 classes DPE F → C, profil Violet lu sur avis d’imposition 2025 (RFR 27 522 €, 1 part, province). Aides à valider selon éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Courtier en travaux & financements : FABIEN — VIVONS COURTIER — 06 71 19 96 45. L’Éco-PTZ à taux 0 % est instruit en banque partenaire avec le dossier technique ENERGIA-CONSEIL IA®.";

export const MENTION_FABIEN_PEREIRA =
  "Courtier en travaux & financements : FABIEN — VIVONS COURTIER — 06 71 19 96 45 (Prêts travaux de 6 000 € à 75 000 €, trésorerie et regroupement de crédits. L'Éco-PTZ à taux 0 % est instruit en banque partenaire avec le dossier technique fourni par ENERGIA CONSEIL IA®).";

export const MENTION_DEBLOCAGE_SYLVAIN_CG =
  "Paiement par déblocage progressif 30/40/30 : 30 % à la signature, 40 % mi-chantier après validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®), 30 % à réception.";

export const ALERTE_METRES_PEREIRA =
  "Panier sans ITI, sans rampants, sans Velux. Combles perdus 60 m² déroulé R ≥ 7,0 (exclusion des 70 m² de rampants). Plancher bas 19 m² R ≥ 3,0. Menuiseries verticales 19,38 m² (7 fenêtres + 3 châssis fixes, 0 Velux). PAC air/eau HT chauffage seul + CET 250 L. Contractant Général : Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®.";

export const ALERTE_PISE_PEREIRA = ALERTE_METRES_PEREIRA;

export const CLIENT_PEREIRA_NERVIEUX = {
  nom: "PEREIRA",
  prenom: "David Emmanuel",
  mandant: "",
  telephone: "",
  email: "",
  adresse: "1 Route de Saint Germain Laval, 42510 Nervieux",
  adresseChantier: "1 Route de Saint Germain Laval, 42510 Nervieux",
  ville: "Nervieux",
  codePostal: "42510",
  anneeConstruction: "1948-1974",
  surfaceHabitable: "164",
  statutOccupation: "proprietaire_occupant",
  typeBien: "Maison individuelle R+1 (2 niveaux, HSP 2,50 m)",
  zoneClimatique: "H1c",
  altitudeM: 315,
  departement: "42",
  dpeReference: "2442E0486592V",
  dpeActuel: "F",
  dpeCible: "C",
  cepInitial: 337,
  cepCible: 111,
  factureAvantMin: 6860,
  factureAvantMax: 9320,
  factureApresMin: null,
  factureApresMax: null,
  gainEpPct: 67,
  gainGesPct: null,
  gainClasses: 3,
};

function posteFerme(poste) {
  return {
    ...poste,
    verrouillageOfficiel: true,
    quantiteFlexible: false,
    sourcePrix: "contrat-cg-sans-iti",
  };
}

export const POSTES_PEREIRA_NERVIEUX = [
  posteFerme({
    id: "pereira-nvx-poste-1-menuiseries",
    familleId: "menuiseries",
    nom: "Menuiseries extérieures verticales 19,38 m² — 10 châssis (7 + 3), 0 Velux",
    specifications:
      "10 châssis verticaux mesurés : 7 fenêtres battantes + 3 châssis fixes, 19,38 m², Uw ≤ 1,30. Exclusion stricte des 3 Velux 0,78 × 0,78.",
    artisan: "À sélectionner RGE",
    quantite: 19.38,
    unite: "m²",
    puHt: round2(6557.14 / 19.38),
    tauxTva: TVA_TRAVAUX,
    totalHt: 6557.14,
    totalTva: 360.64,
    totalTtc: 6917.78,
    ordreThermique: 4,
    ordreContractuel: 1,
    prestationId: "marche-fenetre-alu-gris-m2",
  }),
  posteFerme({
    id: "pereira-nvx-poste-2-combles",
    familleId: "isolation",
    nom: "Isolation combles perdus déroulés 60 m² (R ≥ 7,0) — 0 m² de rampant",
    specifications:
      "60 m² déroulé à 19,75 € HT/m², R ≥ 7,0. Exclusion stricte des 70 m² de rampants.",
    artisan: "À sélectionner RGE",
    quantite: 60,
    unite: "m²",
    puHt: 19.75,
    tauxTva: TVA_TRAVAUX,
    totalHt: 1185,
    totalTva: 65.18,
    totalTtc: 1250.18,
    ordreThermique: 1,
    ordreContractuel: 2,
    prestationId: "marche-combles-deroule",
  }),
  posteFerme({
    id: "pereira-nvx-poste-3-plancher",
    familleId: "isolation",
    nom: "Isolation plancher bas 19 m² (R ≥ 3,0) — cave accessible",
    specifications:
      "19 m² réels mesurés (cave accessible) à 165,01 € HT/m², R ≥ 3,0 — au lieu des 60 m² théoriques.",
    artisan: "À sélectionner RGE",
    quantite: 19,
    unite: "m²",
    puHt: 165.01,
    tauxTva: TVA_TRAVAUX,
    totalHt: 3135.19,
    totalTva: 172.44,
    totalTtc: 3307.63,
    ordreThermique: 3,
    ordreContractuel: 3,
    prestationId: "marche-plancher-bas",
  }),
  posteFerme({
    id: "pereira-nvx-poste-4-vmc",
    familleId: "ventilation",
    nom: "VMC simple flux hygroréglable type B (1 ensemble)",
    specifications: "VMC simple flux hygroréglable type B complète, fourniture + pose, 164 m² / HSP 2,50 m.",
    artisan: "À sélectionner RGE",
    quantite: 1,
    unite: "lot",
    puHt: 1160.9,
    tauxTva: TVA_TRAVAUX,
    totalHt: 1160.9,
    totalTva: 63.85,
    totalTtc: 1224.75,
    ordreThermique: 5,
    ordreContractuel: 4,
    prestationId: "marche-vmc-sf-hygro",
  }),
  posteFerme({
    id: "pereira-nvx-poste-5-pac",
    familleId: "chauffage",
    nom: "PAC air/eau haute température — chauffage seul (radiateurs fonte, 65 °C / 75 °C)",
    specifications:
      "PAC Air/Eau haute température dédiée exclusivement au réseau de radiateurs en fonte. SCOP ≥ 3,50 / ETAS ≥ 140 %. Dimensionnement post-isolation. ECS non intégrée (CET 250 L en poste 6). Pas de multi-split.",
    artisan: "À sélectionner RGE (ECO SYSTÈME DURABLE)",
    quantite: 1,
    unite: "lot",
    puHt: 9772.67,
    tauxTva: TVA_TRAVAUX,
    totalHt: 9772.67,
    totalTva: 537.49,
    totalTtc: 10310.16,
    ordreThermique: 6,
    ordreContractuel: 5,
    prestationId: "marche-pac-ae-6kw",
  }),
  posteFerme({
    id: "pereira-nvx-poste-6-cet",
    familleId: "ecs",
    nom: "Ballon thermodynamique 250 L indépendant (COP ≥ 3,0)",
    specifications:
      "Chauffe-eau thermodynamique 250 L indépendant, COP ≥ 3,0. Préserve la PAC en été et garantit l’eau chaude en continu.",
    artisan: "À sélectionner RGE (ECO SYSTÈME DURABLE)",
    quantite: 1,
    unite: "lot",
    puHt: 2200,
    tauxTva: TVA_TRAVAUX,
    totalHt: 2200,
    totalTva: 121,
    totalTtc: 2321,
    ordreThermique: 7,
    ordreContractuel: 6,
    prestationId: "marche-cet-simple",
  }),
  posteFerme({
    id: "pereira-nvx-poste-7-induits",
    familleId: "",
    nom: "Travaux induits chauffage : Dépose, neutralisation hydraulique et évacuation en filière agréée de l'ancienne chaudière fioul (BSD) + Désembouage hydrodynamique du circuit de radiateurs fonte + Fourniture et pose d'un filtre pot à boue magnétique (conforme DTU 65.16)",
    specifications:
      "Forfait technique réglementaire — dépose fioul avec BSD, désembouage hydrodynamique du réseau fonte existant, pot à boue magnétique. TVA 5,5 %. Garantie constructeur PAC conditionnée à ces travaux.",
    artisan: "À sélectionner RGE",
    quantite: 1,
    unite: "forfait",
    puHt: 1500,
    tauxTva: TVA_TRAVAUX,
    totalHt: 1500,
    totalTva: 82.5,
    totalTtc: 1582.5,
    ordreThermique: 8,
    ordreContractuel: 7,
    prestationId: "energia-travaux-induits",
  }),
  posteFerme({
    id: "pereira-nvx-poste-8-contractant-general",
    familleId: "",
    nom: "Direction & Contractant Général — Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®",
    specifications:
      `Coordination TCE, pilotage de chantier. Marché de travaux de Contractant Général. Responsabilité décennale complète (MIC Insurance). TVA 5,5 %. Clyve (${HONORAIRES_HUB_ADMIN_HT.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € HT) est un coût interne, non facturé au client.`,
    artisan: "ENERGIA-CONSEIL IA®",
    quantite: 1,
    unite: "lot",
    puHt: 5200,
    tauxTva: TVA_CG,
    totalHt: 5200,
    totalTva: 286,
    totalTtc: 5486,
    ordreThermique: 9,
    ordreContractuel: 8,
    prestationId: "energia-contractant-general",
  }),
];

export const TOTAUX_TRAVAUX_55_PEREIRA = {
  totalHt: 25510.9,
  totalTva: 1403.1,
  totalTtc: 26914,
};

export const TOTAUX_CG_20_PEREIRA = {
  totalHt: 5200,
  totalTva: 286,
  totalTtc: 5486,
};

export const TOTAUX_PEREIRA_NERVIEUX = {
  totalHt: 30710.9,
  totalTva: 1689.1,
  totalTtc: 32400,
};

export const FINANCEMENT_PEREIRA_CG = {
  acompte: 5070,
  intermediaire: 6760,
  solde: 5070,
  ecoPtzDuree: 20,
};

/** MPR 2026 Violet + CEE Coup de pouce sortie de fioul — marché du 26/10/2026. */
export const AIDES_PEREIRA_VIOLET = {
  profil: "violet",
  rfr: 27522,
  parts: 1,
  travauxEligiblesHt: 25510.9,
  tauxParcours: 0.45,
  plafondHt: 40000,
  maxProfil: 18000,
  tauxMar: 0.8,
  mpr: 11500,
  mar: 0,
  cee: 4000,
  locales: 0,
  coupDePouce: 0,
  totalAides: 15500,
  ecretementTtc: 0.8,
  plafondEcretement: 25920,
  ecrete: false,
  resteACharge: 16900,
  mensualite20: 70.42,
  libelleMpr: "MaPrimeRénov’ Parcours Accompagné (Violet 45 %, 3 classes, base HT travaux 5,5 %)",
  libelleCee: "Prime CEE Coup de pouce sortie de fioul",
};

export function lignesTravauxPereiraNervieux() {
  return POSTES_PEREIRA_NERVIEUX.map((poste) => ({ ...poste }));
}

export function totauxContractuelsPereiraNervieux() {
  return {
    lignes: lignesTravauxPereiraNervieux(),
    ...TOTAUX_PEREIRA_NERVIEUX,
  };
}

export function editionOfficiellePereiraNervieux() {
  const c = CLIENT_PEREIRA_NERVIEUX;
  const a = AIDES_PEREIRA_VIOLET;
  const f = FINANCEMENT_PEREIRA_CG;
  return {
    version: 3,
    verrouillageOfficiel: true,
    devisOfficiel: {
      numero: PEREIRA_NERVIEUX_NUMERO,
      date: PEREIRA_NERVIEUX_DATE,
      validite: "3 mois — contrat de Contractant Général sans ITI",
      duplicata: false,
      version: "SANS-ITI",
      surfaceHabitableM2: 164,
      sourceMetres: "relevé de métrés réconcilié — hors rampants, hors Velux, hors ITI",
      sourceAudit: "AUDIT-PEREIRA-2026-001 — BATIAUDIT — Lionel MFEGUE",
      sourceFiscal: FISCALITE_AVIS_PEREIRA.source,
    },
    client: {
      nom: c.nom,
      prenom: c.prenom,
      mandant: c.mandant,
      telephone: c.telephone,
      email: c.email,
      adresse: c.adresse,
      anneeConstruction: c.anneeConstruction,
      surfaceHabitable: c.surfaceHabitable,
      statutOccupation: c.statutOccupation,
    },
    travaux: lignesTravauxPereiraNervieux(),
    aides: {
      profil: a.profil,
      parcours: "parcours",
      gainClasses: 3,
      region: "AURA",
      verrouillageOfficiel: true,
      rfr: a.rfr,
      parts: a.parts,
      overrides: {
        mpr: a.mpr,
        cee: a.cee,
        locales: 0,
        coupDePouce: a.coupDePouce,
        mar: a.mar,
      },
    },
    financement: {
      ecoPtzMontant: a.resteACharge,
      ecoPtzDuree: f.ecoPtzDuree,
      apportPersonnel: 0,
    },
    mentionsJuridiques: [
      ALERTE_METRES_PEREIRA,
      EXCLUSION_ITI_PEREIRA.mention,
      FISCALITE_AVIS_PEREIRA.mention,
      MENTION_AIDES_PEREIRA_NERVIEUX,
      MENTION_FABIEN_PEREIRA,
      MENTION_DEBLOCAGE_SYLVAIN_CG,
    ],
    prestataire: PRESTATAIRE_ENERGIA,
    mar: {
      ...COORDINATION_ENERGIA,
      role: "Direction & Contractant Général",
    },
    finances: {
      coutClyveHt: HONORAIRES_HUB_ADMIN_HT,
    },
    valorisation: {
      prixM2Constate: null,
      dpeActuel: c.dpeActuel,
      dpeCible: c.dpeCible,
      dpeReference: c.dpeReference,
      cepInitial: c.cepInitial,
      cepCible: c.cepCible,
      gainEpPct: c.gainEpPct,
      gainGesPct: c.gainGesPct,
      gainClasses: c.gainClasses,
      factureAvantMin: c.factureAvantMin,
      factureAvantMax: c.factureAvantMax,
      factureApresMin: c.factureApresMin,
      factureApresMax: c.factureApresMax,
    },
    photos: PHOTOS_CONTRAT_PEREIRA,
  };
}

export const PROJET_PEREIRA_NERVIEUX_DEFAUT = {
  id: PEREIRA_NERVIEUX_DOSSIER_ID,
  nom: "David Emmanuel PEREIRA",
  ville: "Nervieux",
  codePostal: "42510",
  rfr: FISCALITE_AVIS_PEREIRA.rfr,
  statut: "Devis en attente de signature",
  source: "manuel",
  createdAt: "2026-09-16",
  adresse: CLIENT_PEREIRA_NERVIEUX.adresse,
  surfaceHabitable: 164,
  anneeConstruction: "1948-1974",
  apporteurId: SOURCE_APPORTEUR_DIRECT,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DIRECT, { select: true }),
  etapeAnah: ETAPE_ANAH_VALIDATION_MAR,
  validationMar: false,
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: "",
  margeDirectionHt: TOTAUX_CG_20_PEREIRA.totalHt,
  margeDirectionTtc: TOTAUX_CG_20_PEREIRA.totalTtc,
  alertes: [ALERTE_METRES_PEREIRA, FISCALITE_AVIS_PEREIRA.mention],
};

/**
 * Paramètres par défaut et mentions commerciales — chiffrage rénovation d’ampleur 2026.
 *
 * Modifier ici les taux (aléas, pilotage, marge, TVA) sans toucher au moteur.
 * Les tarifs fournisseurs se renseignent dans `tarifs-fournisseurs.2026.json`.
 */

import type {
  ParametresChiffrage,
  ParametresDeplacement,
  SourcePrix,
  TauxTva,
  TypeVisiteEnergia,
} from "./types";

export const ANNEE_REFERENCE = 2026 as const;

/** Durée au-delà de laquelle un tarif vérifié est considéré obsolète. */
export const DUREE_VALIDITE_TARIF_MOIS = 12;

export const TAUX_ALEAS = {
  standard: 0.04,
  complexe: 0.05,
} as const;

export const TAUX_PILOTAGE = {
  standard: 0.07,
  complexe: 0.08,
} as const;

/**
 * Marge commerciale exprimée en % du PRIX DE VENTE HT, pas en majoration du coût.
 * Formule : prix_HT = coût_interne / (1 - taux_marge)
 */
export const TAUX_MARGE = {
  standardMinimale: 0.1,
  complexeRecommandeeMin: 0.12,
  complexeRecommandeeMax: 0.15,
  complexeDefaut: 0.12,
} as const;

export const TAUX_TVA: { value: TauxTva; label: string }[] = [
  { value: 0.055, label: "5,5 %" },
  { value: 0.1, label: "10 %" },
  { value: 0.2, label: "20 %" },
];

export const AVERTISSEMENT_TVA =
  "Le taux de TVA doit être confirmé selon la nature exacte des travaux, l’âge du logement, les fournitures et les conditions d’éligibilité.";

export const SOURCES_PRIX: { value: SourcePrix; label: string; verifie: boolean }[] = [
  { value: "tarif_fournisseur_verifie", label: "Tarif fournisseur vérifié", verifie: true },
  { value: "devis_sous_traitant", label: "Devis sous-traitant", verifie: true },
  { value: "estimation_marche", label: "Estimation de marché", verifie: false },
  { value: "hypothese_provisoire", label: "Hypothèse provisoire", verifie: false },
];

export const UNITES_LABEL: Record<string, string> = {
  forfait: "Forfait",
  m2: "m²",
  ml: "ml",
  unite: "Unité",
  kWc: "kWc",
  panneau: "Panneau",
};

export const LOGO_PUBLIC_PATH = "/assets/LOGO.png";

export const CONTACT_CHIFFRAGE = {
  enseigne: "ENERGIA CONSEIL IA®",
  qualite: "Contractant général – étude, coordination et pilotage des travaux",
  fondateurQualite: "Fondateur & CEO — Contractant Général Digital",
  email: "contact@energia-conseil-ia.com",
  telephone: "06 10 59 68 98",
  adresse: "16 Rue Cuvier, 69006 Lyon",
  siret: "94181942700019",
  rcs: "Lyon 941819427",
  forme: "SASU Capital 100€",
  /** Aucun numéro de police ENERGIA n’est présent dans le projet — mention des devis existants. */
  assurances:
    "Assurances des entreprises intervenantes : décennale et responsabilité civile professionnelle (attestations à jour exigées).",
} as const;

export const CGV_DEVIS_CLIENT = [
  "Document estimatif, valable 3 mois à compter de sa date d’émission, sauf mention contraire.",
  "Les travaux sont réalisés par des artisans certifiés RGE, sélectionnés et coordonnés par ENERGIA CONSEIL IA®.",
  "Paiement par déblocage progressif 30/40/30 : 30 % à la signature, 40 % mi-chantier après validation de Sylvain LEMBELEMBE (AMO ENERGIA-CONSEIL IA®), 30 % à réception.",
  "Les aides financières 2026 sont indiquées à titre indicatif. Elles sont à valider selon les revenus réels du client et l’éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.",
  "Les travaux éligibles à MaPrimeRénov' Parcours ne peuvent démarrer qu’après validation officielle du dossier par l’ANAH.",
  "TVA applicable selon la nature des travaux, l’âge du logement et les conditions d’éligibilité, à confirmer poste par poste.",
  "Garanties légales : décennale (entreprises), biennale (équipements), garantie de parfait achèvement.",
  "Le client est informé de l’opportunité de souscrire une assurance Dommages-Ouvrage ; ENERGIA ne peut être tenue responsable du défaut de souscription.",
  "Litiges : tentative de résolution amiable sous 15 jours, puis compétence des tribunaux de Lyon.",
] as const;

export const MENTIONS_COMMERCIALES = [
  "Les montants présentés sont indicatifs et doivent être confirmés par des devis actualisés.",
  "Le montant définitif dépendra des métrés, de la visite technique, des contraintes du logement et des devis des entreprises intervenantes.",
  "Les aides sont estimatives et ne constituent pas une décision d’attribution.",
  "Le prix sortant inclut les coûts de fourniture, les prestations des entreprises, les aléas, la coordination, le pilotage et la marge commerciale d’ENERGIA CONSEIL IA®.",
] as const;

export const MENTIONS_DEPLACEMENT = [
  "Les frais de déplacement sont estimés selon les adresses renseignées, les distances aller-retour, le nombre prévisionnel de visites et les frais annexes. Ils seront confirmés selon les devis des entreprises intervenantes et les besoins réels du chantier.",
  "Lorsque les déplacements sont déjà inclus dans le devis d’une entreprise, ils ne sont pas comptabilisés une seconde fois.",
  "Les montants sont indicatifs et doivent être confirmés après visite technique, métrés et consultation des entreprises.",
] as const;

/** Adresse de la base ENERGIA — utilisée uniquement pour les visites ENERGIA, jamais pour les artisans. */
export const ADRESSE_BASE_ENERGIA_DEFAUT = "16 Rue Cuvier, 69006 Lyon";

export const LIBELLE_DEPLACEMENTS_ENERGIA =
  "Déplacements, visites et suivi ENERGIA CONSEIL IA®";

/**
 * Aucun coût kilométrique n’est inventé. Les champs restent vides tant que
 * l’utilisateur ne les renseigne pas dans les paramètres du module.
 */
export const PARAMETRES_DEPLACEMENT_DEFAUT: ParametresDeplacement = {
  coutKilometriqueEnergiaHt: null,
  coutKilometriqueArtisanHt: null,
  coutPeageHt: 0,
  coutStationnementHt: 0,
  coutHoraireTempsDeplacementHt: null,
};

export const TYPES_VISITE_ENERGIA: { value: TypeVisiteEnergia; libelle: string }[] = [
  { value: "audit_initial", libelle: "Audit initial" },
  { value: "visite_metres", libelle: "Visite de métrés" },
  { value: "reunion_lancement", libelle: "Réunion de lancement" },
  { value: "suivi_chantier", libelle: "Suivi de chantier" },
  { value: "reception", libelle: "Réception" },
  { value: "autre", libelle: "Autre visite" },
];

export const LABEL_SOURCE_DISTANCE: Record<string, string> = {
  saisie_manuelle: "Saisie manuelle",
  calcul_cartographique: "Calcul cartographique",
};

export const DISCLAIMERS_AIDES = [
  "Aides financières 2026 (estimation à titre indicatif).",
  "Aides à valider selon revenus réels du client et éligibilité en vigueur.",
  "Montants définitifs après instruction ANAH et CEE.",
] as const;

export function parametresParDefaut(
  complexite: ParametresChiffrage["complexite"] = "standard",
): ParametresChiffrage {
  const complexe = complexite === "complexe";
  return {
    anneeReference: ANNEE_REFERENCE,
    complexite,
    tauxAleas: complexe ? TAUX_ALEAS.complexe : TAUX_ALEAS.standard,
    tauxPilotage: complexe ? TAUX_PILOTAGE.complexe : TAUX_PILOTAGE.standard,
    tauxMarge: complexe ? TAUX_MARGE.complexeDefaut : TAUX_MARGE.standardMinimale,
    tauxTvaDefaut: 0.055,
    fraisStructureHt: 0,
    libelleProjet: "Rénovation d’ampleur — chiffrage 2026",
    adresseChantier: "",
    adresseDepartEnergia: ADRESSE_BASE_ENERGIA_DEFAUT,
    deplacement: { ...PARAMETRES_DEPLACEMENT_DEFAUT },
  };
}

/** Fusionne un état persisté (éventuellement antérieur au modèle déplacements). */
export function normaliserParametresChiffrage(
  brut: Partial<ParametresChiffrage> | undefined,
): ParametresChiffrage {
  const base = parametresParDefaut(brut?.complexite ?? "standard");
  return {
    ...base,
    ...(brut ?? {}),
    adresseChantier: brut?.adresseChantier ?? "",
    adresseDepartEnergia: brut?.adresseDepartEnergia || ADRESSE_BASE_ENERGIA_DEFAUT,
    deplacement: {
      ...PARAMETRES_DEPLACEMENT_DEFAUT,
      ...(brut?.deplacement ?? {}),
    },
  };
}

/**
 * Barème MaPrimeRénov’ / CEE / Éco-PTZ — version 2026 ENERGIA-CONSEIL IA®
 * Taux OFFICIELS. Ne pas confondre avec les taux pédagogiques d’interface (80/70/50/35).
 */

import type { ProfilMpr, RegionCode } from "../types/aides";

export const AID_RULES_2026 = {
  version: "MPR-2026.1-ENERGIA",
  dateEntreeEnVigueur: "2026-01-01",
  anneeReference: 2026,
  source:
    "Barèmes MaPrimeRénov’ Parcours / geste 2026 (ANAH) repris par ENERGIA-CONSEIL IA® — estimation à titre indicatif, montants définitifs après instruction ANAH et CEE.",
  disclaimer:
    "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.",

  profils: {
    bleu: { label: "Bleu — très modestes", tauxParcours: 0.8, max2classes: 24000, max3classes: 32000 },
    jaune: { label: "Jaune — modestes", tauxParcours: 0.6, max2classes: 18000, max3classes: 24000 },
    violet: { label: "Violet — intermédiaires", tauxParcours: 0.45, max2classes: 13500, max3classes: 18000 },
    rose: { label: "Rose — aisés", tauxParcours: 0.1, max2classes: 3000, max3classes: 4000 },
  },

  /** Plafonds de dépenses éligibles Parcours (HT). */
  plafondsParcoursHt: {
    deuxClasses: 30000,
    troisClassesOuPlus: 40000,
  },

  /** Écrêtement du cumul d’aides rapporté au TTC des dépenses éligibles. */
  ecretementTtc: {
    bleu: 1,
    jaune: 0.8,
    violet: 0.8,
    rose: 0.5,
  },

  mar: {
    coutMin: 2000,
    coutMax: 4000,
    plafondPrisEnCharge: 2000,
    taux: { bleu: 1, jaune: 1, violet: 0.8, rose: 0.4 },
  },

  seuilsRfr: {
    IDF: {
      1: { bleu: 24031, jaune: 29253, violet: 40851 },
      2: { bleu: 35270, jaune: 42933, violet: 60051 },
      3: { bleu: 42357, jaune: 51564, violet: 71846 },
      4: { bleu: 49455, jaune: 60208, violet: 84562 },
      5: { bleu: 56580, jaune: 68877, violet: 96817 },
      parPersonneSupplementaire: { bleu: 7116, jaune: 8663, violet: 12257 },
    },
    HORS_IDF: {
      1: { bleu: 17363, jaune: 22259, violet: 31185 },
      2: { bleu: 25393, jaune: 32553, violet: 45842 },
      3: { bleu: 30540, jaune: 39148, violet: 55196 },
      4: { bleu: 35634, jaune: 45673, violet: 64450 },
      5: { bleu: 40728, jaune: 52198, violet: 73704 },
      parPersonneSupplementaire: { bleu: 5094, jaune: 6525, violet: 9254 },
    },
  },

  gesteParGeste: {
    combles: { bleu: 25, jaune: 20, violet: 15, rose: 0, unite: "€/m²", surfaceMax: 100 },
    ite: { bleu: 75, jaune: 60, violet: 40, rose: 15, unite: "€/m²" },
    iti: { bleu: 25, jaune: 20, violet: 15, rose: 7, unite: "€/m²" },
    planchers: { bleu: 50, jaune: 40, violet: 25, rose: 0, unite: "€/m²" },
    fenetres: { bleu: 100, jaune: 80, violet: 40, rose: 0, unite: "€/eq" },
    pacAirEau: { bleu: 5000, jaune: 4000, violet: 3000, rose: 0, unite: "€/forfait" },
    vmcDf: { bleu: 4000, jaune: 3000, violet: 2000, rose: 0, unite: "€/forfait" },
    ballon: { bleu: 1200, jaune: 800, violet: 400, rose: 0, unite: "€/forfait" },
  },

  bonus: {
    sortiePassoire: 1500,
    bbc: 1500,
    batimentBasseConso: 500,
    maxCumul: 3500,
  },

  cee: {
    isolationToitureEurM2: { min: 10, max: 25, median: 15 },
    fenetresEurEq: { min: 50, max: 80, median: 65 },
    pacAirEau: { min: 2500, max: 4000, median: 3500 },
    vmcDf: { min: 400, max: 600, median: 500 },
    ballon: { min: 100, max: 150, median: 125 },
    /** CEE non retenus sur ITE/ITI (règle ENERGIA 2026). */
    horsIteIti: true,
    variation: "Fourchette 20–40 % selon obligé. Montant médian utilisé, non contractuel.",
    coupDePouce: { deuxClasses: 4700, troisClassesOuPlus: 5800 },
  },

  ecoPtz: {
    uneAction: 15000,
    deuxActions: 25000,
    troisOuGlobal: 50000,
    dureeAns: 15,
    conditions: [
      "Résidence principale",
      "Logement achevé depuis plus de 2 ans",
      "Artisans RGE",
      "Acceptation bancaire non garantie",
    ],
  },

  eligibilite: {
    residencePrincipaleRequise: true,
    ancienneteMinimaleAns: 2,
    rgeObligatoire: true,
    isolationAvantChauffage: true,
    auditReglementaireParcours: true,
    cumulMaxTravaux: 1,
    postesNonEligiblesMpr: ["maconnerie", "pv", "autre"],
  },

  cumul: {
    description:
      "Le cumul MaPrimeRénov’ + CEE + aides locales + autres ne peut pas dépasser 100 % des dépenses éligibles, ni le taux d’écrêtement du profil.",
    maxRatioDepensesEligibles: 1,
  },
} as const;

export function getSeuilsProfil(
  region: RegionCode,
  householdSize: number,
): { bleu: number; jaune: number; violet: number } {
  const table = AID_RULES_2026.seuilsRfr[region];
  const size = Math.max(1, Math.floor(householdSize));
  if (size <= 5) {
    return table[size as 1 | 2 | 3 | 4 | 5];
  }
  const extra = size - 5;
  const base = table[5];
  return {
    bleu: base.bleu + extra * table.parPersonneSupplementaire.bleu,
    jaune: base.jaune + extra * table.parPersonneSupplementaire.jaune,
    violet: base.violet + extra * table.parPersonneSupplementaire.violet,
  };
}

export function determinerProfil(rfr: number, householdSize: number, region: RegionCode): ProfilMpr {
  const seuils = getSeuilsProfil(region, householdSize);
  if (rfr < seuils.bleu) return "bleu";
  if (rfr < seuils.jaune) return "jaune";
  if (rfr < seuils.violet) return "violet";
  return "rose";
}

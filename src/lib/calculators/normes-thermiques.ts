import type { DPEClass } from "./types";

export interface NormeThermique {
  label: string;
  yearMin: number;
  yearMax: number;
  norme: string;
  dpeTypique: DPEClass[];
  consoMin: number;
  consoMax: number;
  consoDefaut: number;
}

export const NORMES_THERMIQUES: NormeThermique[] = [
  {
    label: "Avant 1948",
    yearMin: 0,
    yearMax: 1947,
    norme: "Aucune norme",
    dpeTypique: ["F", "G"],
    consoMin: 300,
    consoMax: 500,
    consoDefaut: 400,
  },
  {
    label: "1948 - 1974",
    yearMin: 1948,
    yearMax: 1974,
    norme: "Aucune norme",
    dpeTypique: ["E", "F"],
    consoMin: 250,
    consoMax: 400,
    consoDefaut: 320,
  },
  {
    label: "1975 - 1981",
    yearMin: 1975,
    yearMax: 1981,
    norme: "RT 1974",
    dpeTypique: ["D", "E"],
    consoMin: 180,
    consoMax: 280,
    consoDefaut: 230,
  },
  {
    label: "1982 - 1988",
    yearMin: 1982,
    yearMax: 1988,
    norme: "RT 1982",
    dpeTypique: ["D", "E"],
    consoMin: 150,
    consoMax: 220,
    consoDefaut: 185,
  },
  {
    label: "1989 - 2000",
    yearMin: 1989,
    yearMax: 2000,
    norme: "RT 1988",
    dpeTypique: ["C", "D"],
    consoMin: 120,
    consoMax: 180,
    consoDefaut: 150,
  },
  {
    label: "2001 - 2005",
    yearMin: 2001,
    yearMax: 2005,
    norme: "RT 2000",
    dpeTypique: ["C", "D"],
    consoMin: 100,
    consoMax: 150,
    consoDefaut: 125,
  },
  {
    label: "2006 - 2012",
    yearMin: 2006,
    yearMax: 2012,
    norme: "RT 2005",
    dpeTypique: ["B", "C"],
    consoMin: 80,
    consoMax: 120,
    consoDefaut: 100,
  },
  {
    label: "2013 - 2020",
    yearMin: 2013,
    yearMax: 2020,
    norme: "RT 2012",
    dpeTypique: ["A", "B"],
    consoMin: 40,
    consoMax: 80,
    consoDefaut: 60,
  },
  {
    label: "Après 2021",
    yearMin: 2021,
    yearMax: 9999,
    norme: "RE 2020",
    dpeTypique: ["A"],
    consoMin: 20,
    consoMax: 50,
    consoDefaut: 35,
  },
];

const CONSO_PAR_DPE: Record<DPEClass, number> = {
  A: 50,
  B: 90,
  C: 150,
  D: 230,
  E: 330,
  F: 420,
  G: 550,
};

const PRIX_KWH = 0.18;

/** Constantes simulateur freemium — fourchettes Économies / CO₂ */
export const PRIX_KWH_SIMULATEUR = 0.21;
export const FACTEUR_CO2 = 0.00018; // tonnes CO₂ / kWh économisé

export interface FourchetteFreemium {
  min: number;
  max: number;
  base: number;
}

export interface FourchettesFreemiumResult {
  economies: FourchetteFreemium;
  co2: FourchetteFreemium;
  consoActuelleKWhParM2: number;
  consoCibleKWhParM2: number;
}

/** Consommation actuelle en kWh/m²/an (réelle ou estimée via normes + DPE). */
export function getConsoActuelleKWhParM2(
  surface: number,
  constructionYear: number,
  dpeActuel: DPEClass,
  annualConsumption?: number,
): number {
  if (annualConsumption != null && annualConsumption > 0 && surface > 0) {
    return annualConsumption / surface;
  }
  return getConsoParM2ForYearAndDPE(constructionYear, dpeActuel);
}

/**
 * Consommation cible post-travaux (DPE A ou B) :
 * RE 2020 → 35 kWh/m² (A) | RT 2012 → 60 kWh/m² (B).
 */
export function getConsoCibleKWhParM2(dpeVise: DPEClass): number {
  if (dpeVise === "A") return 35;
  return 60;
}

/** Fourchettes dynamiques Économies/an (±15 %) et Réduction CO₂/an (±20 %). */
export function computeFourchettesFreemium(
  surface: number,
  constructionYear: number,
  dpeActuel: DPEClass,
  dpeVise: DPEClass,
  annualConsumption?: number,
): FourchettesFreemiumResult {
  const consoActuelleKWhParM2 = getConsoActuelleKWhParM2(
    surface,
    constructionYear,
    dpeActuel,
    annualConsumption,
  );
  const consoCibleKWhParM2 = getConsoCibleKWhParM2(dpeVise);
  const deltaConso = Math.max(0, consoActuelleKWhParM2 - consoCibleKWhParM2);

  const economiesBase = deltaConso * surface * PRIX_KWH_SIMULATEUR;
  const co2Base = deltaConso * surface * FACTEUR_CO2;

  return {
    consoActuelleKWhParM2,
    consoCibleKWhParM2,
    economies: {
      base: economiesBase,
      min: economiesBase * 0.85,
      max: economiesBase * 1.15,
    },
    co2: {
      base: co2Base,
      min: co2Base * 0.8,
      max: co2Base * 1.2,
    },
  };
}

export function getNormeForYear(constructionYear: number): NormeThermique {
  const year = Math.max(0, Math.floor(constructionYear));
  return (
    NORMES_THERMIQUES.find((n) => year >= n.yearMin && year <= n.yearMax) ??
    NORMES_THERMIQUES[0]
  );
}

/** DPE typique le plus défavorable pour l'époque de construction (défaut simulateur). */
export function getDefaultDPEForYear(constructionYear: number): DPEClass {
  const norme = getNormeForYear(constructionYear);
  return norme.dpeTypique[norme.dpeTypique.length - 1];
}

/** DPE typique médian pour l'époque de construction. */
export function getTypicalDPEForYear(constructionYear: number): DPEClass {
  const norme = getNormeForYear(constructionYear);
  const mid = Math.floor(norme.dpeTypique.length / 2);
  return norme.dpeTypique[mid];
}

/** Consommation kWh/m²/an cohérente année + DPE (sans saisie réelle). */
export function getConsoParM2ForYearAndDPE(
  constructionYear: number,
  dpe: DPEClass,
): number {
  const norme = getNormeForYear(constructionYear);
  const typicalDpe = getTypicalDPEForYear(constructionYear);
  const ratio = CONSO_PAR_DPE[dpe] / CONSO_PAR_DPE[typicalDpe];
  const consoParM2 = norme.consoDefaut * ratio;
  return Math.max(norme.consoMin, Math.min(norme.consoMax, consoParM2));
}

export function isDPECoherentWithYear(
  dpe: DPEClass,
  constructionYear: number,
): boolean {
  const norme = getNormeForYear(constructionYear);
  return norme.dpeTypique.includes(dpe);
}

export function getDPEIncoherenceMessage(
  dpe: DPEClass,
  constructionYear: number,
): string | null {
  if (isDPECoherentWithYear(dpe, constructionYear)) return null;

  const norme = getNormeForYear(constructionYear);
  const dpeAttendus = norme.dpeTypique.join(" ou ");

  return (
    `⚠️ DPE incohérent avec l'année de construction. ` +
    `Vérifiez votre saisie. Une maison construite en ${constructionYear} ` +
    `est normalement classée ${dpeAttendus} (${norme.norme}).`
  );
}

export function getNormeBadgeText(constructionYear: number): string {
  const norme = getNormeForYear(constructionYear);
  return `🏗️ Norme applicable : ${norme.norme} (construction ${constructionYear})`;
}

export type EligibilityStatus = "eligible" | "warning" | "blocked";

export function getEligibilityStatus(constructionYear: number): {
  status: EligibilityStatus;
  message: string | null;
} {
  const year = Math.floor(constructionYear);

  if (year > 2020) {
    return {
      status: "blocked",
      message:
        "❌ Votre logement (construit après 2020) ne peut pas être une passoire thermique. " +
        "Il n'est pas éligible aux aides de rénovation énergétique.",
    };
  }

  if (year > 2013) {
    return {
      status: "warning",
      message:
        "⚠️ Les logements construits après 2013 sont rarement éligibles au Parcours Accompagné MaPrimeRénov'. " +
        "Contactez-nous pour vérifier votre éligibilité.",
    };
  }

  return { status: "eligible", message: null };
}

export function getEffectiveConsumptionKWh(
  surface: number,
  constructionYear: number,
  dpeActuel: DPEClass,
  annualConsumption?: number,
): number {
  if (annualConsumption != null && annualConsumption > 0) {
    return annualConsumption;
  }

  const consoParM2 = getConsoParM2ForYearAndDPE(constructionYear, dpeActuel);
  return Math.round(consoParM2 * surface);
}

export function estimateAnnualSavingsFromNormes(
  surface: number,
  constructionYear: number,
  dpeActuel: DPEClass,
  dpeVise: DPEClass,
  annualConsumption?: number,
): number {
  const consoAvant = getEffectiveConsumptionKWh(
    surface,
    constructionYear,
    dpeActuel,
    annualConsumption,
  );
  const ratioApres = CONSO_PAR_DPE[dpeVise] / CONSO_PAR_DPE[dpeActuel];
  const consoApres = Math.round(consoAvant * ratioApres);
  const economiesKWh = Math.max(0, consoAvant - consoApres);
  return Math.round(economiesKWh * PRIX_KWH);
}

export function estimateFactureFromNormes(
  surface: number,
  constructionYear: number,
  dpe: DPEClass,
  annualConsumption?: number,
  dpeReference?: DPEClass,
): number {
  const refDpe = dpeReference ?? dpe;
  const consoBase = getEffectiveConsumptionKWh(
    surface,
    constructionYear,
    refDpe,
    annualConsumption,
  );
  const ratio = CONSO_PAR_DPE[dpe] / CONSO_PAR_DPE[refDpe];
  const consoKWh = Math.round(consoBase * ratio);
  return Math.round(consoKWh * PRIX_KWH);
}

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

export function getNormeForYear(constructionYear: number): NormeThermique {
  const year = Math.max(0, Math.floor(constructionYear));
  return (
    NORMES_THERMIQUES.find((n) => year >= n.yearMin && year <= n.yearMax) ??
    NORMES_THERMIQUES[0]
  );
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
  _dpeActuel: DPEClass,
  annualConsumption?: number,
): number {
  if (annualConsumption != null && annualConsumption > 0) {
    return annualConsumption;
  }

  const norme = getNormeForYear(constructionYear);
  return Math.round(norme.consoDefaut * surface);
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

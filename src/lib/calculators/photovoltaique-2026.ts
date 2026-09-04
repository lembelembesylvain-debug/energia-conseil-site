/**
 * Calculs photovoltaïques — TVA, batterie, identification des lignes.
 * Les aides, primes et tarifs de rachat viennent de `photovoltaique-reglementaire.ts`.
 * Ils ne sont jamais présentés comme définitifs sans statut « valide ».
 */

import {
  ALERTE_DONNEES_NON_VALIDEES,
  lireReglementairePv,
  MENTION_AIDES_NON_DEFINITIVES,
  type LectureReglementairePv,
} from "./photovoltaique-reglementaire";

export const PV_BAREME_VERSION = "PV-REGLEMENTAIRE-2026";
export const PV_BAREME_DATE = "2026-09-04";

export const TVA_PV_ECO_2026 = 0.055;
export const TVA_PV_NORMALE = 0.2;
export const SEUIL_TVA_PV_KWC = 9;

export const BATTERIE_MIN_KWH = 3.5;
export const BATTERIE_MAX_KWH = 30;
/** Dimensionnement indicatif : 2 kWh de stockage par kWc, borné 3,5–30 kWh. */
export const BATTERIE_KWH_PAR_KWC = 2;

export const ALERTE_TARIF_RACHAT_2026 = ALERTE_DONNEES_NON_VALIDEES;
export const MENTION_AIDES_PV = MENTION_AIDES_NON_DEFINITIVES;

export type TranchePrimePv = "<=9" | "9-36" | "36-100" | "hors_bareme";

export type ProfilConsoPv =
  | "residentiel_jour"
  | "residentiel_soir"
  | "professionnel"
  | "inconnu";

export type OptionsBatteriePv = {
  consoAnnuelleKwh?: number;
  profilConso?: ProfilConsoPv;
  puissanceDispoKwc?: number;
  tauxAutoconsoCible?: number;
};

export function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function round05(n: number): number {
  return Math.round(n * 2) / 2;
}

export function lectureReglementaire(puissanceKwc: number): LectureReglementairePv {
  return lireReglementairePv(puissanceKwc);
}

/**
 * TVA indicative selon la table réglementaire.
 * Si la table n’a pas de taux applicable : 5,5 % ≤ 9 kWc, 20 % au-delà (hypothèse de travail).
 */
export function tauxTvaPhotovoltaique(puissanceKwc: number): typeof TVA_PV_ECO_2026 | typeof TVA_PV_NORMALE {
  const lecture = lireReglementairePv(puissanceKwc);
  if (lecture.tauxTva === 0.055 || lecture.tauxTva === 0.2) return lecture.tauxTva;
  if (!(puissanceKwc > 0)) return TVA_PV_ECO_2026;
  return puissanceKwc <= SEUIL_TVA_PV_KWC ? TVA_PV_ECO_2026 : TVA_PV_NORMALE;
}

export function labelTvaPhotovoltaique(puissanceKwc: number): string {
  const lecture = lireReglementairePv(puissanceKwc);
  const taux = tauxTvaPhotovoltaique(puissanceKwc);
  const base =
    taux === TVA_PV_ECO_2026
      ? "5,5 % (hypothèse ≤ 9 kWc)"
      : "20 % (hypothèse > 9 kWc)";
  if (lecture.statut !== "valide") return `${base} — à vérifier`;
  return base;
}

export function tranchePrimeAutoconso(puissanceKwc: number): TranchePrimePv {
  if (!(puissanceKwc > 0) || puissanceKwc > 100) return "hors_bareme";
  if (puissanceKwc <= 9) return "<=9";
  if (puissanceKwc <= 36) return "9-36";
  return "36-100";
}

/** Prime €/kWc lue dans la table. 0 si absente ou hors barème. Jamais un montant définitif. */
export function primeAutoconsoEurParKwc(puissanceKwc: number): number {
  return lireReglementairePv(puissanceKwc).primeEurParKwc ?? 0;
}

export function primeAutoconsoTotale(puissanceKwc: number): number {
  return lireReglementairePv(puissanceKwc).primeTotale ?? 0;
}

export function tarifSurplusEurKwh(puissanceKwc = 9): number {
  return lireReglementairePv(puissanceKwc).tarifSurplusEurKwh ?? 0;
}

export function revenuSurplusAnnuel(productionAnnuelleKwh: number, tauxAutoconso = 0.6): number {
  const surplus = Math.max(0, 1 - tauxAutoconso);
  return round2(productionAnnuelleKwh * surplus * tarifSurplusEurKwh());
}

export function estLignePhotovoltaique(ligne: {
  posteId?: string;
  unite?: string;
  categorieMetierId?: string;
  nom?: string;
}): boolean {
  if (ligne.posteId === "panneaux_photovoltaiques") return true;
  if (ligne.categorieMetierId === "photovoltaique") return true;
  if (ligne.unite === "kWc" || ligne.unite === "panneau") return true;
  return /(photovolta|panneau solaire|\bpv\b)/i.test(ligne.nom ?? "");
}

/** Lignes qui portent réellement la puissance (pas onduleurs, batteries, raccordement, maintenance). */
export function estLignePuissancePv(ligne: {
  posteId?: string;
  unite?: string;
  nom?: string;
}): boolean {
  if (ligne.unite === "kWc" || ligne.posteId === "panneaux_photovoltaiques") return true;
  if (ligne.unite === "panneau") return true;
  return /panneaux?\s+dualsun|dualsun\s+(flash|spring)/i.test(ligne.nom ?? "");
}

/** Puissance kWc d’une ligne : 1 panneau 500 Wc = 0,5 kWc. */
export function kwcDepuisLignePv(ligne: {
  posteId?: string;
  unite?: string;
  nom?: string;
  quantite?: number;
}): number {
  const qte = Number(ligne.quantite);
  if (!Number.isFinite(qte) || qte <= 0) return 0;
  if (!estLignePuissancePv(ligne)) return 0;
  if (ligne.unite === "kWc" || ligne.posteId === "panneaux_photovoltaiques") return qte;
  const match = (ligne.nom ?? "").match(/(\d+(?:[.,]\d+)?)\s*wc/i);
  const wc = match ? Number(String(match[1]).replace(",", ".")) : 500;
  return qte * (wc / 1000);
}

export function puissanceKwcDepuisLignes(
  lignes: Array<{ posteId?: string; unite?: string; categorieMetierId?: string; nom?: string; quantite?: number }>,
): number {
  return round2((lignes ?? []).reduce((somme, ligne) => somme + kwcDepuisLignePv(ligne), 0));
}

/**
 * Recommandation de batterie LFP (3,5 à 30 kWh) — indicative, jamais obligatoire.
 */
export function recommanderBatterieKwh(
  puissanceKwc: number,
  consoAnnuelleKwh?: number,
  options?: OptionsBatteriePv,
): number {
  if (!(puissanceKwc > 0)) return 0;
  const conso = options?.consoAnnuelleKwh ?? consoAnnuelleKwh;
  const puissanceUtile =
    options?.puissanceDispoKwc && options.puissanceDispoKwc > 0
      ? Math.min(puissanceKwc, options.puissanceDispoKwc)
      : puissanceKwc;
  const depuisPv = puissanceUtile * BATTERIE_KWH_PAR_KWC;
  const depuisConso = conso && conso > 0 ? (conso / 365) * 0.7 : depuisPv;
  let brute = Math.max(depuisPv, depuisConso);
  const profil = options?.profilConso ?? "inconnu";
  if (profil === "residentiel_soir") brute *= 1.2;
  if (profil === "residentiel_jour") brute *= 0.85;
  if (profil === "professionnel") brute *= 1.1;
  const cible = options?.tauxAutoconsoCible;
  if (cible != null && Number.isFinite(cible) && cible > 0) {
    brute *= 0.7 + Math.min(1, cible) * 0.6;
  }
  return Math.min(BATTERIE_MAX_KWH, Math.max(BATTERIE_MIN_KWH, round05(brute)));
}

export type RecapPhotovoltaique2026 = {
  version: string;
  puissanceKwc: number;
  tauxTva: number;
  labelTva: string;
  primeEurParKwc: number | null;
  primeTotale: number | null;
  tarifAchatEurKwh: number | null;
  batterieRecommandeeKwh: number;
  alerteTarifRachat: string;
  statutReglementaire: LectureReglementairePv["statut"];
  sourcePrime: string | null;
  sourceTarif: string | null;
  dateVerification: string | null;
  aidesPresenteesCommeDefinitives: false;
};

export function recapPhotovoltaique2026(
  puissanceKwc: number,
  consoAnnuelleKwh?: number,
  optionsBatterie?: OptionsBatteriePv,
): RecapPhotovoltaique2026 {
  const kwc = Number.isFinite(puissanceKwc) && puissanceKwc > 0 ? puissanceKwc : 0;
  const lecture = lireReglementairePv(kwc);
  return {
    version: PV_BAREME_VERSION,
    puissanceKwc: kwc,
    tauxTva: tauxTvaPhotovoltaique(kwc),
    labelTva: labelTvaPhotovoltaique(kwc),
    primeEurParKwc: lecture.primeEurParKwc,
    primeTotale: lecture.primeTotale,
    tarifAchatEurKwh: lecture.tarifSurplusEurKwh,
    batterieRecommandeeKwh: recommanderBatterieKwh(kwc, consoAnnuelleKwh, optionsBatterie),
    alerteTarifRachat: lecture.alerte ?? ALERTE_DONNEES_NON_VALIDEES,
    statutReglementaire: lecture.statut,
    sourcePrime: lecture.sourcePrime,
    sourceTarif: lecture.sourceTarif,
    dateVerification: lecture.dateVerification,
    aidesPresenteesCommeDefinitives: false,
  };
}

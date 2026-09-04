/**
 * Données réglementaires photovoltaïques — séparées du moteur de chiffrage.
 *
 * Modifier ce fichier (périodes, tranches, tarifs, sources, statut) sans
 * réécrire `photovoltaique-installation.ts` ni le catalogue.
 * Aucune aide ni tarif n’est présenté comme définitif tant que statut ≠ « valide ».
 */

export const STATUTS_DONNEE_PV = ["valide", "a_verifier"] as const;
export type StatutDonneePv = (typeof STATUTS_DONNEE_PV)[number];

export const MODES_AUTOCONSO_PV = [
  "autoconsommation_surplus",
  "autoconsommation_totale",
  "vente_totale",
] as const;
export type ModeAutoconsoPv = (typeof MODES_AUTOCONSO_PV)[number];

export type TrancheReglementairePv = {
  id: string;
  periodeApplication: string;
  dateDebut: string;
  dateFin: string | null;
  puissanceMinKwc: number;
  puissanceMaxKwc: number;
  modeAutoconsommation: ModeAutoconsoPv;
  tarifSurplusEurKwh: number | null;
  primeEurParKwc: number | null;
  tauxTva: number | null;
  source: string;
  dateVerification: string | null;
  statut: StatutDonneePv;
  notes: string;
};

export const ALERTE_DONNEES_NON_VALIDEES =
  "Données réglementaires à vérifier. Aucune aide, prime ou tarif de rachat n’est définitif sans source validée.";

export const MENTION_AIDES_NON_DEFINITIVES =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH, CEE et barème officiel en vigueur.";

/**
 * Jeu de données 2026 — statut « à vérifier ».
 * Les montants ci-dessous sont des hypothèses de travail, pas un barème officiel validé.
 */
export const TRANCHES_REGLEMENTAIRES_PV: TrancheReglementairePv[] = [
  {
    id: "tva-eco-jusqua-9",
    periodeApplication: "2026",
    dateDebut: "2026-01-01",
    dateFin: null,
    puissanceMinKwc: 0,
    puissanceMaxKwc: 9,
    modeAutoconsommation: "autoconsommation_surplus",
    tarifSurplusEurKwh: null,
    primeEurParKwc: null,
    tauxTva: 0.055,
    source: "TVA écologique résidentielle — à confirmer selon âge du logement et conditions fiscales",
    dateVerification: null,
    statut: "a_verifier",
    notes: "Ne pas présenter 5,5 % comme acquis sans vérification fiscale du dossier.",
  },
  {
    id: "tva-normale-plus-9",
    periodeApplication: "2026",
    dateDebut: "2026-01-01",
    dateFin: null,
    puissanceMinKwc: 9.001,
    puissanceMaxKwc: 100,
    modeAutoconsommation: "autoconsommation_surplus",
    tarifSurplusEurKwh: null,
    primeEurParKwc: null,
    tauxTva: 0.2,
    source: "TVA de droit commun si puissance > 9 kWc — à confirmer",
    dateVerification: null,
    statut: "a_verifier",
    notes: "Seuil 9 kWc indicatif, à valider selon la réglementation en vigueur à la date de demande.",
  },
  {
    id: "prime-autoconso-jusqua-9",
    periodeApplication: "2026 — hypothèse de travail",
    dateDebut: "2026-01-01",
    dateFin: null,
    puissanceMinKwc: 0,
    puissanceMaxKwc: 9,
    modeAutoconsommation: "autoconsommation_surplus",
    tarifSurplusEurKwh: null,
    primeEurParKwc: 80,
    tauxTva: null,
    source: "Non validée — ne pas utiliser comme barème officiel",
    dateVerification: null,
    statut: "a_verifier",
    notes: "Prime éventuelle d’autoconsommation. Montant hypothétique, à remplacer dès source officielle.",
  },
  {
    id: "prime-autoconso-9-36",
    periodeApplication: "2026 — hypothèse de travail",
    dateDebut: "2026-01-01",
    dateFin: null,
    puissanceMinKwc: 9.001,
    puissanceMaxKwc: 36,
    modeAutoconsommation: "autoconsommation_surplus",
    tarifSurplusEurKwh: null,
    primeEurParKwc: 120,
    tauxTva: null,
    source: "Non validée — ne pas utiliser comme barème officiel",
    dateVerification: null,
    statut: "a_verifier",
    notes: "Prime éventuelle d’autoconsommation. Montant hypothétique, à remplacer dès source officielle.",
  },
  {
    id: "prime-autoconso-36-100",
    periodeApplication: "2026 — hypothèse de travail",
    dateDebut: "2026-01-01",
    dateFin: null,
    puissanceMinKwc: 36.001,
    puissanceMaxKwc: 100,
    modeAutoconsommation: "autoconsommation_surplus",
    tarifSurplusEurKwh: null,
    primeEurParKwc: 60,
    tauxTva: null,
    source: "Non validée — ne pas utiliser comme barème officiel",
    dateVerification: null,
    statut: "a_verifier",
    notes: "Prime éventuelle d’autoconsommation. Montant hypothétique, à remplacer dès source officielle.",
  },
  {
    id: "tarif-surplus-oa",
    periodeApplication: "2026 — hypothèse de travail",
    dateDebut: "2026-01-01",
    dateFin: null,
    puissanceMinKwc: 0,
    puissanceMaxKwc: 100,
    modeAutoconsommation: "autoconsommation_surplus",
    tarifSurplusEurKwh: 0.011,
    primeEurParKwc: null,
    tauxTva: null,
    source: "Non validée — tarif de rachat / surplus à confirmer (EDF OA ou équivalent)",
    dateVerification: null,
    statut: "a_verifier",
    notes: "Ne jamais afficher ce tarif comme définitif. Mettre à jour ici sans modifier le moteur.",
  },
];

function dateDansPeriode(iso: string, debut: string, fin: string | null): boolean {
  if (iso < debut) return false;
  if (fin && iso > fin) return false;
  return true;
}

function puissanceDansTranche(kwc: number, min: number, max: number): boolean {
  return kwc >= min && kwc <= max;
}

export function tranchesApplicables(
  puissanceKwc: number,
  options?: {
    dateIso?: string;
    mode?: ModeAutoconsoPv;
    jeu?: TrancheReglementairePv[];
  },
): TrancheReglementairePv[] {
  const kwc = Number(puissanceKwc);
  const dateIso = options?.dateIso ?? new Date().toISOString().slice(0, 10);
  const jeu = options?.jeu ?? TRANCHES_REGLEMENTAIRES_PV;
  if (!Number.isFinite(kwc) || kwc <= 0) return [];
  return jeu.filter((tranche) => {
    if (!dateDansPeriode(dateIso, tranche.dateDebut, tranche.dateFin)) return false;
    if (!puissanceDansTranche(kwc, tranche.puissanceMinKwc, tranche.puissanceMaxKwc)) return false;
    if (options?.mode && tranche.modeAutoconsommation !== options.mode) return false;
    return true;
  });
}

export function donneesReglementairesValidees(
  tranches: TrancheReglementairePv[] = TRANCHES_REGLEMENTAIRES_PV,
): boolean {
  return tranches.length > 0 && tranches.every((item) => item.statut === "valide");
}

export function alerteReglementaire(
  tranches: TrancheReglementairePv[],
): string | null {
  if (tranches.length === 0) {
    return "Aucune donnée réglementaire applicable à cette puissance / période. Ne pas afficher d’aide.";
  }
  if (tranches.some((item) => item.statut !== "valide")) {
    return ALERTE_DONNEES_NON_VALIDEES;
  }
  return null;
}

export type LectureReglementairePv = {
  puissanceKwc: number;
  tauxTva: number | null;
  primeEurParKwc: number | null;
  primeTotale: number | null;
  tarifSurplusEurKwh: number | null;
  sourceTva: string | null;
  sourcePrime: string | null;
  sourceTarif: string | null;
  dateVerification: string | null;
  statut: StatutDonneePv;
  alerte: string | null;
  tranches: TrancheReglementairePv[];
};

export function lireReglementairePv(
  puissanceKwc: number,
  options?: { dateIso?: string; mode?: ModeAutoconsoPv },
): LectureReglementairePv {
  const kwc = Number.isFinite(puissanceKwc) && puissanceKwc > 0 ? puissanceKwc : 0;
  const tranches = kwc > 0 ? tranchesApplicables(kwc, options) : [];
  const tva = tranches.find((item) => item.tauxTva != null);
  const prime = tranches.find((item) => item.primeEurParKwc != null);
  const tarif = tranches.find((item) => item.tarifSurplusEurKwh != null);
  const statut: StatutDonneePv = donneesReglementairesValidees(tranches) ? "valide" : "a_verifier";
  const primeEur = prime?.primeEurParKwc ?? null;
  return {
    puissanceKwc: kwc,
    tauxTva: tva?.tauxTva ?? null,
    primeEurParKwc: primeEur,
    primeTotale:
      primeEur != null && kwc > 0 ? Math.round((kwc * primeEur + Number.EPSILON) * 100) / 100 : null,
    tarifSurplusEurKwh: tarif?.tarifSurplusEurKwh ?? null,
    sourceTva: tva?.source ?? null,
    sourcePrime: prime?.source ?? null,
    sourceTarif: tarif?.source ?? null,
    dateVerification: tva?.dateVerification ?? prime?.dateVerification ?? tarif?.dateVerification ?? null,
    statut,
    alerte: kwc > 0 ? alerteReglementaire(tranches) : ALERTE_DONNEES_NON_VALIDEES,
    tranches,
  };
}

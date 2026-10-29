/**
 * Ratios économiques de direction — chiffrage express.
 * Les opérations nommées sont des cas types. Les autres lots reprennent
 * la médiane catalogue et les ratios marché 2026 (matériel / pose / marge).
 * Les aides restent indicatives et ne réduisent pas la marge HT.
 */

import { PROFIL_RATIO_PAR_CATEGORIE, RATIOS_MARCHE_2026 } from "./sousTraitanceDoubleMode.js";

export type NatureRatio = "projet-type" | "repere-unitaire" | "a-confirmer";

export type RatioDirection = {
  code: string;
  libelle: string;
  nature: NatureRatio;
  materielHt: number | null;
  poseHt: number | null;
  revientHt: number | null;
  venteHt: number | null;
  primeHt: number | null;
  primeLibelle: string;
  racHt: number | null;
  racUnite: "HT" | "TTC";
  margeHt: number | null;
  margePct: number | null;
  materielLibelle?: string;
  poseLibelle?: string;
  venteLibelle?: string;
  racLibelle?: string;
  mention: string;
};

export type LigneRepereLot = {
  categorieId: string;
  baseHt: number | null;
};

const MENTION_AIDES =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon éligibilité réelle. Montants définitifs après instruction ANAH et CEE. La marge nette est le prix de vente HT diminué du coût de revient, avant versement des aides au client.";

function projet(
  partiel: Omit<RatioDirection, "revientHt" | "racHt" | "racUnite" | "mention"> & {
    mention?: string;
    racHt?: number | null;
    racUnite?: "HT" | "TTC";
  },
): RatioDirection {
  const revient =
    partiel.materielHt == null && partiel.poseHt == null
      ? null
      : Math.round((partiel.materielHt ?? 0) + (partiel.poseHt ?? 0));
  const rac =
    partiel.racHt !== undefined
      ? partiel.racHt
      : partiel.venteHt != null && partiel.primeHt != null
        ? Math.round(partiel.venteHt - partiel.primeHt)
        : null;
  return {
    ...partiel,
    revientHt: revient,
    racHt: rac,
    racUnite: partiel.racUnite ?? "HT",
    mention: partiel.mention ?? MENTION_AIDES,
  };
}

/** IND-UT-117 — cas express usine. 8 000 + 4 500 = 12 500 ; 45 000 − 12 500 = 32 500 (72 %). */
export const RATIO_IND_UT_117: RatioDirection = projet({
  code: "IND-UT-117",
  libelle: "Récupération de chaleur fatale — compresseur d’air",
  nature: "projet-type",
  materielHt: 8000,
  poseHt: 4500,
  venteHt: 45000,
  primeHt: 35000,
  primeLibelle: "Prime CEE indicative (cours EMMY, cas express)",
  margeHt: 32500,
  margePct: 72,
});

/** BAT-TH-116 — GTB Décret BACS. 12 500 + 6 500 = 19 000 ; 55 000 − 19 000 = 36 000 (65 %). RAC 55 000 − 38 000 = 17 000. */
export const RATIO_BAT_TH_116: RatioDirection = projet({
  code: "BAT-TH-116",
  libelle: "GTB tertiaire — Décret BACS",
  nature: "projet-type",
  materielHt: 12500,
  poseHt: 6500,
  venteHt: 55000,
  primeHt: 38000,
  primeLibelle: "Prise en charge CEE estimée",
  margeHt: 36000,
  margePct: 65,
  materielLibelle: "Coût matériel — automates et capteurs HT",
  poseLibelle: "Pose, câblage et programmation HT",
  venteLibelle: "Facturé client tertiaire HT",
  racLibelle: "Reste à charge client tertiaire HT",
});

/** IND-UT-121 — matelas isolants. 6 500 + 3 500 = 10 000 ; 32 000 − 10 000 = 22 000 (68 %). RAC 32 000 − 28 000 = 4 000. */
export const RATIO_IND_UT_121: RatioDirection = projet({
  code: "IND-UT-121",
  libelle: "Matelas isolants de réseaux industriels",
  nature: "projet-type",
  materielHt: 6500,
  poseHt: 3500,
  venteHt: 32000,
  primeHt: 28000,
  primeLibelle: "Prise en charge CEE (opération quasi blanche)",
  margeHt: 22000,
  margePct: 68,
  materielLibelle: "Coût matériel — matelas thermiques sur-mesure T° > 150 °C HT",
  poseLibelle: "Pose et poseurs calorifugeurs (2 jours) HT",
  venteLibelle: "Facturé client usine HT",
  racLibelle: "Reste à charge usine HT",
});

/** BAT-TH-140 — PAC collective. 22 000 + 11 000 = 33 000 ; 75 000 − 33 000 = 42 000 (56 %). RAC 75 000 − 48 000 = 27 000. */
export const RATIO_BAT_TH_140: RatioDirection = projet({
  code: "BAT-TH-140",
  libelle: "PAC collective tertiaire",
  nature: "projet-type",
  materielHt: 22000,
  poseHt: 11000,
  venteHt: 75000,
  primeHt: 48000,
  primeLibelle: "Prise en charge CEE estimée",
  margeHt: 42000,
  margePct: 56,
  materielLibelle: "Coût matériel — groupes extérieurs et ballons tampons HT",
  poseLibelle: "Pose, raccordement hydraulique et mise en service HT",
  venteLibelle: "Facturé client tertiaire HT",
  racLibelle: "Reste à charge client tertiaire HT",
});

/** BAR-TH-104 — PAC air/eau. 6 800 + 2 500 = 9 300 ; 13 500 − 9 300 = 4 200. */
export const RATIO_BAR_TH_104: RatioDirection = projet({
  code: "BAR-TH-104",
  libelle: "PAC air/eau résidentielle",
  nature: "projet-type",
  materielHt: 6800,
  poseHt: 2500,
  venteHt: 13500,
  primeHt: 4000,
  primeLibelle: "Coup de pouce CEE indicatif",
  margeHt: 4200,
  margePct: 31,
});

/**
 * BAR-TH-164 — dossier standard 35 k€ HT.
 * Sous-traitance 29 800 + honoraires CG 5 200 = 35 000 (15 %).
 * RAC 9 308 € TTC : TTC travaux du cas Brunel (37 128 €) − aides 27 820 €.
 * Ne pas recalculer 35 000 − 27 820.
 */
export const RATIO_BAR_TH_164: RatioDirection = projet({
  code: "BAR-TH-164",
  libelle: "Rénovation globale résidentielle",
  nature: "projet-type",
  materielHt: 0,
  poseHt: 29800,
  venteHt: 35000,
  primeHt: 27820,
  primeLibelle: "Aides globales (MaPrimeRénov' + CEE), estimation indicative",
  margeHt: 5200,
  margePct: 15,
  racHt: 9308,
  racUnite: "TTC",
  poseLibelle: "Sous-traitance travaux tous corps d'état HT",
  venteLibelle: "Facturé client HT",
  racLibelle: "Reste à charge client final TTC",
  mention:
    "Cas dossier standard : facturé 35 000 € HT, sous-traitance artisans 29 800 € HT, honoraires de contractant général 5 200 € HT (15 %). Aides globales indicatives environ 27 820 €. Le reste à charge d'environ 9 308 € TTC correspond au TTC travaux diminué de ces aides. " +
    MENTION_AIDES,
});

const OFFICIELS_PAR_LOT: Record<string, RatioDirection> = {
  "pompe-a-chaleur": RATIO_BAR_TH_104,
  "renovation-globale": RATIO_BAR_TH_164,
};

function vide(categorieId: string): RatioDirection {
  return {
    code: categorieId,
    libelle: "Chiffrage express à confirmer",
    nature: "a-confirmer",
    materielHt: null,
    poseHt: null,
    revientHt: null,
    venteHt: null,
    primeHt: null,
    primeLibelle: "Selon éligibilité du lot",
    racHt: null,
    racUnite: "HT",
    margeHt: null,
    margePct: null,
    mention: "Aucun repère de prix catalogue sur ce lot. " + MENTION_AIDES,
  };
}

export function ratioPourCategorie(categorieId: string, lignes: LigneRepereLot[] = []): RatioDirection {
  const officiel = OFFICIELS_PAR_LOT[categorieId];
  if (officiel) return officiel;

  const bases = lignes
    .filter((ligne) => ligne.categorieId === categorieId && ligne.baseHt != null && ligne.baseHt > 0)
    .map((ligne) => Number(ligne.baseHt))
    .sort((a, b) => a - b);
  if (!bases.length) return vide(categorieId);

  const median = bases[Math.floor(bases.length / 2)];
  const profilId = PROFIL_RATIO_PAR_CATEGORIE[categorieId] || "second_oeuvre";
  const ratios = RATIOS_MARCHE_2026[profilId] || RATIOS_MARCHE_2026.second_oeuvre;
  const vente = Math.round(median);
  const materiel = Math.round(vente * Number(ratios.materiel));
  const marge = Math.round(vente * Number(ratios.marge));
  const pose = vente - materiel - marge;
  return projet({
    code: categorieId,
    libelle: "Repère unitaire catalogue",
    nature: "repere-unitaire",
    materielHt: materiel,
    poseHt: pose,
    venteHt: vente,
    primeHt: null,
    primeLibelle: "Prime non chiffrée sur le repère unitaire",
    margeHt: marge,
    margePct: Math.round(Number(ratios.marge) * 100),
    mention:
      "Repère unitaire HT (médiane catalogue), ventilé selon les ratios marché 2026. Ce n’est pas un budget de chantier. " +
      MENTION_AIDES,
  });
}

export function euroHt(montant: number | null): string {
  return euroAvecUnite(montant, "HT");
}

export function euroAvecUnite(montant: number | null, unite: "HT" | "TTC" | "EUR" = "HT"): string {
  if (montant == null || !Number.isFinite(montant)) return "À confirmer";
  const valeur = `${montant.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;
  return unite === "EUR" ? valeur : `${valeur} ${unite}`;
}

const RATIOS_STRATEGIQUES: Record<string, RatioDirection> = {
  "IND-UT-117": RATIO_IND_UT_117,
  "IND-UT-121": RATIO_IND_UT_121,
  "BAT-TH-116": RATIO_BAT_TH_116,
  "BAT-TH-140": RATIO_BAT_TH_140,
  "BAR-TH-164": RATIO_BAR_TH_164,
};

export function ratioStrategiqueParCode(code: string): RatioDirection | null {
  return RATIOS_STRATEGIQUES[code] ?? null;
}

export function pctMarge(taux: number | null): string {
  if (taux == null || !Number.isFinite(taux)) return "—";
  return `${taux.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} %`;
}

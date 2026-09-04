/**
 * Dimensionnement d’installation PV 500 Wc → 100 kWc.
 * Panneaux 500 Wc. Pas de règle de trois sur les forfaits.
 * Les aides / tarifs de rachat restent dans photovoltaique-reglementaire.ts.
 */

import { TAUX_MARGE } from "../chiffrage/constantes";
import {
  recommanderBatterieKwh,
  round2,
  tauxTvaPhotovoltaique,
  type OptionsBatteriePv,
} from "./photovoltaique-2026";

export const PV_PANNEAU_WC = 500;
export const PV_PUISSANCE_MIN_KWC = 0.5;
export const PV_PUISSANCE_MAX_KWC = 100;
/** Kit structure minimum (petites toitures). */
export const PV_RAILS_QTE_MIN = 4;
export const PV_CROCHETS_QTE_MIN = 4;
/** Un lot câbles variable pour 6 panneaux au-delà du forfait de base. */
export const PV_CABLES_PANNEAUX_PAR_LOT = 6;

export const MENTION_ESTIMATION_PV =
  "Estimation à confirmer par devis fournisseur ou artisan.";

export const ALERTE_ONDULEUR_CENTRAL =
  "Le choix de l’onduleur dépend de la puissance, du calepinage, de l’ombrage, de l’étude électrique et de la validation de l’installateur.";

export const MENTION_BATTERIE_DIMENSIONNEMENT =
  "Le dimensionnement final de la batterie dépend de la consommation réelle, du profil de charge et de l’étude technique.";

export const MENTION_POSE_NON_CUMUL =
  "Ne pas cumuler une pose forfaitaire / variable avec la main-d’œuvre déjà incluse dans les équipements.";

export const MENTION_STRUCTURE_NON_CUMUL =
  "Crochets et supports : n’activer que si distincts des rails et fixations, pour éviter un double comptage.";

export const IDS_PV_INTERNES = ["pv-frais-clyve"] as const;

export const ID_COFFRET_AC_DC = "pv-coffret-ac-dc";
export const ID_RAILS = "pv-rails-fixations";
export const ID_CROCHETS = "pv-crochets-supports";
export const ID_CABLES_FIXE = "pv-cables-forfait-base";
export const ID_CABLES_VARIABLE = "pv-cables-connectique";
export const ID_POSE_FIXE = "pv-pose-forfait";
export const ID_POSE_VARIABLE = "pv-pose-variable";
export const ID_COORDINATION = "pv-coordination-energia";
export const ID_FRAIS_CLYVE = "pv-frais-clyve";

export type ArchitecturePv = "micro" | "central" | "aucune";

export type NatureQuantitePv =
  | "forfait"
  | "par_panneau"
  | "micro"
  | "central"
  | "rails"
  | "crochets"
  | "cables_fixe"
  | "cables_variable"
  | "pose_fixe"
  | "pose_variable"
  | "batterie"
  | "interne"
  | "autre";

export type AnalysePuissancePv = {
  ok: boolean;
  puissanceKwc: number;
  nombrePanneaux: number;
  alerte: string | null;
  correspondance: string | null;
};

export function nombrePanneaux500Wc(puissanceKwc: number): number {
  return (Number(puissanceKwc) * 1000) / PV_PANNEAU_WC;
}

export function puissanceEstEntiereEnPanneaux(puissanceKwc: number): boolean {
  const n = nombrePanneaux500Wc(puissanceKwc);
  if (!Number.isFinite(n) || n <= 0) return false;
  return Math.abs(n - Math.round(n)) < 1e-9;
}

export function libelleCorrespondancePanneaux(puissanceKwc: number, nombrePanneaux: number): string {
  const kwc = Number(puissanceKwc);
  const libelleKwc = kwc === 0.5 ? "500 Wc" : `${kwc} kWc`;
  return `${libelleKwc} = ${nombrePanneaux} panneau${nombrePanneaux > 1 ? "x" : ""} de 500 Wc`;
}

export function analyserPuissancePv(puissanceKwc: number): AnalysePuissancePv {
  const kwc = Number(puissanceKwc);
  if (!Number.isFinite(kwc) || kwc <= 0) {
    return {
      ok: false,
      puissanceKwc: 0,
      nombrePanneaux: 0,
      alerte: "Indiquez une puissance entre 500 Wc et 100 kWc.",
      correspondance: null,
    };
  }
  if (kwc < PV_PUISSANCE_MIN_KWC || kwc > PV_PUISSANCE_MAX_KWC) {
    return {
      ok: false,
      puissanceKwc: kwc,
      nombrePanneaux: 0,
      alerte: `Puissance hors plage : autorisée de ${PV_PUISSANCE_MIN_KWC} kWc (500 Wc) à ${PV_PUISSANCE_MAX_KWC} kWc.`,
      correspondance: null,
    };
  }
  const brut = nombrePanneaux500Wc(kwc);
  if (!puissanceEstEntiereEnPanneaux(kwc)) {
    const inferieur = Math.floor(brut);
    const superieur = Math.ceil(brut);
    return {
      ok: false,
      puissanceKwc: kwc,
      nombrePanneaux: round2(brut),
      alerte: `Cette puissance ne correspond pas à un nombre entier de panneaux de 500 Wc (actuellement ${brut.toLocaleString("fr-FR")} panneaux). Utilisez ${(inferieur * PV_PANNEAU_WC) / 1000} kWc (${inferieur} panneaux) ou ${(superieur * PV_PANNEAU_WC) / 1000} kWc (${superieur} panneaux).`,
      correspondance: null,
    };
  }
  const nombrePanneaux = Math.round(brut);
  return {
    ok: true,
    puissanceKwc: kwc,
    nombrePanneaux,
    alerte: null,
    correspondance: libelleCorrespondancePanneaux(kwc, nombrePanneaux),
  };
}

export function quantiteMicroOnduleurs(nombrePanneaux: number): number {
  return Math.max(0, Math.round(nombrePanneaux));
}

export function quantiteOnduleurCentralise(): number {
  return 1;
}

export function quantiteRailsFixations(nombrePanneaux: number): number {
  if (!(nombrePanneaux > 0)) return 0;
  return Math.max(PV_RAILS_QTE_MIN, Math.round(nombrePanneaux));
}

export function quantiteCrochetsSupports(nombrePanneaux: number): number {
  if (!(nombrePanneaux > 0)) return 0;
  return Math.max(PV_CROCHETS_QTE_MIN, Math.round(nombrePanneaux));
}

export function quantiteCablesPartFixe(nombrePanneaux: number): number {
  return nombrePanneaux > 0 ? 1 : 0;
}

export function quantiteCablesPartVariable(nombrePanneaux: number): number {
  if (!(nombrePanneaux > 0)) return 0;
  return Math.max(0, Math.ceil(Math.round(nombrePanneaux) / PV_CABLES_PANNEAUX_PAR_LOT) - 1);
}

/** Conservé pour les totaux combinés : forfait 1 + lots extra = ceil(n/6), min 1. */
export function quantiteCablesConnectique(nombrePanneaux: number): number {
  if (!(nombrePanneaux > 0)) return 0;
  return Math.max(1, Math.ceil(Math.round(nombrePanneaux) / PV_CABLES_PANNEAUX_PAR_LOT));
}

export function quantitePoseFixe(nombrePanneaux: number): number {
  return nombrePanneaux > 0 ? 1 : 0;
}

export function quantitePoseVariable(nombrePanneaux: number): number {
  return Math.max(0, Math.round(nombrePanneaux));
}

export function quantiteForfaitPv(): number {
  return 1;
}

export function estPrestationPvInterne(id: string): boolean {
  return (IDS_PV_INTERNES as readonly string[]).includes(id);
}

export function architectureDepuisSousCategorie(sousCategorieId?: string, nom?: string): ArchitecturePv {
  const id = (sousCategorieId ?? "").toLowerCase();
  const libelle = (nom ?? "").toLowerCase();
  if (id.includes("micro-onduleur") || libelle.includes("micro-onduleur")) return "micro";
  if (id.includes("onduleur-centralise") || libelle.includes("onduleur centralisé") || libelle.includes("onduleur centralise")) {
    return "central";
  }
  return "aucune";
}

export function natureQuantitePv(prestation: {
  id: string;
  unite: string;
  sousCategorieId: string;
  nom: string;
}): NatureQuantitePv {
  if (estPrestationPvInterne(prestation.id)) return "interne";
  const arch = architectureDepuisSousCategorie(prestation.sousCategorieId, prestation.nom);
  const sous = prestation.sousCategorieId.toLowerCase();
  const nom = prestation.nom.toLowerCase();
  if (prestation.id === ID_CABLES_FIXE) return "cables_fixe";
  if (prestation.id === ID_CABLES_VARIABLE) return "cables_variable";
  if (prestation.id === ID_POSE_FIXE) return "pose_fixe";
  if (prestation.id === ID_POSE_VARIABLE) return "pose_variable";
  if (prestation.id === ID_RAILS) return "rails";
  if (prestation.id === ID_CROCHETS) return "crochets";
  if (arch === "micro") return "micro";
  if (arch === "central") return "central";
  if (sous.includes("batterie") || nom.includes("batterie")) return "batterie";
  if (prestation.unite === "panneau" || /dualsun|panneaux?\s/i.test(prestation.nom)) return "par_panneau";
  if (prestation.unite === "forfait") return "forfait";
  return "autre";
}

export function lignesOntArchitecture(
  lignes: Array<{ sousCategorieId?: string; nom?: string }>,
  cible: Exclude<ArchitecturePv, "aucune">,
): boolean {
  return lignes.some(
    (ligne) => architectureDepuisSousCategorie(ligne.sousCategorieId, ligne.nom) === cible,
  );
}

export function architectureDepuisLignes(
  lignes: Array<{ sousCategorieId?: string; nom?: string }>,
): ArchitecturePv {
  const micro = lignesOntArchitecture(lignes, "micro");
  const central = lignesOntArchitecture(lignes, "central");
  if (micro && central) return "micro";
  if (micro) return "micro";
  if (central) return "central";
  return "aucune";
}

export function conflitMicroEtCentral(
  existante: ArchitecturePv,
  choisie: ArchitecturePv,
): boolean {
  if (choisie === "aucune" || existante === "aucune") return false;
  return existante !== choisie;
}

export function kwhDepuisNomBatterie(nom: string): number | null {
  const match = nom.match(/(\d+(?:[.,]\d+)?)\s*kWh/i);
  if (!match) return null;
  const n = Number(String(match[1]).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function batterieIndicativeProche(
  puissanceKwc: number,
  capacitesCatalogueKwh: number[],
  consoAnnuelleKwh?: number,
  options?: OptionsBatteriePv,
): { recommandeeKwh: number; catalogueProcheKwh: number | null } {
  const recommandeeKwh = recommanderBatterieKwh(puissanceKwc, consoAnnuelleKwh, options);
  if (!(recommandeeKwh > 0) || capacitesCatalogueKwh.length === 0) {
    return { recommandeeKwh, catalogueProcheKwh: null };
  }
  let meilleure = capacitesCatalogueKwh[0];
  let ecart = Math.abs(meilleure - recommandeeKwh);
  for (const cap of capacitesCatalogueKwh) {
    const d = Math.abs(cap - recommandeeKwh);
    if (d < ecart) {
      meilleure = cap;
      ecart = d;
    }
  }
  return { recommandeeKwh, catalogueProcheKwh: meilleure };
}

export function tauxTvaLignePv(params: {
  puissanceKwc: number;
  sousCategorieNom?: string;
  tauxCatalogue?: number;
}): number {
  const sous = (params.sousCategorieNom ?? "").toLowerCase();
  if (sous.includes("maintenance")) return 0.2;
  return tauxTvaPhotovoltaique(params.puissanceKwc);
}

export function quantiteProposeeDepuisPrestation(
  prestation: { id: string; unite: string; sousCategorieId: string; nom: string },
  nombrePanneaux: number,
): number {
  if (!(nombrePanneaux > 0)) {
    return 1;
  }
  const nature = natureQuantitePv(prestation);
  switch (nature) {
    case "interne":
      return 1;
    case "forfait":
    case "cables_fixe":
    case "pose_fixe":
    case "batterie":
    case "central":
      return 1;
    case "par_panneau":
    case "micro":
    case "pose_variable":
      return nombrePanneaux;
    case "rails":
      return quantiteRailsFixations(nombrePanneaux);
    case "crochets":
      return quantiteCrochetsSupports(nombrePanneaux);
    case "cables_variable":
      return quantiteCablesPartVariable(nombrePanneaux);
    default:
      return prestation.unite === "forfait" ? 1 : 1;
  }
}

export function quantitePvVerrouillee(prestation: {
  id: string;
  unite: string;
  sousCategorieId: string;
  nom: string;
}, nombrePanneaux: number): { verrouillee: boolean; quantite: number; motif: string | null } {
  const nature = natureQuantitePv(prestation);
  const n = Math.max(0, Math.round(nombrePanneaux));
  if (nature === "forfait" || nature === "cables_fixe" || nature === "pose_fixe" || nature === "interne") {
    return { verrouillee: true, quantite: 1, motif: "Forfait par installation — quantité 1." };
  }
  if (nature === "central") {
    return { verrouillee: true, quantite: 1, motif: "Onduleur centralisé : 1 unité, jamais de micro-onduleurs en plus." };
  }
  if (nature === "par_panneau" && n > 0) {
    return { verrouillee: true, quantite: n, motif: "Quantité = nombre de panneaux (500 Wc)." };
  }
  if (nature === "micro" && n > 0) {
    return {
      verrouillee: true,
      quantite: quantiteMicroOnduleurs(n),
      motif: "Un micro-onduleur par panneau.",
    };
  }
  if (prestation.id === ID_COFFRET_AC_DC) {
    return { verrouillee: true, quantite: 1, motif: "Coffret AC/DC : 1 forfait, jamais × panneaux." };
  }
  return {
    verrouillee: false,
    quantite: quantiteProposeeDepuisPrestation(prestation, n),
    motif: null,
  };
}

/** Prix plancher HT = coût de revient / (1 − marge minimale ENERGIA). */
export function prixPlancherHt(coutRevientHt: number): number {
  const taux = TAUX_MARGE.standardMinimale;
  if (!(coutRevientHt > 0) || !(taux > 0) || taux >= 1) return round2(coutRevientHt);
  return round2(coutRevientHt / (1 - taux));
}

export const PUISSANCES_TEST_PV_KWC = [0.5, 1, 3, 6, 9, 12, 36, 100] as const;

export const PANNEAUX_ATTENDUS_TEST: Record<(typeof PUISSANCES_TEST_PV_KWC)[number], number> = {
  0.5: 1,
  1: 2,
  3: 6,
  6: 12,
  9: 18,
  12: 24,
  36: 72,
  100: 200,
};

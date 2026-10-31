/**
 * Hiérarchie visuelle des travaux sur le devis client.
 * Couleurs sobres — pas d’affichage de coûts internes.
 */

export const PRIORITES_TRAVAUX = [1, 2, 3] as const;
export type PrioriteTravaux = (typeof PRIORITES_TRAVAUX)[number];

export type ContextePrioriteTravaux = {
  posteId?: string | null;
  categorieId?: string | null;
  sousCategorieId?: string | null;
  nom?: string | null;
  designation?: string | null;
  description?: string | null;
  prioriteCatalogue?: PrioriteTravaux | null;
};

type StylePriorite = {
  code: "P1" | "P2" | "P3";
  libelleCourt: string;
  libelle: string;
  usage: string;
  badgeRgb: [number, number, number];
  badgeBg: [number, number, number];
  rowBg: [number, number, number];
  rowBgAlt: [number, number, number];
  barRgb: [number, number, number];
  className: string;
};

export const PRIORITE_TRAVAUX: Record<PrioriteTravaux, StylePriorite> = {
  1: {
    code: "P1",
    libelleCourt: "PILIER DPE",
    libelle: "PILIER DPE — Obligatoire pour les aides",
    usage: "Travaux indispensables au gain de 2 classes DPE minimum.",
    badgeRgb: [20, 83, 45],
    badgeBg: [236, 253, 245],
    rowBg: [247, 252, 249],
    rowBgAlt: [240, 253, 244],
    barRgb: [5, 150, 105],
    className:
      "border-emerald-200/80 bg-emerald-50 text-emerald-900",
  },
  2: {
    code: "P2",
    libelleCourt: "OPTIMISATION",
    libelle: "OPTIMISATION — Gain de confort & performance",
    usage: "Travaux complémentaires (VMC, ECS, coordination).",
    badgeRgb: [26, 60, 94],
    badgeBg: [241, 245, 249],
    rowBg: [248, 250, 252],
    rowBgAlt: [241, 245, 249],
    barRgb: [71, 85, 105],
    className: "border-slate-300 bg-slate-100 text-slate-800",
  },
  3: {
    code: "P3",
    libelleCourt: "OPTION",
    libelle: "OPTION — Confort supplémentaire",
    usage: "Prestations optionnelles hors saut de classe DPE.",
    badgeRgb: [120, 53, 15],
    badgeBg: [255, 251, 235],
    rowBg: [255, 253, 248],
    rowBgAlt: [255, 251, 235],
    barRgb: [180, 83, 9],
    className: "border-amber-200/90 bg-amber-50 text-amber-950",
  },
};

export const OPTIONS_PRIORITE_TRAVAUX: {
  value: PrioriteTravaux;
  label: string;
}[] = PRIORITES_TRAVAUX.map((value) => ({
  value,
  label: `${PRIORITE_TRAVAUX[value].code} · ${PRIORITE_TRAVAUX[value].libelle}`,
}));

export const AVERTISSEMENT_DEVIS_ARTISAN_RGE =
  "Les montants, métrés et spécifications de chaque poste sont à confirmer par devis artisan RGE. Document estimatif — non contractuel.";

const POSTES_P1 = new Set([
  "isolation_combles",
  "isolation_rampants",
  "ite",
  "iti",
  "isolation_planchers",
  "fenetres_portes_fenetres",
  "pac_air_eau",
  "pac_air_air",
]);

const POSTES_P2 = new Set([
  "vmc_simple_flux",
  "vmc_double_flux",
  "ballon_thermodynamique",
  "audit_etude",
  "coordination_pilotage",
  "frais_administratifs",
]);

const CATEGORIES_P1 = new Set([
  "isolation",
  "menuiserie",
  "double-vitrage",
  "pompe-a-chaleur",
  "toiture",
]);

const CATEGORIES_P2 = new Set([
  "etude-accompagnement",
  "chauffage",
  "plomberie",
  "plomberie-sanitaire",
  "electricite",
  "frais-administratifs-coordination",
]);

const CATEGORIES_P3 = new Set([
  "photovoltaique",
  "peinture",
  "plafonds-tendus",
  "mobilite-electrique",
  "climatisation",
]);

function texteContexte(ctx: ContextePrioriteTravaux): string {
  return [
    ctx.posteId,
    ctx.categorieId,
    ctx.sousCategorieId,
    ctx.nom,
    ctx.designation,
    ctx.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function estPrioriteTravaux(value: unknown): value is PrioriteTravaux {
  return value === 1 || value === 2 || value === 3;
}

export function prioriteTravauxOuDefaut(value: unknown): PrioriteTravaux {
  return estPrioriteTravaux(value) ? value : 2;
}

export function infererPrioriteTravaux(ctx: ContextePrioriteTravaux): PrioriteTravaux {
  if (estPrioriteTravaux(ctx.prioriteCatalogue)) return ctx.prioriteCatalogue;

  const posteId = ctx.posteId?.trim() ?? "";
  if (POSTES_P1.has(posteId) || posteId.startsWith("compat-isolation") || posteId === "compat-ite" || posteId === "compat-iti" || posteId === "compat-fenetres_portes_fenetres" || posteId.startsWith("compat-pac_")) {
    return 1;
  }
  if (
    POSTES_P2.has(posteId) ||
    posteId.startsWith("compat-vmc_") ||
    posteId === "compat-ballon_thermodynamique" ||
    posteId === "compat-audit_etude" ||
    posteId === "compat-coordination_pilotage" ||
    posteId === "compat-frais_administratifs"
  ) {
    return 2;
  }
  if (
    posteId === "panneaux_photovoltaiques" ||
    posteId === "compat-panneaux_photovoltaiques" ||
    posteId.startsWith("pv-") ||
    posteId === "finitions" ||
    posteId === "compat-finitions" ||
    posteId === "depose_evacuation" ||
    posteId === "compat-depose_evacuation" ||
    posteId === "aleas_techniques" ||
    posteId === "compat-aleas_techniques"
  ) {
    return 3;
  }

  const categorieId = ctx.categorieId?.trim() ?? "";
  if (CATEGORIES_P1.has(categorieId)) return 1;
  if (CATEGORIES_P3.has(categorieId)) return 3;
  if (CATEGORIES_P2.has(categorieId)) return 2;

  const texte = texteContexte(ctx);
  if (
    /photovolta|dualsun|panneau|irve|borne|peinture|plafond tendu|option/.test(texte)
  ) {
    return 3;
  }
  if (
    /vmc|ventilation|ballon|ecs|thermodynamique|cet|coordination|pilotage|audit energetique/.test(
      texte,
    )
  ) {
    return 2;
  }
  if (
    /isolation|comble|ite|iti|plancher|menuiser|fenetre|porte-fenetre|pac|pompe a chaleur|sarking/.test(
      texte,
    )
  ) {
    return 1;
  }
  return 2;
}

export function libelleSelectPriorite(priorite: PrioriteTravaux): string {
  const item = PRIORITE_TRAVAUX[priorite];
  return `${item.code} · ${item.libelleCourt}`;
}

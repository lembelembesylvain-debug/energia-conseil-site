/**
 * Visibilité, protection des tarifs fermes et sanitization par rôle.
 * Les marges et coûts internes ne sortent jamais hors administrateur.
 */

import { calculerPrestation } from "./calculs";
import type {
  PrestationCatalogue,
  StatutRepereMarche,
  TypePrixCatalogue,
  VisibiliteCatalogue,
} from "./types";

export const IDS_TARIFS_FERMES_PROTEGES = [
  "pv-dualsun-flash-500",
  "pv-dualsun-spring-500",
  "pv-enphase-iq8plus",
  "pv-enphase-iq8m",
  "pv-huawei-sun2000-3-6",
  "pv-huawei-sun2000-9-12",
  "pv-pylontech-h2-3-5",
  "pv-pylontech-h2-7",
  "pv-pylontech-h2-10",
  "pv-pylontech-h2-15",
  "pv-pylontech-h2-20",
  "pv-pylontech-h2-30",
  "pv-huawei-luna-5",
  "pv-huawei-luna-10",
  "pv-huawei-luna-15",
  "pv-huawei-luna-20",
  "pv-huawei-luna-30",
  "pv-coffret-ac-dc",
  "pv-rails-fixations",
  "pv-cables-connectique",
  "pv-cables-forfait-base",
  "pv-mise-a-la-terre",
  "pv-calepinage",
  "pv-raccordement-enedis-consuel",
  "pv-consuel",
  "pv-mise-en-service",
  "pv-monitoring-production",
  "pv-deplacement",
  "pv-maintenance-annuelle",
  "demo-isolation-combles-soufflee",
  "demo-plafond-tendu-pvc",
  "demo-peinture-interieure",
  "demo-pac-air-eau",
  "demo-coordination-amo",
] as const;

export const IDS_INTERNES_ADMIN_SEULEMENT = new Set([
  "pv-frais-clyve",
  "pv-coordination-energia",
  "compat-audit_etude",
  "compat-coordination_pilotage",
  "compat-frais_administratifs",
  "compat-aleas_techniques",
]);

export const IDS_A_RECALIBRER_LOCAL = new Set([
  "marche-sarking",
  "pv-pose-forfait",
  "pv-pose-variable",
  "marche-terrassement-standard",
  "marche-sdb-legere",
  "marche-sdb-standard",
  "marche-sdb-complete",
  "marche-parquet-massif",
  "marche-reno-energetique-standard",
]);

const PREFIXES_ORIENTATION_PARTENAIRE = [
  "compat-isolation_",
  "compat-ite",
  "compat-iti",
  "compat-fenetres",
  "compat-pac_",
  "compat-vmc_",
  "compat-ballon_",
  "compat-panneaux_",
  "marche-combles",
  "marche-iti",
  "marche-ite",
  "marche-fenetre",
  "marche-pac",
  "marche-vmc",
  "marche-pv-",
  "marche-cet",
  "marche-reno",
  "marche-chaudiere",
  "marche-depose-chaudiere",
  "marche-depose-cuve",
  "marche-neutralisation-cuve",
  "marche-poele",
  "marche-cesi",
  "marche-ssc",
  "marche-capteurs-solaires",
  "marche-pose-solaire",
  "marche-irve",
];

export function estTarifFermeProtege(id: string): boolean {
  return (IDS_TARIFS_FERMES_PROTEGES as readonly string[]).includes(id);
}

export function typePrixPrestation(prestation: PrestationCatalogue): TypePrixCatalogue {
  if (IDS_INTERNES_ADMIN_SEULEMENT.has(prestation.id) || prestation.id === "pv-frais-clyve") {
    return "internal";
  }
  const calc = calculerPrestation(prestation);
  if (calc.tarifRenseigne) return "firm";
  if (prestation.referenceMarche) return "market_reference";
  return "market_reference";
}

export function statutReperePrestation(prestation: PrestationCatalogue): StatutRepereMarche {
  if (prestation.referenceMarche?.statutRepere) return prestation.referenceMarche.statutRepere;
  if (prestation.referenceMarche?.recalibrageLocal) return "a_recalibrer_local";
  if (IDS_A_RECALIBRER_LOCAL.has(prestation.id)) return "a_recalibrer_local";
  if (prestation.id.startsWith("marche-serrurerie")) return "a_recalibrer_local";
  if (prestation.id.startsWith("marche-vitrerie")) return "a_recalibrer_local";
  if (prestation.id.startsWith("marche-charpente")) return "a_recalibrer_local";
  return "indicatif_a_confirmer";
}

export type BadgeStatutTarif =
  | "tarif_ferme"
  | "reperes_marche"
  | "a_confirmer"
  | "a_recalibrer";

export function badgeStatutTarif(prestation: PrestationCatalogue): BadgeStatutTarif {
  const type = typePrixPrestation(prestation);
  if (type === "firm") return "tarif_ferme";
  if (statutReperePrestation(prestation) === "a_recalibrer_local") return "a_recalibrer";
  if (prestation.referenceMarche) return "reperes_marche";
  return "a_confirmer";
}

export const LIBELLES_BADGE_STATUT: Record<BadgeStatutTarif, string> = {
  tarif_ferme: "TARIF FERME",
  reperes_marche: "REPÈRE MARCHÉ 2026",
  a_confirmer: "À CONFIRMER",
  a_recalibrer: "À RECALIBRER",
};

export function visibiliteParDefaut(prestation: PrestationCatalogue): VisibiliteCatalogue {
  if (prestation.visibilite) return prestation.visibilite;
  if (prestation.demo || IDS_INTERNES_ADMIN_SEULEMENT.has(prestation.id)) {
    return { admin: true, commercial: false, partner: false };
  }
  const partner = PREFIXES_ORIENTATION_PARTENAIRE.some((prefix) => prestation.id.startsWith(prefix));
  return { admin: true, commercial: true, partner };
}

export function prestationVisiblePourRole(
  prestation: PrestationCatalogue,
  role: string,
): boolean {
  const vis = visibiliteParDefaut(prestation);
  if (role === "administrateur") return vis.admin;
  if (role === "commercial") return vis.commercial;
  if (role === "partenaire_apporteur") return vis.partner;
  return false;
}

/**
 * Vue rôle : jamais de coûts internes ni de marges hors admin.
 * Un repère marché n’est jamais transformé en prix de vente.
 */
export function prestationPourRole(
  prestation: PrestationCatalogue,
  role: string,
): PrestationCatalogue | null {
  if (!prestationVisiblePourRole(prestation, role)) return null;
  if (role === "administrateur") return prestation;
  const partner = role === "partenaire_apporteur";
  return {
    ...prestation,
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    coutFourniturePoseHt: null,
    structurePrixInterne: undefined,
    prixVenteHt: partner ? null : prestation.prixVenteHt,
    artisan: partner ? "" : prestation.artisan,
  };
}

export function validerFourchetteMarche(prestation: PrestationCatalogue): string | null {
  const ref = prestation.referenceMarche;
  if (!ref) return null;
  if (ref.priceMinHT < 0 || ref.priceMaxHT < 0 || ref.priceMinTTC < 0 || ref.priceMaxTTC < 0) {
    return `${prestation.id} : montant négatif refusé`;
  }
  if (ref.priceMinHT > ref.priceMaxHT || ref.priceMinTTC > ref.priceMaxTTC) {
    return `${prestation.id} : min supérieur au max`;
  }
  if (ref.priceMedianHT < ref.priceMinHT || ref.priceMedianHT > ref.priceMaxHT) {
    return `${prestation.id} : médian HT hors fourchette`;
  }
  if (ref.priceMedianTTC < ref.priceMinTTC || ref.priceMedianTTC > ref.priceMaxTTC) {
    return `${prestation.id} : médian TTC hors fourchette`;
  }
  if (!ref.unit) return `${prestation.id} : unité manquante`;
  if (!ref.sourceName || !ref.sourceUrl) return `${prestation.id} : source manquante`;
  if (!ref.sourceDate) return `${prestation.id} : date source manquante`;
  const htAttendu = Math.round((ref.priceMinTTC / (1 + ref.vatRate)) * 100) / 100;
  if (Math.abs(htAttendu - ref.priceMinHT) > 0.05) {
    return `${prestation.id} : HT incohérent avec TVA`;
  }
  return null;
}

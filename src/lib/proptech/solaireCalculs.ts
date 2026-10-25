/**
 * Gisement solaire Bourgogne (Saône-et-Loire / Côte-d'Or) et bilan Tesla Powerwall 3.
 * Le tarif de surplus est celui de l'arrêté du 1er juin 2026 : 1,1 c€/kWh HT
 * pour une demande complète de raccordement à compter du 5 juin 2026.
 * La prime à l'autoconsommation est à 0 € pour ces demandes.
 */
import {
  PRIX_KWH_EDF_EUR,
  estChauffageElectrique,
  factureEdfEstimee,
  formaterEntierFr,
} from "./statutMarcheDpe";

export const IRRADIATION_BOURGOGNE_KWH_PAR_KWC = 1150;
export const TARIF_OA_SURPLUS_EUR = 0.011;
export const SURFACE_MODULE_M2 = 2.2;
export const PUISSANCE_MODULE_KWC = 0.5;
export const PART_TOITURE_EXPLOITABLE = 0.6;
export const AUTOCONSO_SIMPLE = 0.35;
export const AUTOCONSO_TESLA = 0.85;
export const CAPACITE_POWERWALL_KWH = 13.5;
export const COUT_POWERWALL_EUR = 10500;
export const MENTION_TARIF_OA =
  "Tarif OA surplus 0,011 EUR/kWh HT, arrêté du 1er juin 2026, demandes à compter du 5 juin 2026. Prime à l'autoconsommation : 0 EUR. Le tarif applicable est celui figé à la date de la demande complète de raccordement. Estimation à titre indicatif.";

export type GammeSolaire = "residentiel" | "tertiaire";
export type SourceToiture = "emprise" | "habitable" | "inconnue";

export interface EntreeSolaire {
  empriseM2?: number | null;
  /** Vrai lorsque l'emprise vient du relevé terrain, pas d'un point IGN mal calé. */
  empriseFiable?: boolean;
  surfaceHabitableM2?: number | null;
  chauffage?: string | null;
  consoKwhM2?: number | null;
  etiquette?: string | null;
  typeBati?: string | null;
}

export interface EtudeSolaire {
  puissanceKwc: number;
  nombreModules: number;
  productionAnnuelleKwh: number;
  toitureExploitableM2: number | null;
  sourceToiture: SourceToiture;
  gamme: GammeSolaire;
  toitureIdeale: boolean;
  noteToiture: string;
  kwhAutoTesla: number;
  kwhSurplusTesla: number;
  economieAnnuelleEur: number;
  economieSimpleEur: number;
  factureActuelleEur: number | null;
  factureResiduelleEur: number | null;
  partFactureEffacee: number | null;
  gains25AnsEur: number;
  roiAnnees: number | null;
  coutPoseEur: number;
  coutBatterieEur: number;
  coutTotalEur: number;
  tarifOaEur: number;
  libellePuissance: string;
  preconisation: string;
}

function jeton(valeur: string | null | undefined): string {
  return String(valeur ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function positif(valeur: number | null | undefined): number | null {
  return valeur != null && Number.isFinite(valeur) && valeur > 0 ? valeur : null;
}

function facteurVingtCinqAns(): number {
  let somme = 0;
  let performance = 1;
  for (let annee = 0; annee < 25; annee += 1) {
    somme += performance;
    performance *= 0.995;
  }
  return somme;
}

function coutPoseResidentiel(kwc: number): number {
  const unitaire = kwc <= 3 ? 1800 : kwc <= 6 ? 1550 : 1400;
  return Math.round(kwc * unitaire);
}

interface CiblePuissance {
  kwc: number;
  gamme: GammeSolaire;
}

function puissanceVisee(
  assiette: number | null,
  electrique: boolean,
  conso: number | null,
  surface: number | null,
  etiquette: string | null,
  typeBati: string | null,
): CiblePuissance {
  const tertiaire = /hangar|tertiaire|industriel|entrepot/.test(jeton(typeBati));
  if (tertiaire || (assiette != null && assiette > 400)) {
    const exploitable = (assiette ?? 600) * PART_TOITURE_EXPLOITABLE;
    const brut = exploitable / (SURFACE_MODULE_M2 / PUISSANCE_MODULE_KWC);
    const kwc = Math.min(100, Math.max(36, Math.round(brut / 3) * 3));
    return { kwc, gamme: "tertiaire" };
  }
  const passoire =
    electrique && (etiquette === "F" || etiquette === "G" || (conso != null && conso >= 250));
  const facture = electrique ? factureEdfEstimee(surface, conso) : null;
  if ((assiette != null && assiette > 180) || passoire) return { kwc: 9, gamme: "residentiel" };
  if ((assiette != null && assiette >= 100) || (facture != null && facture > 4000)) {
    return { kwc: 6, gamme: "residentiel" };
  }
  return { kwc: 3, gamme: "residentiel" };
}

function economieDe(production: number, plafondConso: number | null, taux: number): { auto: number; surplus: number; euros: number } {
  const visee = production * taux;
  const auto = plafondConso != null ? Math.min(visee, plafondConso) : visee;
  const surplus = Math.max(0, production - auto);
  const euros = auto * PRIX_KWH_EDF_EUR + surplus * TARIF_OA_SURPLUS_EUR;
  return { auto, surplus, euros };
}

export function calculerEtudeSolaire(entree: EntreeSolaire): EtudeSolaire {
  const emprise = positif(entree.empriseM2);
  const surface = positif(entree.surfaceHabitableM2);
  const conso = positif(entree.consoKwhM2);
  const electrique = estChauffageElectrique(entree.chauffage);
  const empriseCredible =
    emprise != null &&
    (entree.empriseFiable === true || surface == null || emprise >= Math.max(40, surface * 0.45));
  const sourceToiture: SourceToiture = empriseCredible ? "emprise" : surface != null ? "habitable" : "inconnue";
  const assiette = empriseCredible ? emprise : surface;
  const empriseEcartee = emprise != null && !empriseCredible;
  const toitureExploitableM2 = assiette != null ? Math.round(assiette * PART_TOITURE_EXPLOITABLE) : null;
  const visee = puissanceVisee(assiette, electrique, conso, surface, entree.etiquette ?? null, entree.typeBati ?? null);

  let modules = Math.round(visee.kwc / PUISSANCE_MODULE_KWC);
  if (toitureExploitableM2 != null) {
    const maxModules = Math.floor(toitureExploitableM2 / SURFACE_MODULE_M2);
    if (modules > maxModules) modules = Math.max(0, maxModules);
  }
  const puissanceKwc = Math.round(modules * PUISSANCE_MODULE_KWC * 10) / 10;
  const productionAnnuelleKwh = Math.round(puissanceKwc * IRRADIATION_BOURGOGNE_KWH_PAR_KWC);

  const consoElectrique =
    electrique && surface != null && conso != null
      ? surface * conso
      : surface != null
        ? Math.round(1100 + 25 * surface)
        : null;
  const factureActuelleEur =
    electrique && surface != null && conso != null
      ? factureEdfEstimee(surface, conso)
      : consoElectrique != null
        ? Math.round(consoElectrique * PRIX_KWH_EDF_EUR)
        : null;

  const tesla = economieDe(productionAnnuelleKwh, consoElectrique, AUTOCONSO_TESLA);
  const simple = economieDe(productionAnnuelleKwh, consoElectrique, AUTOCONSO_SIMPLE);
  const economieAnnuelleEur = Math.round(tesla.euros);
  const economieSimpleEur = Math.round(simple.euros);
  const factureResiduelleEur =
    factureActuelleEur != null ? Math.max(0, factureActuelleEur - economieAnnuelleEur) : null;
  const partFactureEffacee =
    factureActuelleEur != null && factureActuelleEur > 0 ? economieAnnuelleEur / factureActuelleEur : null;

  const coutPoseEur =
    visee.gamme === "tertiaire" ? Math.round(puissanceKwc * 1100) : coutPoseResidentiel(puissanceKwc);
  const coutBatterieEur = puissanceKwc > 0 ? COUT_POWERWALL_EUR : 0;
  const coutTotalEur = coutPoseEur + coutBatterieEur;
  const roiAnnees =
    economieAnnuelleEur > 0 ? Math.round((coutTotalEur / economieAnnuelleEur) * 10) / 10 : null;
  const gains25AnsEur = Math.round(economieAnnuelleEur * facteurVingtCinqAns());
  const toitureIdeale = puissanceKwc >= 3 && (toitureExploitableM2 == null || modules * SURFACE_MODULE_M2 <= toitureExploitableM2 + 0.1);

  const noteToiture =
    puissanceKwc <= 0
      ? "Toiture estimée insuffisante pour 3 kWc. Un relevé de pente, d'orientation et de masques est requis."
      : sourceToiture === "emprise"
        ? `Toiture exploitable estimée à 60 % de l'emprise au sol (${formaterEntierFr(toitureExploitableM2 ?? 0)} m²), orientations Est, Sud et Ouest.`
        : sourceToiture === "habitable"
          ? empriseEcartee
            ? "L'emprise du flux ouvert est incohérente avec la surface habitable. Toiture estimée à 60 % de la surface habitable, à confirmer au relevé."
            : "Emprise IGN absente : toiture estimée à 60 % de la surface habitable. À confirmer au relevé."
          : "Surface de toiture inconnue. Le calepinage est indicatif jusqu'au relevé de toiture.";

  const libellePuissance =
    puissanceKwc <= 0
      ? "Installation non dimensionnée"
      : visee.gamme === "tertiaire"
        ? `Option tertiaire ${formaterEntierFr(puissanceKwc)} kWc`
        : `Installation recommandée : ${String(puissanceKwc).replace(".", ",")} kWc`;

  return {
    puissanceKwc,
    nombreModules: modules,
    productionAnnuelleKwh,
    toitureExploitableM2,
    sourceToiture,
    gamme: visee.gamme,
    toitureIdeale,
    noteToiture,
    kwhAutoTesla: Math.round(tesla.auto),
    kwhSurplusTesla: Math.round(tesla.surplus),
    economieAnnuelleEur,
    economieSimpleEur,
    factureActuelleEur,
    factureResiduelleEur,
    partFactureEffacee,
    gains25AnsEur,
    roiAnnees,
    coutPoseEur,
    coutBatterieEur,
    coutTotalEur,
    tarifOaEur: TARIF_OA_SURPLUS_EUR,
    libellePuissance,
    preconisation:
      "Centrale solaire en toiture 6-9 kWc + Stockage Tesla Powerwall 3 pour effacement tarifaire.",
  };
}

export { formaterEntierFr };

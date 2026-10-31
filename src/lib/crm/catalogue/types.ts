/**
 * Catalogue métiers CRM — hiérarchie Catégorie → Sous-catégorie → Prestation.
 * Les tarifs restent optionnels : null = à renseigner, jamais un prix inventé.
 */

import type { PrioriteTravaux } from "../../chiffrage/priorite-travaux";

export const UNITES_PRESTATION = [
  "forfait",
  "m²",
  "ml",
  "u",
  "kWc",
  "kW",
  "h",
  "j",
  "lot",
  "panneau",
] as const;

export type UnitePrestation = (typeof UNITES_PRESTATION)[number];

export const LIBELLES_UNITE: Record<UnitePrestation, string> = {
  forfait: "Forfait",
  "m²": "m²",
  ml: "ml",
  u: "Unité",
  kWc: "kWc",
  kW: "kW",
  h: "h",
  j: "jour",
  lot: "Lot",
  panneau: "Panneau",
};

export const STATUTS_CATALOGUE = [
  "estimation",
  "devis_recu",
  "valide",
  "realise",
  "archive",
] as const;

export type StatutCatalogue = (typeof STATUTS_CATALOGUE)[number];

export const TAUX_TVA_CATALOGUE = [0.055, 0.1, 0.2] as const;

export type TauxTvaCatalogue = (typeof TAUX_TVA_CATALOGUE)[number];

export const NIVEAUX_CONFIANCE_MARCHE = ["low", "medium", "high"] as const;
export type NiveauConfianceMarche = (typeof NIVEAUX_CONFIANCE_MARCHE)[number];

export const COMPLEXITES_MARCHE = ["legere", "standard", "complexe", "tres_complexe"] as const;
export type ComplexiteMarche = (typeof COMPLEXITES_MARCHE)[number];

export const STATUTS_REPERE_MARCHE = ["indicatif_a_confirmer", "a_recalibrer_local"] as const;
export type StatutRepereMarche = (typeof STATUTS_REPERE_MARCHE)[number];

export const TYPES_PRIX_CATALOGUE = ["firm", "market_reference", "internal"] as const;
export type TypePrixCatalogue = (typeof TYPES_PRIX_CATALOGUE)[number];

export type VisibiliteCatalogue = {
  admin: boolean;
  commercial: boolean;
  partner: boolean;
};

export const MODES_FOURNITURE = ["fourniture", "pose", "fourniture_pose"] as const;
export type ModeFournitureMarche = (typeof MODES_FOURNITURE)[number];

export type SourceMarche = {
  name: string;
  url: string;
};

/**
 * Repère de marché indicatif — jamais un devis ferme.
 * Ne pas copier ces montants dans prixVenteHt sans devis artisan.
 */
export type ReferenceMarche = {
  priceStatus: "market_reference";
  priceMinHT: number;
  priceMedianHT: number;
  priceMaxHT: number;
  priceMinTTC: number;
  priceMedianTTC: number;
  priceMaxTTC: number;
  unit: UnitePrestation;
  regionalAdjustment: number;
  vatRate: TauxTvaCatalogue;
  vatNote: string;
  complexity: ComplexiteMarche;
  supplyMode: ModeFournitureMarche;
  includes: string[];
  excludes: string[];
  confidence: NiveauConfianceMarche;
  sourceName: string;
  sourceUrl: string;
  additionalSources: SourceMarche[];
  sourceDate: string;
  lastReviewedAt: string;
  zone: string;
  requiresQuote: true;
  recalibrageLocal: boolean;
  statutRepere: StatutRepereMarche;
};

/**
 * Découpage interne ENERGIA. Invisible hors administrateur.
 * Les marges ne sont jamais intégrées dans la fourchette marché.
 */
export type StructurePrixInterne = {
  coutMarcheIndicatifHt: number | null;
  margeCibleEnergiaHt: number | null;
  commissionPartenaireHt: number | null;
  fraisCoordinationHt: number | null;
  prixVenteProposeHt: number | null;
  prixFinalApresDevisHt: number | null;
};

export type CategorieMetier = {
  id: string;
  nom: string;
  ordre: number;
  tauxTvaDefaut: TauxTvaCatalogue;
};

export type SousCategorieMetier = {
  id: string;
  categorieId: string;
  nom: string;
  ordre: number;
};

export type PrestationCatalogue = {
  id: string;
  categorieId: string;
  sousCategorieId: string;
  nom: string;
  description: string;
  unite: UnitePrestation;
  /** Matériel / fourniture HT. null = tarif à renseigner. */
  coutMaterielHt: number | null;
  /** Main-d’œuvre artisan HT. null = prix artisan à confirmer. */
  coutMainOeuvreHt: number | null;
  /** Prix de vente HT client. null = prix de vente à définir. */
  prixVenteHt: number | null;
  tauxTva: TauxTvaCatalogue;
  artisan: string;
  statut: StatutCatalogue;
  garantie: string;
  aides: string;
  notes: string;
  dateMiseAJour: string;
  actif: boolean;
  /** Données de démonstration uniquement — ne pas traiter comme tarif validé. */
  demo: boolean;
  /** Lien optionnel vers un poste du module chiffrage existant. */
  posteIdLegacy: string | null;
  /** Fourchette marché indicative. Absente = pas de repère public rattaché. */
  referenceMarche?: ReferenceMarche;
  /** Coûts et marges internes — jamais affichés hors administrateur. */
  structurePrixInterne?: StructurePrixInterne;
  /** Visibilité par rôle. Absente = calculée par défaut. */
  visibilite?: VisibiliteCatalogue;
  /**
   * Priorité DPE affichée sur le devis client.
   * Absente = inférée (enveloppe / chauffage = P1, VMC-ECS = P2, option = P3).
   */
  prioriteTravaux?: PrioriteTravaux;
  /** Fourniture+pose artisan vs pose seule (achat matériel direct ENERGIA). */
  modeSousTraitance?: "fourniture_pose" | "pose_seule";
  /** Forfait sous-traitance fourniture+pose HT (référence pour le gain de marge). */
  coutFourniturePoseHt?: number | null;
};

export type PrestationCalculee = PrestationCatalogue & {
  coutRevientHt: number | null;
  montantTva: number | null;
  prixVenteTtc: number | null;
  margeBruteHt: number | null;
  /** Taux de marge = marge brute HT / prix de vente HT. Jamais un taux de marque. */
  tauxMarge: number | null;
  tarifRenseigne: boolean;
  venteInferieureAuCout: boolean;
  /** Gain vs forfait fourniture+pose, uniquement en mode pose seule. */
  extraMargeAchatDirectHt: number | null;
  /** Prix de vente HT ou médian marché 2026, base du calcul admin. */
  baseChiffrageHt: number | null;
  /** Marge brute vs base (vente ou repère marché), selon le mode ST actif. */
  margeVsBaseHt: number | null;
  tauxMargeVsBase: number | null;
};

export type BrouillonPrestation = Omit<
  PrestationCatalogue,
  "id" | "dateMiseAJour" | "demo" | "posteIdLegacy"
> & {
  id?: string;
  demo?: boolean;
  posteIdLegacy?: string | null;
};

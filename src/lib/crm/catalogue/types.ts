/**
 * Catalogue métiers CRM — hiérarchie Catégorie → Sous-catégorie → Prestation.
 * Les tarifs restent optionnels : null = à renseigner, jamais un prix inventé.
 */

export const UNITES_PRESTATION = [
  "forfait",
  "m²",
  "ml",
  "u",
  "kWc",
  "kW",
  "h",
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
};

export type BrouillonPrestation = Omit<
  PrestationCatalogue,
  "id" | "dateMiseAJour" | "demo" | "posteIdLegacy"
> & {
  id?: string;
  demo?: boolean;
  posteIdLegacy?: string | null;
};

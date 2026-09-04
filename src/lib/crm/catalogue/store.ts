/**
 * Persistance locale du catalogue métiers.
 * Les projets existants (Pereira, Marjollet, etc.) ne sont pas lus ni écrits ici.
 */

import { PRESTATIONS_SEED } from "./prestations-seed";
import {
  CATEGORIES_METIERS,
  SOUS_CATEGORIES_METIERS,
  getCategorieMetier,
  getSousCategorieMetier,
  sousCategorieAppartientA,
} from "./categories";
import { calculerPrestation, statutPeutEtreValide } from "./calculs";
import type {
  BrouillonPrestation,
  PrestationCalculee,
  PrestationCatalogue,
  StatutCatalogue,
  TauxTvaCatalogue,
  UnitePrestation,
} from "./types";
import { STATUTS_CATALOGUE, TAUX_TVA_CATALOGUE, UNITES_PRESTATION } from "./types";

export const CATALOGUE_STORAGE_KEY = "energia-crm-catalogue-metiers-v1";

type Persistance = {
  version: 1;
  personnalisees: PrestationCatalogue[];
  desactivees: string[];
};

function nouveauId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cat-${crypto.randomUUID()}`;
  }
  return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

function isUnite(value: string): value is UnitePrestation {
  return (UNITES_PRESTATION as readonly string[]).includes(value);
}

function isStatut(value: string): value is StatutCatalogue {
  return (STATUTS_CATALOGUE as readonly string[]).includes(value);
}

function isTauxTva(value: number): value is TauxTvaCatalogue {
  return (TAUX_TVA_CATALOGUE as readonly number[]).includes(value);
}

function hydraterPrestation(raw: unknown): PrestationCatalogue | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id : "";
  const categorieId = typeof row.categorieId === "string" ? row.categorieId : "";
  const sousCategorieId = typeof row.sousCategorieId === "string" ? row.sousCategorieId : "";
  if (!id || !getCategorieMetier(categorieId)) return null;
  if (!sousCategorieAppartientA(sousCategorieId, categorieId)) return null;
  if (typeof row.nom !== "string" || !row.nom.trim()) return null;
  if (typeof row.unite !== "string" || !isUnite(row.unite)) return null;
  if (typeof row.statut !== "string" || !isStatut(row.statut)) return null;
  if (typeof row.tauxTva !== "number" || !isTauxTva(row.tauxTva)) return null;
  const nombreOuNull = (value: unknown): number | null => {
    if (value == null) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  return {
    id,
    categorieId,
    sousCategorieId,
    nom: row.nom.trim(),
    description: typeof row.description === "string" ? row.description : "",
    unite: row.unite,
    coutMaterielHt: nombreOuNull(row.coutMaterielHt),
    coutMainOeuvreHt: nombreOuNull(row.coutMainOeuvreHt),
    prixVenteHt: nombreOuNull(row.prixVenteHt),
    tauxTva: row.tauxTva,
    artisan: typeof row.artisan === "string" ? row.artisan : "",
    statut: row.statut,
    garantie: typeof row.garantie === "string" ? row.garantie : "",
    aides: typeof row.aides === "string" ? row.aides : "",
    notes: typeof row.notes === "string" ? row.notes : "",
    dateMiseAJour: typeof row.dateMiseAJour === "string" ? row.dateMiseAJour : aujourdHui(),
    actif: row.actif !== false,
    demo: row.demo === true,
    posteIdLegacy: typeof row.posteIdLegacy === "string" ? row.posteIdLegacy : null,
  };
}

function lirePersistance(): Persistance {
  const vide: Persistance = { version: 1, personnalisees: [], desactivees: [] };
  if (typeof window === "undefined") return vide;
  try {
    const raw = window.localStorage.getItem(CATALOGUE_STORAGE_KEY);
    if (!raw) return vide;
    const parsed = JSON.parse(raw) as Partial<Persistance>;
    const personnalisees = Array.isArray(parsed.personnalisees)
      ? parsed.personnalisees.map(hydraterPrestation).filter((item): item is PrestationCatalogue => item != null)
      : [];
    const desactivees = Array.isArray(parsed.desactivees)
      ? parsed.desactivees.filter((id): id is string => typeof id === "string")
      : [];
    return { version: 1, personnalisees, desactivees };
  } catch {
    return vide;
  }
}

function ecrirePersistance(data: Persistance) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATALOGUE_STORAGE_KEY, JSON.stringify(data));
}

export function listerPrestationsCatalogue(): PrestationCatalogue[] {
  const persistance = lirePersistance();
  const parId = new Map<string, PrestationCatalogue>();
  for (const seed of PRESTATIONS_SEED) {
    parId.set(seed.id, {
      ...seed,
      actif: persistance.desactivees.includes(seed.id) ? false : seed.actif,
    });
  }
  for (const perso of persistance.personnalisees) {
    parId.set(perso.id, perso);
  }
  return [...parId.values()];
}

export function listerPrestationsCalculees(): PrestationCalculee[] {
  return listerPrestationsCatalogue().map(calculerPrestation);
}

export function getPrestationCatalogue(id: string): PrestationCatalogue | undefined {
  return listerPrestationsCatalogue().find((item) => item.id === id);
}

export function prestationsDeSousCategorie(
  categorieId: string,
  sousCategorieId: string,
  options: { inclureInactifs?: boolean } = {},
): PrestationCatalogue[] {
  return listerPrestationsCatalogue().filter((item) => {
    if (item.categorieId !== categorieId || item.sousCategorieId !== sousCategorieId) return false;
    if (!options.inclureInactifs && !item.actif) return false;
    return true;
  });
}

function validerBrouillon(brouillon: BrouillonPrestation): string | null {
  if (!brouillon.nom.trim()) return "Le nom de la prestation est obligatoire.";
  if (!getCategorieMetier(brouillon.categorieId)) return "Catégorie principale inconnue.";
  if (!getSousCategorieMetier(brouillon.sousCategorieId)) return "Sous-catégorie inconnue.";
  if (!sousCategorieAppartientA(brouillon.sousCategorieId, brouillon.categorieId)) {
    return "La sous-catégorie ne dépend pas de la catégorie sélectionnée.";
  }
  const prestation: PrestationCatalogue = {
    id: brouillon.id ?? "tmp",
    categorieId: brouillon.categorieId,
    sousCategorieId: brouillon.sousCategorieId,
    nom: brouillon.nom.trim(),
    description: brouillon.description,
    unite: brouillon.unite,
    coutMaterielHt: brouillon.coutMaterielHt,
    coutMainOeuvreHt: brouillon.coutMainOeuvreHt,
    prixVenteHt: brouillon.prixVenteHt,
    tauxTva: brouillon.tauxTva,
    artisan: brouillon.artisan,
    statut: brouillon.statut,
    garantie: brouillon.garantie,
    aides: brouillon.aides,
    notes: brouillon.notes,
    dateMiseAJour: aujourdHui(),
    actif: brouillon.actif,
    demo: brouillon.demo === true,
    posteIdLegacy: brouillon.posteIdLegacy ?? null,
  };
  if (!statutPeutEtreValide(brouillon.statut, prestation)) {
    return "Impossible de valider : coût ou prix de vente absent (tarif à renseigner).";
  }
  return null;
}

export function enregistrerPrestationCatalogue(brouillon: BrouillonPrestation): {
  prestation: PrestationCatalogue | null;
  erreur: string | null;
} {
  const erreur = validerBrouillon(brouillon);
  if (erreur) return { prestation: null, erreur };
  const persistance = lirePersistance();
  const id = brouillon.id?.trim() || nouveauId();
  const existante = listerPrestationsCatalogue().find((item) => item.id === id);
  const prestation: PrestationCatalogue = {
    id,
    categorieId: brouillon.categorieId,
    sousCategorieId: brouillon.sousCategorieId,
    nom: brouillon.nom.trim(),
    description: brouillon.description.trim(),
    unite: brouillon.unite,
    coutMaterielHt: brouillon.coutMaterielHt,
    coutMainOeuvreHt: brouillon.coutMainOeuvreHt,
    prixVenteHt: brouillon.prixVenteHt,
    tauxTva: brouillon.tauxTva,
    artisan: brouillon.artisan.trim(),
    statut: brouillon.statut,
    garantie: brouillon.garantie.trim(),
    aides: brouillon.aides.trim(),
    notes: brouillon.notes.trim(),
    dateMiseAJour: aujourdHui(),
    actif: brouillon.actif,
    demo: existante?.demo === true || brouillon.demo === true,
    posteIdLegacy: existante?.posteIdLegacy ?? brouillon.posteIdLegacy ?? null,
  };
  const index = persistance.personnalisees.findIndex((item) => item.id === id);
  if (index >= 0) persistance.personnalisees[index] = prestation;
  else persistance.personnalisees.push(prestation);
  if (prestation.actif) {
    persistance.desactivees = persistance.desactivees.filter((item) => item !== id);
  } else if (!persistance.desactivees.includes(id)) {
    persistance.desactivees.push(id);
  }
  ecrirePersistance(persistance);
  return { prestation, erreur: null };
}

export function dupliquerPrestationCatalogue(id: string): {
  prestation: PrestationCatalogue | null;
  erreur: string | null;
} {
  const source = getPrestationCatalogue(id);
  if (!source) return { prestation: null, erreur: "Prestation introuvable." };
  return enregistrerPrestationCatalogue({
    ...source,
    id: undefined,
    nom: `${source.nom} (copie)`,
    statut: "estimation",
    demo: source.demo,
    posteIdLegacy: null,
    actif: true,
  });
}

export function desactiverPrestationCatalogue(id: string): string | null {
  const existante = getPrestationCatalogue(id);
  if (!existante) return "Prestation introuvable.";
  const resultat = enregistrerPrestationCatalogue({ ...existante, actif: false });
  return resultat.erreur;
}

export function reactiverPrestationCatalogue(id: string): string | null {
  const existante = getPrestationCatalogue(id);
  if (!existante) return "Prestation introuvable.";
  const resultat = enregistrerPrestationCatalogue({ ...existante, actif: true });
  return resultat.erreur;
}

export type DiagnosticCatalogue = {
  ok: boolean;
  nbCategories: number;
  nbSousCategories: number;
  nbPrestations: number;
  sansCategorie: number;
  sansSousCategorie: number;
  sousCategorieIncoherente: number;
  sansTarif: number;
  avecTarif: number;
};

export function diagnostiquerCatalogue(): DiagnosticCatalogue {
  const prestations = listerPrestationsCalculees();
  let sansCategorie = 0;
  let sansSousCategorie = 0;
  let sousCategorieIncoherente = 0;
  let sansTarif = 0;
  let avecTarif = 0;
  for (const prestation of prestations) {
    if (!getCategorieMetier(prestation.categorieId)) sansCategorie += 1;
    if (!getSousCategorieMetier(prestation.sousCategorieId)) sansSousCategorie += 1;
    else if (!sousCategorieAppartientA(prestation.sousCategorieId, prestation.categorieId)) {
      sousCategorieIncoherente += 1;
    }
    if (prestation.tarifRenseigne) avecTarif += 1;
    else sansTarif += 1;
  }
  return {
    ok: sansCategorie === 0 && sansSousCategorie === 0 && sousCategorieIncoherente === 0,
    nbCategories: CATEGORIES_METIERS.length,
    nbSousCategories: SOUS_CATEGORIES_METIERS.length,
    nbPrestations: prestations.length,
    sansCategorie,
    sansSousCategorie,
    sousCategorieIncoherente,
    sansTarif,
    avecTarif,
  };
}

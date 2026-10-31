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
import {
  COMPLEXITES_MARCHE,
  MODES_FOURNITURE,
  NIVEAUX_CONFIANCE_MARCHE,
  type ComplexiteMarche,
  type ModeFournitureMarche,
  type NiveauConfianceMarche,
  type ReferenceMarche,
  type SourceMarche,
  type StructurePrixInterne,
  type VisibiliteCatalogue,
} from "./types";
import {
  estTarifFermeProtege,
  validerFourchetteMarche,
} from "./visibilite";
import { estPrioriteTravaux } from "../../chiffrage/priorite-travaux";
import enrichiCatalogue from "../../../../data/catalogue-metiers-enrichi.json";
import { enrichirPrestationDoubleMode } from "../sousTraitanceDoubleMode";

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

function nombreOuNull(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hydraterSources(raw: unknown): SourceMarche[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: typeof item.name === "string" ? item.name : "",
      url: typeof item.url === "string" ? item.url : "",
    }))
    .filter((item) => item.name && item.url);
}

function hydraterReferenceMarche(raw: unknown): ReferenceMarche | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  if (row.priceStatus !== "market_reference") return undefined;
  if (typeof row.unit !== "string" || !isUnite(row.unit)) return undefined;
  if (typeof row.vatRate !== "number" || !isTauxTva(row.vatRate)) return undefined;
  if (typeof row.confidence !== "string") return undefined;
  if (!(NIVEAUX_CONFIANCE_MARCHE as readonly string[]).includes(row.confidence)) return undefined;
  if (typeof row.complexity !== "string") return undefined;
  if (!(COMPLEXITES_MARCHE as readonly string[]).includes(row.complexity)) return undefined;
  if (typeof row.supplyMode !== "string") return undefined;
  if (!(MODES_FOURNITURE as readonly string[]).includes(row.supplyMode)) return undefined;
  const minHt = nombreOuNull(row.priceMinHT);
  const medHt = nombreOuNull(row.priceMedianHT);
  const maxHt = nombreOuNull(row.priceMaxHT);
  const minTtc = nombreOuNull(row.priceMinTTC);
  const medTtc = nombreOuNull(row.priceMedianTTC);
  const maxTtc = nombreOuNull(row.priceMaxTTC);
  if (minHt == null || medHt == null || maxHt == null || minTtc == null || medTtc == null || maxTtc == null) {
    return undefined;
  }
  if (!row.sourceName || !row.sourceUrl) return undefined;
  return {
    priceStatus: "market_reference",
    priceMinHT: minHt,
    priceMedianHT: medHt,
    priceMaxHT: maxHt,
    priceMinTTC: minTtc,
    priceMedianTTC: medTtc,
    priceMaxTTC: maxTtc,
    unit: row.unit,
    regionalAdjustment: Number(row.regionalAdjustment) || 0,
    vatRate: row.vatRate,
    vatNote: typeof row.vatNote === "string" ? row.vatNote : "",
    complexity: row.complexity as ComplexiteMarche,
    supplyMode: row.supplyMode as ModeFournitureMarche,
    includes: Array.isArray(row.includes) ? row.includes.filter((item): item is string => typeof item === "string") : [],
    excludes: Array.isArray(row.excludes) ? row.excludes.filter((item): item is string => typeof item === "string") : [],
    confidence: row.confidence as NiveauConfianceMarche,
    sourceName: String(row.sourceName),
    sourceUrl: String(row.sourceUrl),
    additionalSources: hydraterSources(row.additionalSources),
    sourceDate: typeof row.sourceDate === "string" ? row.sourceDate : "",
    lastReviewedAt: typeof row.lastReviewedAt === "string" ? row.lastReviewedAt : "",
    zone: typeof row.zone === "string" ? row.zone : "",
    requiresQuote: true,
    recalibrageLocal: row.recalibrageLocal === true,
    statutRepere: row.statutRepere === "a_recalibrer_local" ? "a_recalibrer_local" : "indicatif_a_confirmer",
  };
}

function hydraterStructureInterne(raw: unknown): StructurePrixInterne | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  return {
    coutMarcheIndicatifHt: nombreOuNull(row.coutMarcheIndicatifHt),
    margeCibleEnergiaHt: nombreOuNull(row.margeCibleEnergiaHt),
    commissionPartenaireHt: nombreOuNull(row.commissionPartenaireHt),
    fraisCoordinationHt: nombreOuNull(row.fraisCoordinationHt),
    prixVenteProposeHt: nombreOuNull(row.prixVenteProposeHt),
    prixFinalApresDevisHt: nombreOuNull(row.prixFinalApresDevisHt),
  };
}

function hydraterVisibilite(raw: unknown): VisibiliteCatalogue | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  if (typeof row.admin !== "boolean" || typeof row.commercial !== "boolean" || typeof row.partner !== "boolean") {
    return undefined;
  }
  return { admin: row.admin, commercial: row.commercial, partner: row.partner };
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
  const referenceMarche = hydraterReferenceMarche(row.referenceMarche);
  const structurePrixInterne = hydraterStructureInterne(row.structurePrixInterne);
  const visibilite = hydraterVisibilite(row.visibilite);
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
    ...(estPrioriteTravaux(row.prioriteTravaux) ? { prioriteTravaux: row.prioriteTravaux } : {}),
    ...(referenceMarche ? { referenceMarche } : {}),
    ...(structurePrixInterne ? { structurePrixInterne } : {}),
    ...(visibilite ? { visibilite } : {}),
    ...(row.modeSousTraitance === "pose_seule" || row.modeSousTraitance === "fourniture_pose"
      ? { modeSousTraitance: row.modeSousTraitance }
      : {}),
    ...(nombreOuNull(row.coutFourniturePoseHt) != null
      ? { coutFourniturePoseHt: nombreOuNull(row.coutFourniturePoseHt) }
      : {}),
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
    const seed = parId.get(perso.id);
    if (seed && estTarifFermeProtege(seed.id)) {
      parId.set(perso.id, {
        ...perso,
        coutMaterielHt: seed.coutMaterielHt,
        coutMainOeuvreHt: seed.coutMainOeuvreHt,
        prixVenteHt: seed.prixVenteHt,
        unite: seed.unite,
        tauxTva: seed.tauxTva,
        demo: seed.demo,
        referenceMarche: seed.referenceMarche,
        structurePrixInterne: perso.structurePrixInterne ?? seed.structurePrixInterne,
        visibilite: perso.visibilite ?? seed.visibilite,
      });
      continue;
    }
    parId.set(perso.id, {
      ...perso,
      referenceMarche: perso.referenceMarche ?? seed?.referenceMarche,
      structurePrixInterne: perso.structurePrixInterne ?? seed?.structurePrixInterne,
      visibilite: perso.visibilite ?? seed?.visibilite,
    });
  }
  return [...parId.values()].map((item) => enrichirPrestationDoubleMode(item, enrichiCatalogue));
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
    referenceMarche: brouillon.referenceMarche,
    structurePrixInterne: brouillon.structurePrixInterne,
    visibilite: brouillon.visibilite,
    prioriteTravaux: brouillon.prioriteTravaux,
    modeSousTraitance: brouillon.modeSousTraitance,
    coutFourniturePoseHt: brouillon.coutFourniturePoseHt ?? null,
  };
  if (
    (brouillon.coutMaterielHt != null && brouillon.coutMaterielHt < 0) ||
    (brouillon.coutMainOeuvreHt != null && brouillon.coutMainOeuvreHt < 0) ||
    (brouillon.prixVenteHt != null && brouillon.prixVenteHt < 0)
  ) {
    return "Les montants négatifs sont refusés.";
  }
  const erreurFourchette = validerFourchetteMarche(prestation);
  if (erreurFourchette) return erreurFourchette;
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
  const seedProtege = PRESTATIONS_SEED.find((item) => item.id === id);
  const protege = Boolean(seedProtege && estTarifFermeProtege(id));
  if (protege && existante && (
    brouillon.coutMaterielHt !== seedProtege.coutMaterielHt ||
    brouillon.coutMainOeuvreHt !== seedProtege.coutMainOeuvreHt ||
    brouillon.prixVenteHt !== seedProtege.prixVenteHt
  )) {
    return {
      prestation: null,
      erreur: "Tarif ferme protégé : les montants DualSun / kits / démos ne peuvent pas être écrasés.",
    };
  }
  const prestation: PrestationCatalogue = {
    id,
    categorieId: brouillon.categorieId,
    sousCategorieId: brouillon.sousCategorieId,
    nom: brouillon.nom.trim(),
    description: brouillon.description.trim(),
    unite: protege && seedProtege ? seedProtege.unite : brouillon.unite,
    coutMaterielHt: protege && seedProtege ? seedProtege.coutMaterielHt : brouillon.coutMaterielHt,
    coutMainOeuvreHt: protege && seedProtege ? seedProtege.coutMainOeuvreHt : brouillon.coutMainOeuvreHt,
    prixVenteHt: protege && seedProtege ? seedProtege.prixVenteHt : brouillon.prixVenteHt,
    tauxTva: protege && seedProtege ? seedProtege.tauxTva : brouillon.tauxTva,
    artisan: brouillon.artisan.trim(),
    statut: brouillon.statut,
    garantie: brouillon.garantie.trim(),
    aides: brouillon.aides.trim(),
    notes: brouillon.notes.trim(),
    dateMiseAJour: aujourdHui(),
    actif: brouillon.actif,
    demo: existante?.demo === true || brouillon.demo === true,
    posteIdLegacy: existante?.posteIdLegacy ?? brouillon.posteIdLegacy ?? null,
    referenceMarche: protege ? seedProtege?.referenceMarche : brouillon.referenceMarche ?? existante?.referenceMarche,
    structurePrixInterne: brouillon.structurePrixInterne ?? existante?.structurePrixInterne,
    visibilite: brouillon.visibilite ?? existante?.visibilite,
    modeSousTraitance: brouillon.modeSousTraitance ?? existante?.modeSousTraitance,
    coutFourniturePoseHt: brouillon.coutFourniturePoseHt ?? existante?.coutFourniturePoseHt ?? null,
    ...(estPrioriteTravaux(brouillon.prioriteTravaux)
      ? { prioriteTravaux: brouillon.prioriteTravaux }
      : existante?.prioriteTravaux
        ? { prioriteTravaux: existante.prioriteTravaux }
        : {}),
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
  avecReferenceMarche: number;
  tarifsRestantAVerifier: number;
};

export function diagnostiquerCatalogue(): DiagnosticCatalogue {
  const prestations = listerPrestationsCalculees();
  let sansCategorie = 0;
  let sansSousCategorie = 0;
  let sousCategorieIncoherente = 0;
  let sansTarif = 0;
  let avecTarif = 0;
  let avecReferenceMarche = 0;
  for (const prestation of prestations) {
    if (!getCategorieMetier(prestation.categorieId)) sansCategorie += 1;
    if (!getSousCategorieMetier(prestation.sousCategorieId)) sansSousCategorie += 1;
    else if (!sousCategorieAppartientA(prestation.sousCategorieId, prestation.categorieId)) {
      sousCategorieIncoherente += 1;
    }
    if (prestation.tarifRenseigne) avecTarif += 1;
    else sansTarif += 1;
    if (prestation.referenceMarche) avecReferenceMarche += 1;
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
    avecReferenceMarche,
    tarifsRestantAVerifier: sansTarif,
  };
}

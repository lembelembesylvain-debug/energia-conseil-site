/**
 * Coordination Nationale des Artisans — ENERGIA CONSEIL IA®
 * Couverture France entière · 31 corps de métier.
 */

import { CATEGORIES_METIERS } from "./categories";

export const COORDINATION_NATIONALE = {
  id: "coordination-nationale-mohamed",
  titre: "Coordination Nationale des Artisans — Couverture France Entière",
  drapeau: "🇫🇷",
  responsable: "Mohamed BENAOUDA",
  telephone: "+33 6 34 17 09 47",
  telephoneTel: "+33634170947",
  telephoneAffiche: "06 34 17 09 47",
  whatsappUrl: "https://wa.me/33634170947",
  statut: "31 corps de métier couverts · Déploiement national artisans qualifiés",
  role: "Ordonnancement, Pilotage, Contrôle Sûreté-6™️ et réception de chantiers sans réserve",
  badgeReseau: "Réseau Artisans Disponible",
  mentionTuile: "Coordinateur France : Mohamed BENAOUDA (06 34 17 09 47)",
} as const;

export type CoordinateurLot = {
  id: string;
  nom: string;
  telephone: string;
  telephoneTel: string;
  role: string;
};

/** IDs des 31 corps d'état sous coordination Mohamed (couverture nationale). */
export const CATEGORIES_COORDINATION_MOHAMED: readonly string[] = CATEGORIES_METIERS.map(
  (item) => item.id,
);

export function estCategorieCoordonneeParMohamed(categorieId: string | null | undefined): boolean {
  if (!categorieId) return false;
  return CATEGORIES_COORDINATION_MOHAMED.includes(categorieId);
}

export function coordinateurParDefautPourCategorie(
  categorieId: string | null | undefined,
): CoordinateurLot | null {
  if (!estCategorieCoordonneeParMohamed(categorieId)) return null;
  return {
    id: COORDINATION_NATIONALE.id,
    nom: COORDINATION_NATIONALE.responsable,
    telephone: COORDINATION_NATIONALE.telephoneAffiche,
    telephoneTel: COORDINATION_NATIONALE.telephoneTel,
    role: "Coordinateur France — Coordination Nationale des Artisans",
  };
}

/** Enrichit un lot de travaux avec Mohamed comme coordinateur par défaut. */
export function assignerCoordinateurLot<T extends Record<string, unknown>>(
  lot: T,
  categorieId?: string | null,
): T & { categorieId?: string; coordinateur?: CoordinateurLot } {
  const base = lot && typeof lot === "object" ? { ...lot } : ({} as T);
  const catId = String(categorieId || base.categorieId || "");
  const coordinateur = coordinateurParDefautPourCategorie(catId);
  if (!coordinateur) return { ...base, categorieId: catId || undefined };
  const existant = base.coordinateur as CoordinateurLot | undefined;
  if (existant?.nom && existant.nom !== COORDINATION_NATIONALE.responsable) {
    return { ...base, categorieId: catId || undefined };
  }
  return {
    ...base,
    categorieId: catId || (base.categorieId as string | undefined) || "",
    coordinateur,
  };
}

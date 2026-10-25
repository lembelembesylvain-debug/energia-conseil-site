/**
 * Statut commercial d'un bien : croisement date de DPE (ADEME) et mutations DVF (DGFiP).
 * Seules les mutations rattachées à la parcelle comptent. Une vente de la rue ne change pas le statut.
 */

import { estBailleur, estCibleSolaire, formaterEntierFr, type MarcheDpe } from "./statutMarcheDpe";

export type StatutTransactionId =
  | "vendu_recent"
  | "vente_active"
  | "bailleur_interdit"
  | "occupant_historique";

export interface MutationParcelle {
  date?: string | null;
  prixNet?: number | null;
  prixM2?: number | null;
  surfaceM2?: number | null;
  /** Faux pour une vente de rue ou de proximité : elle ne qualifie pas le bien. */
  surParcelle?: boolean;
}

export interface EntreeStatutTransaction extends MarcheDpe {
  dateDpe?: string | null;
  mutationsDvf?: readonly MutationParcelle[] | null;
  /** Vrai seulement si l'historique consulté couvre au moins 10 ans. */
  couvertureDixAns?: boolean | null;
}

export interface StatutTransaction {
  id: StatutTransactionId | null;
  badge: string;
  titre: string;
  detail: string;
  approche: string | null;
  dateMutation: string | null;
  prixNet: number | null;
  prixM2: number | null;
}

const MOIS_VENTE_RECENTE = 24;
const MOIS_DPE_VENTE_RECENT = 18;
const ANNEES_OCCUPANT_HISTORIQUE = 10;

function parserDate(valeur: string | null | undefined): Date | null {
  if (!valeur) return null;
  const iso = String(valeur).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function decalerMois(date: Date, mois: number): Date {
  const copie = new Date(date.getTime());
  copie.setMonth(copie.getMonth() + mois);
  return copie;
}

function decalerAnnees(date: Date, annees: number): Date {
  const copie = new Date(date.getTime());
  copie.setFullYear(copie.getFullYear() + annees);
  return copie;
}

export function formaterDateMutation(valeur: string | null | undefined): string {
  const date = parserDate(valeur);
  if (!date || !valeur) return "date non précisée";
  const [annee, mois, jour] = String(valeur).slice(0, 10).split("-");
  return `${jour}/${mois}/${annee}`;
}

function derniereMutationParcelle(mutations: readonly MutationParcelle[] | null | undefined): MutationParcelle | null {
  const retenues = (mutations ?? []).filter((mutation) => mutation?.surParcelle !== false && parserDate(mutation?.date));
  retenues.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return retenues[0] ?? null;
}

function vide(id: null): StatutTransaction {
  return {
    id,
    badge: "",
    titre: "",
    detail: "",
    approche: null,
    dateMutation: null,
    prixNet: null,
    prixM2: null,
  };
}

export function classerStatutTransaction(
  entree: EntreeStatutTransaction | null | undefined,
  maintenant: Date = new Date(),
): StatutTransaction {
  if (!entree) return vide(null);
  const mutation = derniereMutationParcelle(entree?.mutationsDvf);
  const dateMutation = parserDate(mutation?.date);
  const dateDpe = parserDate(entree?.dateDpe);
  const seuil24 = decalerMois(maintenant, -MOIS_VENTE_RECENTE);
  const seuilDpe = decalerMois(maintenant, -MOIS_DPE_VENTE_RECENT);
  const seuil10 = decalerAnnees(maintenant, -ANNEES_OCCUPANT_HISTORIQUE);
  const dans24Mois = Boolean(dateMutation && dateMutation >= seuil24 && dateMutation <= maintenant);
  const mutationApresDpe = Boolean(dateDpe && dateMutation && dateMutation > dateDpe && dateMutation <= maintenant);
  // Nouveau propriétaire : vente de la parcelle dans les 24 mois.
  // Une mutation postérieure au DPE mais plus ancienne ne reste pas « récente ».
  const venduRecent = dans24Mois;

  if (venduRecent && mutation) {
    const dateLabel = formaterDateMutation(mutation.date);
    const prix = mutation.prixNet != null ? `${formaterEntierFr(mutation.prixNet)} €` : "prix non communiqué";
    const m2 = mutation.prixM2 != null ? ` (${formaterEntierFr(mutation.prixM2)} €/m²)` : "";
    return {
      id: "vendu_recent",
      badge: "NOUVEL ACQUÉREUR",
      titre: "VENDU RÉCEMMENT (NOUVEAU PROPRIÉTAIRE)",
      detail: `Vendu le ${dateLabel} à ${prix}${m2} - Acquéreur récent avec enveloppe travaux à capter !`,
      approche: "Offre d'accueil Ensemblier : Cadrage rénovation globale / PAC / Solaire avant emménagement.",
      dateMutation: mutation.date ? String(mutation.date).slice(0, 10) : null,
      prixNet: mutation.prixNet ?? null,
      prixM2: mutation.prixM2 ?? null,
    };
  }

  const dpeVenteRecent = !dateDpe || dateDpe >= seuilDpe;
  if (entree?.motifDpe === "vente" && dpeVenteRecent && !mutationApresDpe) {
    return {
      id: "vente_active",
      badge: "EN VENTE",
      titre: "EN VENTE ACTIVE",
      detail: "Bien actuellement sur le marché - Vendeur soumis à obligation d'audit et négociation passoire.",
      approche: null,
      dateMutation: null,
      prixNet: null,
      prixM2: null,
    };
  }

  if (estBailleur(entree) && (entree?.etiquette === "F" || entree?.etiquette === "G") && !dans24Mois) {
    return {
      id: "bailleur_interdit",
      badge: "BAILLEUR / G-F",
      titre: "BAILLEUR / LOCATION INTERDITE",
      detail: "Location interdite (G depuis 2025 / F en 2028) · Loyers bloqués",
      approche: null,
      dateMutation: null,
      prixNet: null,
      prixM2: null,
    };
  }

  const occupantHistorique =
    (dateMutation != null && dateMutation < seuil10) || (!dateMutation && entree?.couvertureDixAns === true);
  if (occupantHistorique) {
    return {
      id: "occupant_historique",
      badge: "OCCUPANT",
      titre: "OCCUPANT HISTORIQUE",
      detail: "Aucune mutation DVF depuis plus de 10 ans.",
      approche: null,
      dateMutation: mutation?.date ? String(mutation.date).slice(0, 10) : null,
      prixNet: mutation?.prixNet ?? null,
      prixM2: mutation?.prixM2 ?? null,
    };
  }

  return vide(null);
}

/** Filtre carte : mutation récente ET (passoire F/G ou cible solaire). */
export function retenirNouvelAcquereur(
  entree: EntreeStatutTransaction | null | undefined,
  maintenant?: Date,
): boolean {
  const statut = classerStatutTransaction(entree, maintenant);
  if (statut?.id !== "vendu_recent") return false;
  const passoire = entree?.etiquette === "F" || entree?.etiquette === "G";
  return passoire || estCibleSolaire(entree);
}

export function encadreMutationPdf(statut: StatutTransaction | null | undefined, montant: string): string | null {
  if (statut?.id !== "vendu_recent" || !statut?.dateMutation || statut?.prixNet == null) return null;
  return `Historique de mutation : Bien acquis le ${formaterDateMutation(statut.dateMutation)} pour ${montant} - Profil : Acquéreur récent en phase de programmation travaux.`;
}

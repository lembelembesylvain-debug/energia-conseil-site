import type { PrestationCalculee, PrestationCatalogue, StatutCatalogue } from "./types";

export function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function montantOuNull(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return round2(value);
}

/**
 * Coût de revient HT = matériel HT + main-d’œuvre HT.
 * Si aucun des deux n’est renseigné : tarif à renseigner (null).
 */
export function coutRevientHt(
  coutMaterielHt: number | null,
  coutMainOeuvreHt: number | null,
): number | null {
  const materiel = montantOuNull(coutMaterielHt);
  const mainOeuvre = montantOuNull(coutMainOeuvreHt);
  if (materiel == null && mainOeuvre == null) return null;
  return round2((materiel ?? 0) + (mainOeuvre ?? 0));
}

/** Marge brute HT = prix de vente HT − coût de revient HT. Ce n’est pas le bénéfice net. */
export function margeBruteHt(prixVenteHt: number | null, coutRevient: number | null): number | null {
  if (prixVenteHt == null || coutRevient == null) return null;
  return round2(prixVenteHt - coutRevient);
}

/**
 * Taux de marge = marge brute HT / prix de vente HT.
 * Distinct du taux de marque (marge / coût de revient).
 */
export function tauxMarge(marge: number | null, prixVenteHt: number | null): number | null {
  if (marge == null || prixVenteHt == null || prixVenteHt <= 0) return null;
  return marge / prixVenteHt;
}

export function montantTva(prixVenteHt: number | null, tauxTva: number): number | null {
  if (prixVenteHt == null) return null;
  return round2(prixVenteHt * tauxTva);
}

export function prixVenteTtc(prixVenteHt: number | null, tva: number | null): number | null {
  if (prixVenteHt == null || tva == null) return null;
  return round2(prixVenteHt + tva);
}

export function tarifEstRenseigne(
  coutRevient: number | null,
  prixVenteHt: number | null,
): boolean {
  return coutRevient != null && prixVenteHt != null && prixVenteHt > 0;
}

export function calculerPrestation(prestation: PrestationCatalogue): PrestationCalculee {
  const revient = coutRevientHt(prestation.coutMaterielHt, prestation.coutMainOeuvreHt);
  const vente = montantOuNull(prestation.prixVenteHt);
  const tva = montantTva(vente, prestation.tauxTva);
  const ttc = prixVenteTtc(vente, tva);
  const marge = margeBruteHt(vente, revient);
  const renseigne = tarifEstRenseigne(revient, vente);
  return {
    ...prestation,
    coutRevientHt: revient,
    montantTva: tva,
    prixVenteTtc: ttc,
    margeBruteHt: marge,
    tauxMarge: tauxMarge(marge, vente),
    tarifRenseigne: renseigne,
    venteInferieureAuCout: Boolean(renseigne && marge != null && marge < 0),
  };
}

export function peutValiderPrestation(prestation: PrestationCatalogue): {
  ok: boolean;
  motif: string | null;
} {
  const calculee = calculerPrestation(prestation);
  if (calculee.coutRevientHt == null) {
    return { ok: false, motif: "Prix artisan à confirmer — coût de revient absent." };
  }
  if (calculee.prixVenteHt == null || calculee.prixVenteHt <= 0) {
    return { ok: false, motif: "Prix de vente à définir." };
  }
  return { ok: true, motif: null };
}

export function statutPeutEtreValide(
  statut: StatutCatalogue,
  prestation: PrestationCatalogue,
): boolean {
  if (statut !== "valide" && statut !== "realise") return true;
  return peutValiderPrestation(prestation).ok;
}

export function formatEuroOuPlaceholder(
  value: number | null | undefined,
  placeholder: string,
): string {
  if (value == null || !Number.isFinite(value)) return placeholder;
  return value.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTauxMarge(taux: number | null | undefined): string {
  if (taux == null || !Number.isFinite(taux)) return "—";
  return `${(taux * 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;
}

export const LIBELLES_STATUT: Record<StatutCatalogue, string> = {
  estimation: "Estimation",
  devis_recu: "Devis reçu",
  valide: "Validé",
  realise: "Réalisé",
  archive: "Archivé",
};

/**
 * Bouclier anti-marge négative & garde-fou financier ENERGIA CONSEIL IA®.
 * Mode A : Marge = Vente client HT − Forfait artisan HT.
 * Mode B : Marge = Vente client HT − (Matériel direct HT + Pose artisan HT).
 * Les PU / totaux commerciaux Brunel & Pereira officiels ne sont jamais réécrits ici.
 */

import { MODE_FOURNITURE_POSE, MODE_POSE_SEULE } from "./sousTraitanceDoubleMode.js";
import {
  decomposerLigneSousTraitance,
  estPosteHorsSousTraitance,
} from "./artisansRge.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { PEREIRA_NERVIEUX_DOSSIER_ID } from "./pereiraNervieuxOfficiel.js";
import { CLOISON_SDB_DOSSIER_ID } from "./cloisonSdbOfficiel.js";
import { GILBERTAS_DOSSIER_ID } from "./gilbertasClermontOfficiel.js";
import { MASSARDIER_LEAD_ID } from "./massardierLeadOfficiel.js";
import { FARISS_DOSSIER_ID } from "./farissLaRicamarieOfficiel.js";

export const TAUX_MARGE_SECURISATION = 0.15;
export const TAUX_MARGE_VIGILANCE = 0.12;
export const TAUX_MARGE_CONFORME = 0.2;

export const STATUT_MARGE_PERTE = "vente_a_perte";
export const STATUT_MARGE_VIGILANCE = "vigilance";
export const STATUT_MARGE_SAINE = "saine";
export const STATUT_MARGE_INCOMPLET = "incomplet";

export const STATUT_DEVIS_CONFORME = "conforme";
export const STATUT_DEVIS_VIGILANCE = "vigilance";
export const STATUT_DEVIS_BLOQUE = "bloque";

export const MOTIF_EXPORT_VENTE_A_PERTE =
  "Vente à perte interdite — Générer le Contrat Officiel et Télécharger PDF sont bloqués tant qu’une marge négative subsiste.";

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function dossierContratOfficiel(dossierId) {
  return (
    dossierId === PEREIRA_NERVIEUX_DOSSIER_ID ||
    dossierId === BRUNEL_DOSSIER_ID ||
    dossierId === CLOISON_SDB_DOSSIER_ID ||
    dossierId === GILBERTAS_DOSSIER_ID ||
    dossierId === MASSARDIER_LEAD_ID ||
    dossierId === FARISS_DOSSIER_ID
  );
}

/**
 * Coût de revient HT selon le mode de sous-traitance.
 * Mode A → forfait artisan ; à défaut matériel + pose.
 * Mode B → matériel direct + pose artisan.
 */
export function coutRevientSelonMode({
  modeSousTraitance,
  coutFourniturePoseHt = null,
  coutMaterielDirectHt = null,
  coutPoseArtisanHt = null,
} = {}) {
  const mat = Number(coutMaterielDirectHt);
  const pose = Number(coutPoseArtisanHt);
  const hasCompose = Number.isFinite(mat) || Number.isFinite(pose);
  const compose = round2((Number.isFinite(mat) ? mat : 0) + (Number.isFinite(pose) ? pose : 0));
  const forfait = Number(coutFourniturePoseHt);
  const hasForfait = coutFourniturePoseHt != null && Number.isFinite(forfait);

  if (modeSousTraitance === MODE_POSE_SEULE) {
    if (hasCompose) return compose;
    return hasForfait ? round2(forfait) : null;
  }
  if (hasForfait) return round2(forfait);
  return hasCompose ? compose : null;
}

export function margeLigneHt(prixVenteHt, coutRevientHt) {
  if (prixVenteHt == null || coutRevientHt == null) return null;
  const vente = Number(prixVenteHt);
  const revient = Number(coutRevientHt);
  if (!Number.isFinite(vente) || !Number.isFinite(revient)) return null;
  return round2(vente - revient);
}

/** Taux de marge = Marge / Prix vente client HT (pas un taux de marque). */
export function tauxMargeLigne(margeHt, prixVenteHt) {
  if (margeHt == null || prixVenteHt == null) return null;
  const vente = Number(prixVenteHt);
  if (!Number.isFinite(vente) || vente <= 0) return null;
  return margeHt / vente;
}

export function statutMargeDepuisMontants(margeHt, tauxMarge) {
  if (margeHt == null) return STATUT_MARGE_INCOMPLET;
  if (margeHt < 0) return STATUT_MARGE_PERTE;
  if (tauxMarge != null && tauxMarge < TAUX_MARGE_VIGILANCE) return STATUT_MARGE_VIGILANCE;
  return STATUT_MARGE_SAINE;
}

export function classesLigneMarge(statut) {
  if (statut === STATUT_MARGE_PERTE) return "border-red-500 bg-red-950/40 text-red-300";
  if (statut === STATUT_MARGE_VIGILANCE) return "border-orange-500/50 bg-orange-950/30";
  return "";
}

export function libelleAlerteMarge(analyseLigne) {
  if (!analyseLigne || analyseLigne.statut === STATUT_MARGE_INCOMPLET) return null;
  if (analyseLigne.statut === STATUT_MARGE_PERTE) {
    const montant = Number(analyseLigne.margeHt).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `⚠️ ALERTE : Marge négative (${montant} € HT) — Vente à perte interdite !`;
  }
  if (analyseLigne.statut === STATUT_MARGE_VIGILANCE) {
    return "⚠️ Vigilance : Marge faible (< 12 %)";
  }
  return null;
}

/**
 * Prix de vente HT minimum pour obtenir `taux` de marge sur CA.
 * 15 % → vente = revient / (1 − 0,15).
 */
export function prixVentePlancherHt(coutRevientHt, taux = TAUX_MARGE_SECURISATION) {
  const cout = Number(coutRevientHt);
  if (!Number.isFinite(cout) || cout < 0) return null;
  const t = Number(taux);
  if (!Number.isFinite(t) || t <= 0 || t >= 1) return round2(cout);
  return round2(cout / (1 - t));
}

export function puHtPlancherDepuisRevientTotal(coutRevientTotalHt, quantite, taux = TAUX_MARGE_SECURISATION) {
  const plancher = prixVentePlancherHt(coutRevientTotalHt, taux);
  if (plancher == null) return null;
  const q = Number(quantite);
  if (!Number.isFinite(q) || q <= 0) return plancher;
  return round2(plancher / q);
}

export function analyserLigneMarge({
  id = "",
  nom = "",
  prixVenteHt = null,
  coutRevientHt = null,
  modeSousTraitance = MODE_FOURNITURE_POSE,
} = {}) {
  const vente = Number(prixVenteHt);
  const revient = Number(coutRevientHt);
  const hasVente = Number.isFinite(vente) && vente > 0;
  const hasRevient = Number.isFinite(revient) && revient >= 0;
  if (!hasVente || !hasRevient) {
    return {
      id,
      nom,
      modeSousTraitance,
      analysable: false,
      statut: STATUT_MARGE_INCOMPLET,
      prixVenteHt: hasVente ? round2(vente) : null,
      coutRevientHt: hasRevient ? round2(revient) : null,
      margeHt: null,
      tauxMarge: null,
      prixPlancher15Ht: hasRevient ? prixVentePlancherHt(revient) : null,
    };
  }
  const margeHt = margeLigneHt(vente, revient);
  const tauxMarge = tauxMargeLigne(margeHt, vente);
  return {
    id,
    nom,
    modeSousTraitance,
    analysable: true,
    statut: statutMargeDepuisMontants(margeHt, tauxMarge),
    prixVenteHt: round2(vente),
    coutRevientHt: round2(revient),
    margeHt,
    tauxMarge,
    prixPlancher15Ht: prixVentePlancherHt(revient),
  };
}

export function analyserPrestationCatalogue(prestation) {
  const vente =
    prestation?.prixVenteHt != null && Number.isFinite(Number(prestation.prixVenteHt))
      ? Number(prestation.prixVenteHt)
      : Number(prestation?.referenceMarche?.priceMedianHT);
  const revient = coutRevientSelonMode({
    modeSousTraitance: prestation?.modeSousTraitance,
    coutFourniturePoseHt: prestation?.coutFourniturePoseHt,
    coutMaterielDirectHt: prestation?.coutMaterielHt,
    coutPoseArtisanHt: prestation?.coutMainOeuvreHt,
  });
  return analyserLigneMarge({
    id: prestation?.id,
    nom: prestation?.nom,
    prixVenteHt: Number.isFinite(vente) && vente > 0 ? vente : null,
    coutRevientHt: revient,
    modeSousTraitance: prestation?.modeSousTraitance || MODE_FOURNITURE_POSE,
  });
}

function revientLigneSansArtisan(ligne) {
  const q = Math.max(0, Number(ligne?.quantite) || 0);
  const unite = String(ligne?.unite || "").toLowerCase();
  const qAchat = unite === "forfait" || unite === "lot" ? (q > 0 ? 1 : 0) : q;
  return coutRevientSelonMode({
    modeSousTraitance: ligne?.modeSousTraitance,
    coutFourniturePoseHt:
      ligne?.coutFourniturePoseSaisiHt ??
      (ligne?.fourniturePosePuHt != null ? Number(ligne.fourniturePosePuHt) * qAchat : ligne?.coutFourniturePoseHt),
    coutMaterielDirectHt:
      ligne?.coutMaterielDirectSaisiHt ??
      (ligne?.materielDirectPuHt != null ? Number(ligne.materielDirectPuHt) * qAchat : null),
    coutPoseArtisanHt:
      ligne?.coutPoseArtisanSaisiHt ??
      (ligne?.poseSeulePuHt != null ? Number(ligne.poseSeulePuHt) * qAchat : null),
  });
}

export function analyserLigneTravaux(ligne, referentiel) {
  if (estPosteHorsSousTraitance(ligne)) {
    return analyserLigneMarge({
      id: ligne?.id,
      nom: ligne?.nom,
      prixVenteHt: ligne?.totalHt,
      coutRevientHt: 0,
      modeSousTraitance: MODE_FOURNITURE_POSE,
    });
  }
  const decomp = decomposerLigneSousTraitance(ligne, referentiel);
  if (decomp?.applicable && decomp.coutRevientHt != null) {
    return analyserLigneMarge({
      id: ligne?.id,
      nom: ligne?.nom,
      prixVenteHt: decomp.venteHt,
      coutRevientHt: decomp.coutRevientHt,
      modeSousTraitance: decomp.mode,
    });
  }
  return analyserLigneMarge({
    id: ligne?.id,
    nom: ligne?.nom,
    prixVenteHt: ligne?.totalHt,
    coutRevientHt: revientLigneSansArtisan(ligne),
    modeSousTraitance: ligne?.modeSousTraitance || MODE_FOURNITURE_POSE,
  });
}

export function statutDevisDepuisAnalyse({ tauxMarge, venteAPerte }) {
  if (venteAPerte || (tauxMarge != null && tauxMarge < TAUX_MARGE_VIGILANCE)) {
    return STATUT_DEVIS_BLOQUE;
  }
  if (tauxMarge != null && tauxMarge < TAUX_MARGE_CONFORME) {
    return STATUT_DEVIS_VIGILANCE;
  }
  return STATUT_DEVIS_CONFORME;
}

export function analyserDevis(travaux, referentiel) {
  const lignesSource = Array.isArray(travaux) ? travaux : [];
  const lignes = lignesSource.map((ligne) => analyserLigneTravaux(ligne, referentiel));
  const totalFactureClientHt = round2(
    lignesSource.reduce((s, l) => s + (Number(l?.totalHt) || 0), 0),
  );
  const totalCoutsAchatHt = round2(
    lignes.reduce((s, l) => s + (l.analysable ? Number(l.coutRevientHt) || 0 : 0), 0),
  );
  const margeBruteHt = round2(totalFactureClientHt - totalCoutsAchatHt);
  const tauxMarge = totalFactureClientHt > 0 ? margeBruteHt / totalFactureClientHt : null;
  const deficitaires = lignes.filter((l) => l.statut === STATUT_MARGE_PERTE);
  const vigilances = lignes.filter((l) => l.statut === STATUT_MARGE_VIGILANCE);
  const venteAPerte = deficitaires.length > 0;
  const statut = statutDevisDepuisAnalyse({ tauxMarge, venteAPerte });
  return {
    lignes,
    totalFactureClientHt,
    totalCoutsAchatHt,
    margeBruteHt,
    tauxMarge,
    venteAPerte,
    nbDeficitaires: deficitaires.length,
    nbVigilances: vigilances.length,
    statut,
    libelleStatut:
      statut === STATUT_DEVIS_CONFORME
        ? "🟢 Rentabilité Conforme (Marge globale ≥ 20 %)"
        : statut === STATUT_DEVIS_VIGILANCE
          ? "🟡 Vigilance (Marge globale entre 12 % et 19,9 %)"
          : "🔴 Bloqué (Marge globale < 12 % ou ligne déficitaire)",
  };
}

export function analyserCatalogue(prestations) {
  const lignesSource = Array.isArray(prestations) ? prestations : [];
  const lignes = lignesSource.map(analyserPrestationCatalogue);
  const analysables = lignes.filter((l) => l.analysable);
  const totalFactureClientHt = round2(analysables.reduce((s, l) => s + (l.prixVenteHt || 0), 0));
  const totalCoutsAchatHt = round2(analysables.reduce((s, l) => s + (l.coutRevientHt || 0), 0));
  const margeBruteHt = round2(totalFactureClientHt - totalCoutsAchatHt);
  const tauxMarge = totalFactureClientHt > 0 ? margeBruteHt / totalFactureClientHt : null;
  const venteAPerte = lignes.some((l) => l.statut === STATUT_MARGE_PERTE);
  const statut = statutDevisDepuisAnalyse({ tauxMarge, venteAPerte });
  return {
    lignes,
    totalFactureClientHt,
    totalCoutsAchatHt,
    margeBruteHt,
    tauxMarge,
    venteAPerte,
    nbDeficitaires: lignes.filter((l) => l.statut === STATUT_MARGE_PERTE).length,
    nbVigilances: lignes.filter((l) => l.statut === STATUT_MARGE_VIGILANCE).length,
    statut,
    libelleStatut:
      statut === STATUT_DEVIS_CONFORME
        ? "🟢 Rentabilité Conforme (Marge globale ≥ 20 %)"
        : statut === STATUT_DEVIS_VIGILANCE
          ? "🟡 Vigilance (Marge globale entre 12 % et 19,9 %)"
          : "🔴 Bloqué (Marge globale < 12 % ou ligne déficitaire)",
  };
}

/**
 * Blocage strict de l’export client (contrat / PDF) si vente à perte.
 * Les contrats officiels Brunel / Pereira déjà signés restent téléchargeables.
 */
export function tenterExportClient({ travaux, dossier, edition, referentiel } = {}) {
  const analyse = analyserDevis(travaux || edition?.travaux, referentiel);
  const officiel =
    dossierContratOfficiel(dossier?.id) || Boolean(edition?.verrouillageOfficiel);
  if (analyse.venteAPerte && !officiel) {
    const noms = analyse.lignes
      .filter((l) => l.statut === STATUT_MARGE_PERTE)
      .map((l) => l.nom || l.id)
      .filter(Boolean)
      .join(", ");
    return {
      ok: false,
      bloque: true,
      analyse,
      motif: `${MOTIF_EXPORT_VENTE_A_PERTE}${noms ? ` Ligne(s) : ${noms}.` : ""}`,
      exceptionOfficielle: false,
    };
  }
  return {
    ok: true,
    bloque: false,
    analyse,
    motif: null,
    exceptionOfficielle: officiel && analyse.venteAPerte,
  };
}

export { MODE_FOURNITURE_POSE, MODE_POSE_SEULE, round2 };

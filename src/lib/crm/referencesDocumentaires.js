/**
 * Références documentaires internes — hors dossier client Feurs.
 * Métadonnées uniquement. Aucun PDF, montant, ligne de travaux ou RFR n’est copié.
 * Le fichier source reste hors dépôt (Downloads).
 */

import { ROLE_ADMIN } from "./roles.js";
import {
  ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
  BRUNEL_DOSSIER_ID,
  LIBELLE_DONNEE_MANQUANTE,
  REFERENCE_BRUNEL_COUBLE_V3_ID,
} from "./brunelWorkingBase.js";

export {
  ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
  LIBELLE_DONNEE_MANQUANTE,
  REFERENCE_BRUNEL_COUBLE_V3_ID,
};

/**
 * Métadonnées du duplicata V3. Pas de totaux, pas de lignes, pas de fichier, pas d’aides.
 * Les adresses ci-dessous décrivent la RÉFÉRENCE, pas le dossier Feurs.
 */
export const REFERENCE_BRUNEL_COUBLE_V3 = {
  id: REFERENCE_BRUNEL_COUBLE_V3_ID,
  type: "devis_officiel_signable",
  numero: "CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL",
  libelle: "Contrat de Contractant Général — BRUNEL / Indivision COUBLE — FINAL 100 m²",
  statut: "Devis V3 Contractant Général validé, en attente signature indivision et acompte",
  source: "depot",
  fichierDansDepot: true,
  cheminPublic: "/DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html",
  dossierFeursId: BRUNEL_DOSSIER_ID,
  associeAuDossierFeurs: true,
  fusionInterdite: false,
  montantsImportes: true,
  lignesTravauxImportees: true,
  aidesImportees: true,
  adressesImporteesVersFeurs: true,
  perimetre: {
    clientMentionne: "Emrick Brunel",
    mandant: "indivision COUBLE",
    villeTravaux: "Bussières",
    codePostalTravaux: "42510",
  },
  alerte: ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
};

export function listerReferencesDocumentaires() {
  return [REFERENCE_BRUNEL_COUBLE_V3];
}

export function sanitiserReferencePourRole(reference, role) {
  if (!reference) return null;
  if (role === ROLE_ADMIN) {
    return {
      ...reference,
      fichier: null,
      totaux: null,
      lignes: [],
      rfr: null,
    };
  }
  return {
    id: reference.id,
    type: reference.type,
    libelle: "Référence documentaire interne — détail réservé à l’administrateur",
    statut: reference.statut,
    associeAuDossierFeurs: false,
    fichierDansDepot: false,
  };
}

export function estFusionFeursBussieresInterdite(dossierFeurs, reference) {
  if (!dossierFeurs || !reference) return true;
  const villeFeurs = String(dossierFeurs.client?.ville || dossierFeurs.ville || "").toLowerCase();
  const villeRef = String(reference.perimetre?.villeTravaux || "").toLowerCase();
  return villeFeurs.includes("feur") && villeRef.includes("bussi");
}

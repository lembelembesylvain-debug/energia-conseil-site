/**
 * Contrôles d’association d’un document importé à un dossier CRM.
 * Aucune fusion Feurs / Bussières. Pereira et Marjollet restent intouchables.
 */

import { SIGNATURES_BUSSIERES_INTERDITES } from "./brunelWorkingBase.js";
import { IDS_DOSSIERS_TEST_PROTEGES } from "./projetsManuels.js";
import { REFERENCE_BRUNEL_COUBLE_V3 } from "./referencesDocumentaires.js";
import { normaliserNom } from "./projetsManuels.js";

export const MESSAGE_CONTRADICTION =
  "Contradiction détectée : vérifier l’identité du client et l’adresse du bien avant association au dossier.";

export const BRUNEL_FEURS_ID = "projet-manuel-brunel-emrick";

const SIGNATURES_INDIVISION_COUBLE = [
  "indivision couble",
  "indivision-couble",
  "couble",
  "dev-2026-brunel-indivision-couble",
];

const SIGNATURES_BUSSIERES_EXTRA = [
  "bussières",
  "bussieres",
  "les lagunes",
  ...SIGNATURES_BUSSIERES_INTERDITES,
];

export function normaliserTexte(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function dossierEstProtege(dossier) {
  const id = dossier?.id || dossier?.dossierId || "";
  return IDS_DOSSIERS_TEST_PROTEGES.includes(id) || dossier?.source === "test-local";
}

export function extraireSignauxIdentite(texte) {
  const brut = String(texte || "");
  const normalise = normaliserTexte(brut);
  const cps = [...brut.matchAll(/\b(\d{5})\b/g)].map((m) => m[1]);
  const referenceDpe = brut.match(/\b(\d{4}[A-Z]\d{5,12})\b/i)?.[1] || null;
  const referenceDevis = brut.match(/\b(DEV-20\d{2}-[A-Z0-9-]+)\b/i)?.[1] || null;
  const referenceCadastrale = brut.match(/\b(\d{3}\s?[A-Z]{1,2}\s?\d{1,4})\b/)?.[1] || null;
  const indivision = /indivision/i.test(brut);
  const signaturesBussieres = SIGNATURES_BUSSIERES_EXTRA.filter((s) => normalise.includes(normaliserTexte(s)));
  const signaturesIndivision = SIGNATURES_INDIVISION_COUBLE.filter((s) => normalise.includes(s));

  return {
    codePostal: cps[0] || null,
    codesPostaux: [...new Set(cps)],
    commune: detecterCommune(brut),
    referenceDpe,
    referenceDevis,
    referenceCadastrale,
    indivision,
    signaturesBussieres,
    signaturesIndivision,
  };
}

function detecterCommune(texte) {
  const ligne = texte.match(/(?:commune|ville)\s*[:\-]\s*([A-Za-zÀ-ÿ'’\- ]{2,40})/i);
  if (ligne?.[1]) return ligne[1].trim();
  if (/feurs/i.test(texte)) return "FEURS";
  if (/bussi[eè]res/i.test(texte)) return "Bussières";
  return null;
}

export function estDocumentBussieresOuCouble(texteOuSignaux) {
  const signaux =
    typeof texteOuSignaux === "string" ? extraireSignauxIdentite(texteOuSignaux) : texteOuSignaux || {};
  if ((signaux.signaturesBussieres || []).length > 0) return true;
  if ((signaux.signaturesIndivision || []).length > 0) return true;
  if ((signaux.codesPostaux || []).includes("42510")) return true;
  const numero = String(signaux.referenceDevis || "").toUpperCase();
  if (numero.includes("COUBLE") || numero.includes(REFERENCE_BRUNEL_COUBLE_V3.numero)) return true;
  const commune = normaliserTexte(signaux.commune);
  if (commune.includes("bussieres")) return true;
  return false;
}

export function estDossierFeurs(dossier) {
  const cp = String(dossier?.codePostal || dossier?.workingBase?.client?.codePostal || "");
  const ville = normaliserTexte(dossier?.ville || dossier?.workingBase?.client?.ville || "");
  return cp === "42110" && ville.includes("feur");
}

/**
 * Bloque l’association automatique si l’identité du bien / client ne correspond pas.
 * Ne fusionne jamais Feurs et Bussières, ni Brunel personnel et Indivision COUBLE.
 */
export function controlerAssociationDocument(dossier, texte, extraits = {}) {
  if (dossierEstProtege(dossier)) {
    return {
      ok: false,
      bloque: true,
      motif: "dossier_protege",
      message: "Les dossiers Pereira et Marjollet sont protégés : aucun import n’est autorisé.",
    };
  }

  const signaux = extraireSignauxIdentite(texte);
  const documentBussieres = estDocumentBussieresOuCouble({ ...signaux, ...extraits });

  if (estDossierFeurs(dossier) && documentBussieres) {
    return {
      ok: false,
      bloque: true,
      motif: "feurs_bussieres",
      message: MESSAGE_CONTRADICTION,
    };
  }

  const cpDossier = String(dossier?.codePostal || dossier?.workingBase?.client?.codePostal || "").trim();
  const cpsDoc = signaux.codesPostaux || [];
  if (cpDossier && cpsDoc.length > 0 && !cpsDoc.includes(cpDossier) && documentBussieres) {
    return {
      ok: false,
      bloque: true,
      motif: "code_postal",
      message: MESSAGE_CONTRADICTION,
    };
  }

  const nomDossier = normaliserNom(dossier?.nom || dossier?.workingBase?.client?.nom || "");
  const nomExtrait = normaliserNom(extraits.nomClient || "");
  if (nomDossier && nomExtrait && nomDossier !== nomExtrait && documentBussieres) {
    return {
      ok: false,
      bloque: true,
      motif: "nom_client",
      message: MESSAGE_CONTRADICTION,
    };
  }

  const villeDossier = normaliserTexte(dossier?.ville || dossier?.workingBase?.client?.ville || "");
  const communeDoc = normaliserTexte(signaux.commune);
  if (villeDossier && communeDoc && villeDossier !== communeDoc) {
    const feursVsBussieres =
      (villeDossier.includes("feur") && communeDoc.includes("bussieres")) ||
      (villeDossier.includes("bussieres") && communeDoc.includes("feur"));
    if (feursVsBussieres) {
      return {
        ok: false,
        bloque: true,
        motif: "commune",
        message: MESSAGE_CONTRADICTION,
      };
    }
  }

  return { ok: true, bloque: false, motif: null, message: null, signaux };
}

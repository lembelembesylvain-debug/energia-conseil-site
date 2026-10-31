/**
 * Import CRM — lots A à C.
 * Métadonnées + propositions d’extraction. Aucune écriture dans le logement,
 * aucun calcul d’aides, aucun devis / rapport / financement généré.
 */

import { fusionnerChampsSansEcrasement, appliquerActionChamp } from "./extractionChamps.js";
import { controlerAssociationDocument, dossierEstProtege, MESSAGE_CONTRADICTION } from "./gardeFousImport.js";
import { analyserDocument, FORMATS_ACCEPTES, TYPES_DOCUMENTS } from "./parseurs/index.js";
import { peutImporterDocument } from "./roles.js";
import { lienSecuriseCoffre } from "./coffreDocuments.js";
import { BRUNEL_DOSSIER_ID, enregistrerPrefillBrunel, lireBaseTravailBrunel } from "./brunelWorkingBase.js";
import { appliquerChampsValides, deriverStatutDossierTravail } from "./prefillDossier.js";

export { FORMATS_ACCEPTES, TYPES_DOCUMENTS, MESSAGE_CONTRADICTION };
export { analyserDocument } from "./parseurs/index.js";

export const STORAGE_IMPORTS = "energia-crm-imports-v1";

const memoire = new Map();

function lireTout() {
  if (typeof localStorage === "undefined") {
    const obj = {};
    for (const [k, v] of memoire.entries()) obj[k] = v;
    return obj;
  }
  try {
    const raw = localStorage.getItem(STORAGE_IMPORTS);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function ecrireTout(etat) {
  if (typeof localStorage === "undefined") {
    memoire.clear();
    Object.entries(etat).forEach(([k, v]) => memoire.set(k, v));
    return;
  }
  try {
    localStorage.setItem(STORAGE_IMPORTS, JSON.stringify(etat));
  } catch {
    /* quota : métadonnées seulement, jamais d’octets fichier ici */
  }
}

function dossierIdDe(dossier) {
  return dossier?.id || dossier?.dossierId || "";
}

export function etatImportVide() {
  return { documents: [], champs: [], journal: [] };
}

export function lireEtatImport(dossierId) {
  if (!dossierId) return etatImportVide();
  const tout = lireTout();
  const etat = tout[dossierId];
  if (!etat || typeof etat !== "object") return etatImportVide();
  return {
    documents: Array.isArray(etat.documents) ? etat.documents : [],
    champs: Array.isArray(etat.champs) ? etat.champs : [],
    journal: Array.isArray(etat.journal) ? etat.journal : [],
  };
}

export function reinitialiserImportsTests() {
  memoire.clear();
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_IMPORTS);
    } catch {
      /* ignore */
    }
  }
}

function pousserJournal(journal, entree) {
  return [
    {
      date: new Date().toISOString(),
      ...entree,
    },
    ...(journal || []),
  ].slice(0, 100);
}

function synchroniserPrefillBrunel(dossierId, champs, documents) {
  if (dossierId !== BRUNEL_DOSSIER_ID) return null;
  const actuel = lireBaseTravailBrunel();
  const applique = appliquerChampsValides(actuel, champs);
  if (!applique.ok) return actuel;
  const statutDossierTravail = deriverStatutDossierTravail({
    base: applique.base,
    champs,
    documents,
  });
  return enregistrerPrefillBrunel({
    logement: applique.base.logement,
    client: applique.base.client,
    travauxProposes: applique.base.travauxProposes,
    logementSources: applique.base.logementSources,
    logementExtras: applique.base.logementExtras,
    recommandationsImport: applique.base.recommandationsImport,
    statutDossierTravail,
  });
}

function nouvelId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function synchroniserPrefillDossier(dossierId) {
  const etat = lireEtatImport(dossierId);
  return synchroniserPrefillBrunel(dossierId, etat.champs, etat.documents);
}

export function importerDocument({
  dossier,
  role,
  utilisateur = "administrateur",
  nomFichier,
  typeMime = "",
  typeDocument = "autre",
  texte = "",
  binaire = null,
  inflateRaw = null,
  persisterBlob = false,
}) {
  if (!peutImporterDocument(role)) {
    return {
      ok: false,
      message: "Seul l’administrateur peut importer un document dans le dossier.",
      document: null,
      etat: lireEtatImport(dossierIdDe(dossier)),
    };
  }

  if (dossierEstProtege(dossier)) {
    return {
      ok: false,
      message: "Les dossiers Pereira et Marjollet sont protégés : aucun import n’est autorisé.",
      document: null,
      etat: lireEtatImport(dossierIdDe(dossier)),
    };
  }

  const dossierId = dossierIdDe(dossier);
  if (!dossierId) {
    return { ok: false, message: "Dossier introuvable.", document: null, etat: etatImportVide() };
  }

  const analyse = analyserDocument({
    nomFichier,
    typeMime,
    typeDocument,
    texte,
    binaire,
    inflateRaw,
  });

  const controle = controlerAssociationDocument(dossier, analyse.texte || texte);
  const documentId = nouvelId("doc");
  const dateImport = new Date().toISOString();

  const document = {
    id: documentId,
    dossierId,
    nomFichier: String(nomFichier || "document").replace(/^.*[\\/]/, ""),
    type: typeDocument,
    typeMime,
    dateImport,
    importePar: utilisateur,
    statutAnalyse: controle.bloque ? "bloque_contradiction" : analyse.statutAnalyse,
    niveauConfiance: controle.bloque ? "none" : analyse.niveauConfiance,
    lienSecurise: persisterBlob ? lienSecuriseCoffre(documentId) : null,
    tailleOctets: binaire ? binaire.byteLength || binaire.length || null : null,
    motif: controle.bloque ? controle.motif : analyse.motif,
    sensible: Boolean(analyse.sensible),
    historique: [
      {
        date: dateImport,
        action: controle.bloque ? "import_bloque" : "import",
        auteur: utilisateur,
      },
    ],
  };

  const etat = lireEtatImport(dossierId);
  let champs = etat.champs;
  let message = null;
  let ok = true;

  if (controle.bloque) {
    ok = false;
    message = controle.message || MESSAGE_CONTRADICTION;
  } else {
    champs = fusionnerChampsSansEcrasement(etat.champs, analyse.champs);
  }

  const journal = pousserJournal(etat.journal, {
    auteur: utilisateur,
    action: controle.bloque ? "import_bloque_contradiction" : "import_document",
    ancienneValeur: null,
    nouvelleValeur: document.nomFichier,
    documentId,
    typeDocument,
    statutAnalyse: document.statutAnalyse,
  });

  const suivant = {
    documents: [document, ...etat.documents],
    champs,
    journal,
  };

  const tout = lireTout();
  tout[dossierId] = suivant;
  ecrireTout(tout);

  if (ok) {
    synchroniserPrefillBrunel(dossierId, champs, suivant.documents);
  }

  return {
    ok,
    message,
    document,
    champsProposes: controle.bloque ? [] : analyse.champs,
    etat: suivant,
    publication: false,
    aidesCalculees: false,
    documentFinalGenere: false,
  };
}

export function revoirChampImport(dossierId, champId, action, payload = {}, role, utilisateur = "administrateur") {
  if (!peutImporterDocument(role)) {
    return { ok: false, message: "Seul l’administrateur peut valider, modifier ou rejeter une extraction.", etat: lireEtatImport(dossierId) };
  }
  const etat = lireEtatImport(dossierId);
  const champs = appliquerActionChamp(etat.champs, champId, action, payload, utilisateur);
  const journal = pousserJournal(etat.journal, {
    auteur: utilisateur,
    action: `revue_${action}`,
    ancienneValeur: etat.champs.find((c) => c.id === champId)?.value ?? null,
    nouvelleValeur: action === "modifier" ? payload.valeur : action,
    champId,
  });
  const suivant = { ...etat, champs, journal };
  const tout = lireTout();
  tout[dossierId] = suivant;
  ecrireTout(tout);
  const base = synchroniserPrefillBrunel(dossierId, champs, suivant.documents);
  return { ok: true, etat: suivant, base };
}

export function sanitiserEtatImportPourRole(etat, role) {
  if (peutImporterDocument(role)) return etat;
  return {
    documents: (etat?.documents || []).map((doc) => ({
      id: doc.id,
      nomFichier: doc.sensible ? "Document reçu — accès administrateur" : doc.nomFichier,
      type: doc.type,
      dateImport: doc.dateImport,
      statutAnalyse: doc.statutAnalyse,
      sensible: doc.sensible,
      lienSecurise: null,
    })),
    champs: [],
    journal: [],
  };
}

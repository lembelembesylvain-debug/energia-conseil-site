/**
 * Base de travail CRM — dossier Emrick Brunel / Indivision COUBLE (42510 Bussières).
 *
 * Audit brouillon, devis estimatif vide non contractuel, rapport bloqué.
 * Aucun PDF n’est généré ici. Aucun HTML client existant n’est lié ni modifié.
 * Les HTML Brunel Bussières du dépôt restent hors de ce dossier.
 */

import { ROLE_ADMIN, peutValiderDossier, peutVoirAlertesIdentite, peutVoirDocumentsSensibles, peutVoirRfr } from "./roles.js";
import {
  STATUT_AIDES_VALIDE,
  appliquerDateLigne,
  creerVerificationAidesDossier,
  marquerAidesVerifieesWeb,
  mettreAJourSourceVerification,
  passerAidesValidees,
} from "../aides/verificationLive.js";
import {
  CADRE_JURIDIQUE_INDIVISION_815,
  STATUT_DOSSIER_BRUNEL_V4,
} from "./brunelDevisV3Officiel.js";

export const BRUNEL_DOSSIER_ID = "projet-manuel-brunel-emrick";

export const REFERENCE_BRUNEL_COUBLE_V3_ID = "ref-doc-brunel-indivision-couble-v3";

export const STORAGE_BRUNEL_WORKING = "energia-crm-brunel-working-v1";

export const LIBELLE_DONNEE_MANQUANTE = "DONNÉE MANQUANTE";

export const MENTION_ESTIMATION_INDICATIVE =
  "Estimation indicative à confirmer par relevés, étude complète et devis professionnels.";

export const TAMPON_DEVIS_NON_CONTRACTUEL = "ESTIMATION — NON CONTRACTUELLE";

export const MENTION_DEVIS_VIDE =
  "Montants indicatifs à confirmer par relevés, étude complète et devis professionnels. Hors aides définitives, hors aléas et travaux supplémentaires.";

export const ALERTE_NAISSANCE_BRUNEL =
  "Date de naissance à confirmer entre les documents transmis. Ne pas corriger automatiquement.";

export const ALERTE_REFERENCE_BUSSIERES_DISTINCTE =
  "Contrat de Contractant Général Indivision COUBLE / Bussières (CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL, 100 m²) associé au dossier Brunel.";

export const CLAUSE_INDIVISION_COUBLE_815 =
  "Indivision COUBLE — Article 815 du Code Civil : accord unanime et signature obligatoire de TOUS les indivisaires sous peine de nullité du contrat et des aides";

export const LIBELLE_PIECE_IDENTITE_SECURISEE = "Pièce d’identité reçue — document sécurisé";

/** Signaux du devis V3 Bussières — interdits dans le logement / devis / aides Feurs. */
export const SIGNATURES_BUSSIERES_INTERDITES = [
  "42510",
  "lagunes",
  "20216",
  "27502",
  "26067",
  "23615",
  "montrambert",
  "chambon-feugerolles",
  "06 50 26 31 83",
];

export const CHAMPS_LOGEMENT_REQUIS = [
  { id: "typeBatiment", label: "Type de bâtiment" },
  { id: "typeLogement", label: "Maison ou appartement" },
  { id: "surfaceHabitable", label: "Surface habitable" },
  { id: "anneeConstruction", label: "Année de construction" },
  { id: "nombreNiveaux", label: "Nombre de niveaux" },
  { id: "dpeFourni", label: "DPE fourni par le client" },
  { id: "chauffageExistant", label: "Chauffage existant" },
  { id: "ventilation", label: "Ventilation" },
  { id: "menuiseries", label: "Menuiseries" },
  { id: "toiture", label: "Toiture" },
  { id: "murs", label: "Murs" },
  { id: "plancher", label: "Plancher" },
  { id: "adresseExacte", label: "Adresse exacte du logement" },
  { id: "consommationAnnuelle", label: "Consommation annuelle" },
  { id: "photos", label: "Photos du logement" },
  { id: "contraintesParticulieres", label: "Contraintes particulières" },
];

/** Liaison aux modèles existants — chemins internes, jamais servis au client. */
export const MODELES_LIES = {
  auditTypes: "src/types/audit.ts",
  devisPdf: "src/lib/generateDevisPdf.ts",
  aides: "src/data/aidRules2026.ts",
  chiffrage: "src/lib/chiffrage/devis-client.ts",
};

export function logementManquant(logement) {
  const source = logement && typeof logement === "object" ? logement : {};
  return CHAMPS_LOGEMENT_REQUIS.filter((champ) => {
    const value = source[champ.id];
    return value == null || String(value).trim() === "";
  });
}

export function logementComplet(logement) {
  return logementManquant(logement).length === 0;
}

export function payloadFeursHorsAlertes(base) {
  if (!base || typeof base !== "object") return "";
  const { alertes, alertesAdmin, ...reste } = base;
  return JSON.stringify(reste).toLowerCase();
}

export function detecterContaminationBussieres(base) {
  /* Le devis V3 Bussières est désormais le dossier officiel Brunel. */
  void base;
  return [];
}

function journalVide() {
  return [
    {
      date: "2026-09-14",
      auteur: "systeme",
      action: "creation_base_travail",
      ancienneValeur: null,
      nouvelleValeur: "dossier Feurs — documents reçus, logement non relevé",
    },
  ];
}

export function creerBaseTravailBrunel() {
  const logement = Object.fromEntries(CHAMPS_LOGEMENT_REQUIS.map((champ) => [champ.id, null]));

  return {
    id: BRUNEL_DOSSIER_ID,
    client: {
      nom: "Emrick Brunel",
      prenoms: "Emrick",
      profession: "préparateur de commande",
      ville: "BUSSIÈRES",
      codePostal: "42510",
      telephone: "06 50 26 31 83",
      email: "brunelemrick@gmail.com",
      adresse: "48 Impasse des Lagunes, 42510 BUSSIÈRES",
      adresseDomicile: "111 Rue Poliacus, 42110 POUILLY-LÈS-FEURS",
      mandant: "Indivision COUBLE",
      cadreJuridique: CADRE_JURIDIQUE_INDIVISION_815,
      occupants: null,
      partsIndiquees: 1,
      foyerReelVerifie: false,
    },
    rfr: {
      montant: 20216,
      anneeRevenus: 2024,
      anneeAvis: 2025,
      libelle: "RFR reçu : 20 216 € — catégorie d’aide à confirmer",
      categorieAide: null,
    },
    statutDossier: STATUT_DOSSIER_BRUNEL_V4,
    referenceDistincteId: REFERENCE_BRUNEL_COUBLE_V3_ID,
    referenceDistincteAssociee: true,
    alertesAdmin: [ALERTE_NAISSANCE_BRUNEL, CLAUSE_INDIVISION_COUBLE_815],
    alertes: [ALERTE_NAISSANCE_BRUNEL, CLAUSE_INDIVISION_COUBLE_815],
    mention: MENTION_ESTIMATION_INDICATIVE,
    aidesVerification: creerVerificationAidesDossier(),
    source_verification_url: creerVerificationAidesDossier().source_verification_url,
    logement,
    pieces: [
      {
        type: "identite",
        recu: true,
        libellePublic: LIBELLE_PIECE_IDENTITE_SECURISEE,
        numero: null,
        fichier: null,
        sensible: true,
      },
      {
        type: "avis_impot",
        recu: true,
        libellePublic: "Avis d’impôt reçu — document sécurisé",
        fichier: null,
        sensible: true,
        fiscal: true,
      },
      {
        type: "notarial",
        recu: true,
        libellePublic: "Justificatif notarial reçu — document sécurisé",
        fichier: null,
        sensible: true,
      },
    ],
    documents: {
      audit: {
        statut: "brouillon",
        publie: false,
        titre: "Audit énergétique — brouillon interne",
        modele: MODELES_LIES.auditTypes,
        dpeOfficiel: false,
        lignesTravaux: [],
      },
      devis: {
        statut: "estimatif_non_contractuel",
        publie: false,
        tampon: TAMPON_DEVIS_NON_CONTRACTUEL,
        mention: MENTION_DEVIS_VIDE,
        modele: MODELES_LIES.devisPdf,
        lignes: [],
        totalHt: null,
        totalTva: null,
        totalTtc: null,
        prixFerme: false,
        aidesImportees: false,
      },
      rapport: {
        statut: "non_genere",
        bloque: true,
        publie: false,
        raison: "Données du logement incomplètes — rapport final non généré.",
      },
    },
    validationHumaine: {
      enregistreBrouillon: true,
      valideAdmin: false,
      transmissionAutorisee: false,
    },
    journal: journalVide(),
    travauxProposes: [],
    logementSources: {},
    logementExtras: {},
    recommandationsImport: [],
    financesInternes: { coutArtisanHt: null, prixVenteHt: null, statutPaiement: null },
    statutDossierTravail: STATUT_DOSSIER_BRUNEL_V4,
  };
}

export function construireEntreeDevisEstimatif(base) {
  const dossier = base ?? creerBaseTravailBrunel();
  const adresse = [dossier.client.codePostal, dossier.client.ville].filter(Boolean).join(" ");
  return {
    numero: "EST-BRUNEL-BUSSIERES-BROUILLON",
    date: "2026-09-14",
    validite: "non contractuel — non transmissible",
    clientNom: dossier.client.nom,
    clientAdresse: adresse,
    statut: TAMPON_DEVIS_NON_CONTRACTUEL,
    libelleProjet: "Base de travail — prestations à définir après visite",
    introductionProjet: `${MENTION_ESTIMATION_INDICATIVE} ${MENTION_DEVIS_VIDE}`,
    lignes: [],
    totalHt: null,
    totalTva: null,
    totalTtc: null,
    filename: null,
  };
}

export function listerControlesBloquants(base) {
  const dossier = base ?? creerBaseTravailBrunel();
  const raisons = [];
  const manquants = logementManquant(dossier.logement);
  if (manquants.length > 0) {
    raisons.push(`Logement incomplet (${manquants.length} champ(s) : ${manquants.map((c) => c.label).join(", ")}).`);
  }
  if (dossier.documents.devis.prixFerme) {
    raisons.push("Un prix ferme ne peut pas être déduit d’une fourchette de marché.");
  }
  if (dossier.documents.devis.totalHt != null || dossier.documents.devis.totalTtc != null) {
    raisons.push("Aucun total travaux ne doit être affiché tant que les lignes sont vides.");
  }
  if (dossier.rfr.categorieAide != null) {
    raisons.push("Catégorie MaPrimeRénov’ inventée — interdite.");
  }
  if (dossier.documents.audit.dpeOfficiel) {
    raisons.push("Une simulation ne peut pas être présentée comme un DPE officiel.");
  }
  if (!dossier.validationHumaine.valideAdmin) {
    raisons.push("Validation humaine administrateur absente.");
  }
  if (dossier.documents.audit.publie || dossier.documents.devis.publie || dossier.documents.rapport.publie) {
    raisons.push("Un document a été marqué publié sans génération autorisée.");
  }
  const verif = dossier.aidesVerification ?? creerVerificationAidesDossier();
  if (verif.statut === STATUT_AIDES_VALIDE && !verif.aides_verifiees_web) {
    raisons.push("Aides au statut Validé sans marquage « Vérifiées Web ».");
  }
  if (dossier.documents.audit.statut === STATUT_AIDES_VALIDE && !verif.aides_verifiees_web) {
    raisons.push("Passage Brouillon → Validé bloqué : aides non marquées « Vérifiées Web ».");
  }
  return raisons;
}

export function peutGenererDocumentFinal(base, role) {
  if (!peutValiderDossier(role)) {
    return { ok: false, bloque: true, raisons: ["Seul l’administrateur peut générer un document final."] };
  }
  const raisons = listerControlesBloquants(base);
  return { ok: raisons.length === 0, bloque: raisons.length > 0, raisons };
}

let memoireWorking = null;

function lireEtatStocke() {
  if (typeof localStorage === "undefined") {
    return memoireWorking;
  }
  try {
    const raw = localStorage.getItem(STORAGE_BRUNEL_WORKING);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function ecrireEtatStocke(etat) {
  if (typeof localStorage === "undefined") {
    memoireWorking = etat;
    return;
  }
  try {
    localStorage.setItem(STORAGE_BRUNEL_WORKING, JSON.stringify(etat));
  } catch {
    /* quota */
  }
}

export function reinitialiserBaseTravailTests() {
  memoireWorking = null;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_BRUNEL_WORKING);
    } catch {
      /* ignore */
    }
  }
}

function persisterBase(base, extra = {}) {
  ecrireEtatStocke({
    enregistreBrouillon: base.validationHumaine.enregistreBrouillon,
    enregistrementBrouillon: base.validationHumaine.enregistreBrouillon,
    valideAdmin: base.validationHumaine.valideAdmin,
    journal: base.journal,
    aidesVerification: base.aidesVerification,
    logement: extra.logement ?? base.logement,
    client: extra.client ?? base.client,
    travauxProposes: extra.travauxProposes ?? base.travauxProposes,
    logementSources: extra.logementSources ?? base.logementSources,
    logementExtras: extra.logementExtras ?? base.logementExtras,
    recommandationsImport: extra.recommandationsImport ?? base.recommandationsImport,
    financesInternes: extra.financesInternes ?? base.financesInternes,
    statutDossierTravail: extra.statutDossierTravail ?? base.statutDossierTravail,
    ...extra,
  });
}

export function lireBaseTravailBrunel() {
  const base = creerBaseTravailBrunel();
  const stocke = lireEtatStocke();
  if (!stocke) return base;
  return {
    ...base,
    client: {
      ...base.client,
      ...(stocke.client || {}),
      nom: base.client.nom,
      prenoms: base.client.prenoms,
      mandant: base.client.mandant,
      cadreJuridique: base.client.cadreJuridique,
      ville: base.client.ville,
      codePostal: base.client.codePostal,
      adresse: base.client.adresse,
      adresseDomicile: base.client.adresseDomicile,
      telephone: base.client.telephone,
      email: base.client.email,
    },
    rfr: { ...base.rfr },
    logement: { ...base.logement, ...(stocke.logement || {}) },
    travauxProposes: Array.isArray(stocke.travauxProposes) ? stocke.travauxProposes : [],
    logementSources: stocke.logementSources || {},
    logementExtras: stocke.logementExtras || {},
    recommandationsImport: Array.isArray(stocke.recommandationsImport) ? stocke.recommandationsImport : [],
    financesInternes: stocke.financesInternes || base.financesInternes,
    statutDossierTravail: stocke.statutDossierTravail || base.statutDossierTravail,
    aidesVerification: stocke.aidesVerification ?? base.aidesVerification,
    source_verification_url:
      stocke.aidesVerification?.source_verification_url ?? base.source_verification_url,
    validationHumaine: {
      ...base.validationHumaine,
      enregistreBrouillon: stocke.enregistrementBrouillon !== false,
      valideAdmin: stocke.valideAdmin === true,
      transmissionAutorisee: false,
    },
    journal: Array.isArray(stocke.journal) && stocke.journal.length > 0 ? stocke.journal : base.journal,
  };
}

export function enregistrerPrefillBrunel(extra) {
  const actuel = lireBaseTravailBrunel();
  const journal = pousserJournal(actuel.journal, "prefill_controle", extra?.statutDossierTravail || "préremplissage contrôlé");
  persisterBase({ ...actuel, journal }, extra);
  return lireBaseTravailBrunel();
}

function pousserJournal(journal, action, nouvelleValeur) {
  return [
    {
      date: new Date().toISOString().slice(0, 10),
      auteur: "administrateur",
      action,
      ancienneValeur: null,
      nouvelleValeur,
    },
    ...journal,
  ].slice(0, 50);
}

export function enregistrerBrouillonBrunel() {
  const actuel = lireBaseTravailBrunel();
  const journal = pousserJournal(actuel.journal, "enregistrer_brouillon", "Base de travail conservée — non transmise");
  persisterBase({ ...actuel, journal, validationHumaine: { ...actuel.validationHumaine, enregistreBrouillon: true } });
  return lireBaseTravailBrunel();
}

export function validerParAdministrateurBrunel() {
  const actuel = lireBaseTravailBrunel();
  const journal = pousserJournal(
    actuel.journal,
    "validation_admin",
    "Vérification administrateur enregistrée — génération finale toujours soumise aux contrôles",
  );
  persisterBase({
    ...actuel,
    journal,
    validationHumaine: { ...actuel.validationHumaine, enregistreBrouillon: true, valideAdmin: true },
  });
  return lireBaseTravailBrunel();
}

export function marquerAidesVerifieesWebBrunel(url) {
  const actuel = lireBaseTravailBrunel();
  const aidesVerification = marquerAidesVerifieesWeb(actuel.aidesVerification, {
    auteur: "administrateur",
    url,
  });
  const journal = pousserJournal(actuel.journal, "aides_verifiees_web", aidesVerification.source_verification_url);
  persisterBase({ ...actuel, aidesVerification, journal }, { journal, aidesVerification });
  return lireBaseTravailBrunel();
}

export function appliquerDateVerificationAideBrunel(ligneId, date) {
  const actuel = lireBaseTravailBrunel();
  const aidesVerification = appliquerDateLigne(actuel.aidesVerification, ligneId, date);
  persisterBase({ ...actuel, aidesVerification }, { aidesVerification, journal: actuel.journal });
  return lireBaseTravailBrunel();
}

export function mettreSourceVerificationBrunel(url) {
  const actuel = lireBaseTravailBrunel();
  const aidesVerification = mettreAJourSourceVerification(actuel.aidesVerification, url);
  persisterBase({ ...actuel, aidesVerification }, { aidesVerification, journal: actuel.journal });
  return lireBaseTravailBrunel();
}

export function passerAidesValideesBrunel() {
  const actuel = lireBaseTravailBrunel();
  const resultat = passerAidesValidees(actuel.aidesVerification);
  if (!resultat.ok) {
    return { ok: false, raisons: resultat.raisons, base: actuel };
  }
  const journal = pousserJournal(actuel.journal, "aides_validees", "Statut aides Validé après Vérifiées Web");
  persisterBase({ ...actuel, aidesVerification: resultat.verification, journal });
  return { ok: true, raisons: [], base: lireBaseTravailBrunel() };
}

export function tenterGenererDocumentFinalBrunel(role) {
  const base = lireBaseTravailBrunel();
  const resultat = peutGenererDocumentFinal(base, role);
  if (!resultat.ok) {
    return { ...resultat, genere: false };
  }
  return {
    ok: false,
    bloque: true,
    genere: false,
    raisons: ["Génération finale non branchée : aucun PDF n’est produit automatiquement."],
  };
}

export function sanitiserBasePourRole(base, role) {
  if (!base) return null;
  const pieces = (base.pieces ?? [])
    .map((piece) => {
      if (peutVoirDocumentsSensibles(role)) {
        return { ...piece, numero: null, fichier: null };
      }
      if (piece.type === "identite") {
        return {
          type: piece.type,
          recu: piece.recu,
          libellePublic: LIBELLE_PIECE_IDENTITE_SECURISEE,
          sensible: true,
        };
      }
      return null;
    })
    .filter(Boolean);

  const rfr = peutVoirRfr(role) ? base.rfr : { montant: null, libelle: "", categorieAide: null };
  const alertesAdmin = peutVoirAlertesIdentite(role) ? base.alertesAdmin ?? base.alertes ?? [] : [];

  return {
    ...base,
    rfr,
    pieces,
    journal: role === ROLE_ADMIN ? base.journal : [],
    validationHumaine: base.validationHumaine,
    alertes: alertesAdmin,
    alertesAdmin,
    referenceDistincteId: peutVoirAlertesIdentite(role) ? base.referenceDistincteId : null,
    financesInternes:
      role === ROLE_ADMIN
        ? base.financesInternes
        : { coutArtisanHt: null, prixVenteHt: null, statutPaiement: null },
    travauxProposes: (base.travauxProposes || []).map((ligne) => ({
      ...ligne,
      prixFerme: false,
    })),
  };
}

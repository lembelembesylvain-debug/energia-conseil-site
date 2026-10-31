/**
 * Projets CRM créés manuellement par l’administrateur.
 * Persistance localStorage. Pereira / Marjollet ne sont jamais modifiés ici.
 * Le RFR n’est jamais transformé en catégorie MaPrimeRénov’.
 */

import { ROLE_ADMIN, peutVoirAlertesIdentite, peutVoirCoutsInternes, peutVoirRfr } from "./roles.js";
import { TYPES_AUDIT_MARCHE, libelleBureauEtudes } from "./betNomosOfficiel.js";
import { BRUNEL_DOSSIER_ID, lireBaseTravailBrunel, sanitiserBasePourRole } from "./brunelWorkingBase.js";
import {
  MARGE_NETTE_DIRECTION_BRUNEL,
  NOTE_PORTE_SERVICE_HORS_MARCHE,
  STATUT_DOSSIER_BRUNEL_V4,
} from "./brunelDevisV3Officiel.js";
import {
  DETAIL_JALON_BRUNEL_DEPOT_MAR,
  MARGE_CG_BRUNEL_HT,
  PROFIL_ANAH_BRUNEL,
  STATUT_CRM_BRUNEL_MARCHE,
  TOTAUX_DEVIS_HORS_ANAH,
  TOTAUX_OPTION_BAIE,
} from "./brunelMarcheOfficiel2026.js";
import {
  PEREIRA_NERVIEUX_DOSSIER_ID,
  PEREIRA_NERVIEUX_NUMERO,
  PROJET_PEREIRA_NERVIEUX_DEFAUT,
  FINANCEMENT_PEREIRA_CG,
  TOTAUX_CG_20_PEREIRA,
  totauxContractuelsPereiraNervieux,
} from "./pereiraNervieuxOfficiel.js";
import {
  EQUIPE_GILBERTAS,
  FINANCEMENT_GILBERTAS,
  GILBERTAS_DOSSIER_ID,
  GILBERTAS_REFERENCE,
  PHASE_GILBERTAS,
  PROJET_GILBERTAS_DEFAUT,
  STATUT_GILBERTAS,
  TOTAUX_GILBERTAS,
  lotsGilbertasPourTravaux,
} from "./gilbertasClermontOfficiel.js";
import {
  EQUIPE_MASSARDIER,
  MASSARDIER_LEAD_ID,
  MASSARDIER_REFERENCE,
  MONTANT_ESTIME_MASSARDIER_TTC,
  PRIORITE_MASSARDIER,
  PROJET_MASSARDIER_DEFAUT,
  SOURCE_MASSARDIER,
  STATUT_MASSARDIER,
  TOTAUX_MASSARDIER,
} from "./massardierLeadOfficiel.js";
import {
  LANOUX_LEAD_ID,
  PROJET_LANOUX_DEFAUT,
  STATUT_LANOUX,
} from "./lanouxBordeauxOfficiel.js";
import {
  CLOISON_SDB_DOSSIER_ID,
  CLOISON_SDB_REFERENCE,
  EQUIPE_CLOISON_SDB,
  FINANCEMENT_CLOISON_SDB,
  PHASE_CLOISON_SDB,
  PROJET_CLOISON_SDB_DEFAUT,
  SOURCE_CLOISON_SDB,
  STATUT_CLOISON_SDB,
  TOTAUX_CLOISON_SDB,
  lotsCloisonSdbPourTravaux,
} from "./cloisonSdbOfficiel.js";
import {
  CATEGORIE_DAMIEN_PV_100KWC,
  DAMIEN_PV_100KWC_DOSSIER_ID,
  DAMIEN_PV_100KWC_REFERENCE,
  EQUIPE_DAMIEN_PV_100KWC,
  FINANCEMENT_DAMIEN_PV_100KWC,
  PHASE_DAMIEN_PV_100KWC,
  PROJET_DAMIEN_PV_100KWC_DEFAUT,
  SOURCE_DAMIEN_PV_100KWC,
  STATUT_DAMIEN_PV_100KWC,
  TOTAUX_DAMIEN_PV_100KWC,
  lotsDamienPv100kwcPourTravaux,
} from "./damienPv100kwcOfficiel.js";
import {
  CATEGORIE_GESNOUIN,
  EQUIPE_GESNOUIN,
  FINANCEMENT_GESNOUIN,
  GESNOUIN_DOSSIER_ID,
  GESNOUIN_REFERENCE,
  PHASE_GESNOUIN,
  PROJET_GESNOUIN_DEFAUT,
  SOURCE_GESNOUIN,
  STATUT_GESNOUIN,
  TOTAUX_GESNOUIN,
  lotsGesnouinPourTravaux,
} from "./gesnouinBatterieOfficiel.js";
import {
  COUTY_ESCALIER_DOSSIER_ID,
  COUTY_ESCALIER_REFERENCE,
  PHASE_COUTY_ESCALIER,
  PROJET_COUTY_ESCALIER_DEFAUT,
  SOURCE_COUTY_ESCALIER,
  STATUT_COUTY_ESCALIER,
  TOTAUX_COUTY,
  FINANCEMENT_COUTY,
  CATEGORIE_COUTY_ESCALIER,
  EQUIPE_COUTY,
} from "./coutyEscalierOfficiel.js";
import {
  CATEGORIE_FARISS,
  EQUIPE_FARISS,
  FARISS_DOSSIER_ID,
  FARISS_REFERENCE,
  FINANCEMENT_FARISS,
  PHASE_FARISS,
  PROJET_FARISS_DEFAUT,
  SOURCE_FARISS,
  STATUT_FARISS,
  TOTAUX_FARISS,
} from "./farissLaRicamarieOfficiel.js";
import {
  CATEGORIE_MASSON,
  EQUIPE_MASSON,
  FINANCEMENT_MASSON,
  MASSON_DOSSIER_ID,
  MASSON_REFERENCE,
  PHASE_MASSON,
  PROJET_MASSON_DEFAUT,
  SOURCE_MASSON,
  TOTAUX_MASSON,
  lotsMassonPourTravaux,
} from "./massonToulonOfficiel.js";
import {
  CATEGORIE_OUSSARA,
  EQUIPE_OUSSARA,
  FINANCEMENT_OUSSARA,
  OUSSARA_DOSSIER_ID,
  OUSSARA_REFERENCE,
  PHASE_OUSSARA,
  PROJET_OUSSARA_DEFAUT,
  SOURCE_OUSSARA,
  STATUT_OUSSARA,
  TOTAUX_OUSSARA,
} from "./oussaraColombierOfficiel.js";
import {
  EQUIPE_OUSSARA_COMBLES,
  FINANCEMENT_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DOSSIER_ID,
  PROJET_OUSSARA_COMBLES_DEFAUT,
  STATUT_OUSSARA_COMBLES,
  TOTAUX_OUSSARA_COMBLES,
} from "./oussaraComblesOfficiel.js";
import {
  ETAPE_ANAH_VALIDATION_MAR,
    peutPlanifierVisiteTechnique,
  SOURCE_APPORTEUR_DIRECT,
  SOURCE_APPORTEUR_DAMIEN,
  SOURCES_APPORTEUR,
  STATUT_COMMISSION_EN_ATTENTE,
  etapeAnahDepuisStatut,
  infererSourceApporteur,
  libelleParcoursAnah,
  libelleSourceApporteur,
  normaliserEtapeAnah,
  normaliserSourceApporteur,
  peutPasserAuJalon,
  statutCommissionValide,
  trouverEtapeAnah,
} from "./operationnelCrm.js";

export { PEREIRA_NERVIEUX_DOSSIER_ID, PROJET_PEREIRA_NERVIEUX_DEFAUT, STATUT_DOSSIER_BRUNEL_V4 };
export { STATUT_DOSSIER_BRUNEL_V4 as STATUT_DOSSIER_BRUNEL_V3 };

export const STORAGE_PROJETS_MANUELS = "energia-crm-projets-manuels-v1";

export const STATUTS_PROJET_MANUEL = [
  "Documents reçus — vérification en cours",
  "Nouveau Lead — À Contacter",
  STATUT_MASSARDIER,
  "Lead qualifié",
  STATUT_LANOUX,
  STATUT_GILBERTAS,
  "Audit en cours",
  "Devis envoyé",
  STATUT_CLOISON_SDB,
  STATUT_DAMIEN_PV_100KWC,
  STATUT_GESNOUIN,
  STATUT_COUTY_ESCALIER,
  STATUT_FARISS,
  STATUT_OUSSARA,
  STATUT_OUSSARA_COMBLES,
  "Devis en attente de signature",
  STATUT_DOSSIER_BRUNEL_V4,
  "Signé",
  "Chantier",
  "Clôturé",
  "Archivé",
];

/** Progression express (1 clic) — hors libellés officiels longs. */
export const STATUTS_EXPRESS_ORDRE = [
  "Nouveau Lead — À Contacter",
  "Lead qualifié",
  "Audit en cours",
  "Devis envoyé",
  "Devis en attente de signature",
  "Signé",
  "Chantier",
  "Clôturé",
];

export const TYPES_PROJET_MANUEL = [
  "Rénovation Globale Anah",
  "Cuisine & Agencement Italien",
  "Rénovation Second Œuvre",
  "Sols / Peinture",
  "Isolation & Menuiseries",
  "PAC / Chauffage",
  "Photovoltaïque",
  "Électricité & Stockage Énergétique",
  "Maintien à domicile",
  ...TYPES_AUDIT_MARCHE,
  "Autre",
];

export const STATUT_INITIAL_DOCUMENTS = STATUTS_PROJET_MANUEL[0];

export const LIBELLE_CATEGORIE_AIDE_A_CONFIRMER = "catégorie d’aide à confirmer";

/** IDs des dossiers de test — lecture seule, jamais écrasés par un import manuel. */
export const IDS_DOSSIERS_TEST_PROTEGES = ["demo-pereira", "demo-marjollet", "demo-clyve-lagenete"];

/** Dossiers officiels seed — modifiables, non supprimables (archivage soft uniquement). */
export const IDS_DOSSIERS_OFFICIELS = [
  BRUNEL_DOSSIER_ID,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  GILBERTAS_DOSSIER_ID,
  MASSARDIER_LEAD_ID,
  CLOISON_SDB_DOSSIER_ID,
  DAMIEN_PV_100KWC_DOSSIER_ID,
  GESNOUIN_DOSSIER_ID,
  COUTY_ESCALIER_DOSSIER_ID,
  FARISS_DOSSIER_ID,
  MASSON_DOSSIER_ID,
  OUSSARA_DOSSIER_ID,
  OUSSARA_COMBLES_DOSSIER_ID,
];

export function estDossierOfficiel(id) {
  return IDS_DOSSIERS_OFFICIELS.includes(id);
}

export function peutEditerProjetLocal(projet) {
  if (!projet?.id) return false;
  if (IDS_DOSSIERS_TEST_PROTEGES.includes(projet.id)) return false;
  return true;
}

export function parserMontantEuro(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

export function prochainStatutExpress(statutActuel) {
  const actuel = texte(statutActuel);
  if (!actuel) return STATUTS_EXPRESS_ORDRE[0];
  const idxExact = STATUTS_EXPRESS_ORDRE.indexOf(actuel);
  if (idxExact >= 0) {
    return STATUTS_EXPRESS_ORDRE[Math.min(idxExact + 1, STATUTS_EXPRESS_ORDRE.length - 1)];
  }
  const lower = actuel.toLowerCase();
  if (lower.includes("à contacter") || lower.includes("a contacter") || lower.includes("nouveau lead")) {
    return "Lead qualifié";
  }
  if (lower.includes("qualif")) return "Audit en cours";
  if (lower.includes("audit")) return "Devis envoyé";
  if (lower.includes("devis")) return "Signé";
  if (lower.includes("signé") || lower.includes("signe")) return "Chantier";
  if (lower.includes("chantier")) return "Clôturé";
  return STATUTS_EXPRESS_ORDRE[0];
}

export const PROJET_BRUNEL_DEFAUT = {
  id: BRUNEL_DOSSIER_ID,
  nom: "Monsieur Emrick BRUNEL (agissant pour l'Indivision COUBLE)",
  ville: "BUSSIÈRES",
  codePostal: "42510",
  adresse: "48 Impasse des Lagunes, 42510 BUSSIÈRES",
  telephone: "06 50 26 31 83",
  email: "brunelemrick@gmail.com",
  rfr: 20216,
  statut: STATUT_CRM_BRUNEL_MARCHE,
  profilAnah: PROFIL_ANAH_BRUNEL.id,
  tauxAnah: PROFIL_ANAH_BRUNEL.taux,
  scenarioMar: "Scénario n°3 (saut de 4 classes énergétiques)",
  typeBien: "Maison individuelle (passoire thermique G → rénovation globale classe C)",
  source: "manuel",
  createdAt: "2026-09-19",
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DAMIEN, { select: true }),
  etapeAnah: ETAPE_ANAH_VALIDATION_MAR,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  validationMar: false,
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: DETAIL_JALON_BRUNEL_DEPOT_MAR,
  margeDirectionHt: MARGE_CG_BRUNEL_HT,
  margeDirectionTtc: MARGE_NETTE_DIRECTION_BRUNEL.ttc,
  alertes: [
    "Date de naissance à confirmer entre les documents transmis. Ne pas corriger automatiquement.",
    "Indivision COUBLE — Article 815 du Code Civil : accord unanime et signature obligatoire de TOUS les indivisaires sous peine de nullité du contrat et des aides",
    NOTE_PORTE_SERVICE_HORS_MARCHE,
  ],
};

const CP_RE = /^\d{5}$/;

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function parserRfr(value) {
  if (value == null || value === "") return NaN;
  const n = Number(String(value).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : NaN;
}

export function formatRfr(rfr) {
  if (rfr == null || !Number.isFinite(Number(rfr))) return "";
  return `${Number(rfr).toLocaleString("fr-FR")} €`;
}

export function libelleRfrRecu(rfr) {
  const montant = formatRfr(rfr);
  if (!montant) return "";
  return `RFR reçu : ${montant} — ${LIBELLE_CATEGORIE_AIDE_A_CONFIRMER}`;
}

export function etapeDepuisStatutManuel(statut) {
  const s = texte(statut).toLowerCase();
  if (s.includes("chantier")) return "chantier";
  if (s.includes("attente") && s.includes("signature")) return "devis";
  if (s.includes("contrat") && s.includes("validé")) return "devis";
  if (s.includes("devis")) return "devis";
  if (s.includes("signé") || s.includes("signe ")) return "signe";
  if (s.includes("audit")) return "audit";
  if (s.includes("à contacter") || s.includes("a contacter")) return "nouveau";
  if (s.includes("étude") || s.includes("etude") || s.includes("faisabilité") || s.includes("faisabilite")) {
    return "nouveau";
  }
  if (s.includes("qualif")) return "qualifie";
  if (s.includes("clôtur") || s.includes("clotur")) return "autre";
  return "nouveau";
}

export function validerProjetManuel(brut) {
  const erreurs = {};
  const nom = texte(brut.nom);
  const prenom = texte(brut.prenom);
  const ville = texte(brut.ville) || "À préciser";
  const codePostal = texte(brut.codePostal ?? brut.code_postal) || "00000";
  const statut = texte(brut.statut) || STATUT_INITIAL_DOCUMENTS;
  const rfrRaw = brut.rfr;
  const rfr =
    rfrRaw == null || rfrRaw === ""
      ? null
      : parserRfr(rfrRaw);
  const apporteurId = infererSourceApporteur({
    apporteurId: brut.apporteurId,
    apporteurNom: brut.apporteurNom,
  });
  const typeProjet = texte(brut.typeProjet);
  const description = texte(brut.description);
  const montantEstimeTtc = parserMontantEuro(brut.montantEstimeTtc);
  let montantHt = parserMontantEuro(brut.montantHt);
  if (montantHt == null && montantEstimeTtc != null) {
    const taux = Number(brut.tauxTva) > 0 ? Number(brut.tauxTva) : 0.1;
    montantHt = Math.round((montantEstimeTtc / (1 + taux)) * 100) / 100;
  }

  if (nom.length < 2) erreurs.nom = "Nom du client requis.";
  if (ville.length < 2) erreurs.ville = "Ville requise.";
  if (!CP_RE.test(codePostal)) erreurs.codePostal = "Code postal à 5 chiffres.";
  if (rfrRaw != null && rfrRaw !== "" && !Number.isFinite(rfr)) {
    erreurs.rfr = "Revenu fiscal de référence invalide.";
  }
  if (statut.length < 2) erreurs.statut = "Statut invalide.";
  if (!SOURCES_APPORTEUR.some((item) => item.id === apporteurId)) erreurs.apporteurId = "Apporteur invalide.";
  if (brut.montantEstimeTtc != null && brut.montantEstimeTtc !== "" && montantEstimeTtc == null) {
    erreurs.montantEstimeTtc = "Montant TTC invalide.";
  }

  return {
    ok: Object.keys(erreurs).length === 0,
    erreurs,
    valeurs: {
      nom,
      prenom,
      ville,
      codePostal,
      rfr,
      statut,
      apporteurId,
      typeProjet,
      description,
      montantEstimeTtc,
      montantHt,
    },
  };
}

export function normaliserNom(nom) {
  return texte(nom)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function identifiantSniper(item) {
  const marque = texte(item?.description).match(/SNIPER:([^\s—]+)/);
  return marque ? marque[1] : "";
}

function ficheTerrainDepuis(brut) {
  const fiche = brut?.ficheTerrain;
  if (!fiche || typeof fiche !== "object") return null;
  return fiche;
}

export function estDoublonProjet(existant, candidat) {
  if (!existant || !candidat) return false;
  if (existant.id && candidat.id && existant.id === candidat.id) return true;
  const sniperExistant = identifiantSniper(existant);
  const sniperCandidat = identifiantSniper(candidat);
  if (sniperExistant && sniperCandidat && sniperExistant !== sniperCandidat) return false;
  return (
    normaliserNom(existant.nom) === normaliserNom(candidat.nom) &&
    texte(existant.codePostal) === texte(candidat.codePostal) &&
    normaliserNom(existant.ville) === normaliserNom(candidat.ville)
  );
}

function reprendreOperationnel(defaut, stocke) {
  if (!stocke || typeof stocke !== "object") return { ...defaut };
  const migrationApporteurBrunel =
    defaut.id === BRUNEL_DOSSIER_ID && stocke.apporteurMigrationVersion !== 1;
  const ancienDefautDirect =
    migrationApporteurBrunel &&
    (!stocke.apporteurId || normaliserSourceApporteur(stocke.apporteurId) === SOURCE_APPORTEUR_DIRECT);
  const apporteurId = ancienDefautDirect
    ? defaut.apporteurId
    : stocke.apporteurId
      ? normaliserSourceApporteur(stocke.apporteurId)
      : defaut.apporteurId;
  const etapeStockee = stocke.etapeAnah ? normaliserEtapeAnah(stocke.etapeAnah) : defaut.etapeAnah;
  const ordreStocke = trouverEtapeAnah(etapeStockee).ordre;
  const ordreDefaut = trouverEtapeAnah(defaut.etapeAnah).ordre;
  const validationMar = stocke.validationMar === true;
  let etapeAnah = defaut.etapeAnah;
  if (
    ordreStocke > ordreDefaut &&
    peutPasserAuJalon({ ...defaut, validationMar, etapeAnah: defaut.etapeAnah }, etapeStockee)
  ) {
    etapeAnah = etapeStockee;
  }
  const montantEstimeTtc = parserMontantEuro(stocke.montantEstimeTtc);
  const montantHt = parserMontantEuro(stocke.montantHt);
  const verrouilleGilbertas = defaut.id === GILBERTAS_DOSSIER_ID;
  const verrouilleOussara = defaut.id === OUSSARA_DOSSIER_ID;
  const verrouilleOussaraCombles = defaut.id === OUSSARA_COMBLES_DOSSIER_ID;
  const verrouilleClientOussara = verrouilleOussara || verrouilleOussaraCombles;
  return {
    ...defaut,
    apporteurId,
    apporteurNom: libelleSourceApporteur(apporteurId, { select: true }),
    ...(defaut.id === BRUNEL_DOSSIER_ID ? { apporteurMigrationVersion: 1 } : {}),
    acompte30Encaisse: stocke.acompte30Encaisse === true,
    dateVisiteTechnique: texte(stocke.dateVisiteTechnique),
    etapeAnah,
    validationMar,
    consultationDuo: stocke.consultationDuo === true,
    statutCommission: statutCommissionValide(stocke.statutCommission)
      ? stocke.statutCommission
      : defaut.statutCommission,
    detailJalon: verrouilleGilbertas
      ? defaut.detailJalon
      : etapeAnah === defaut.etapeAnah
        ? defaut.detailJalon
        : texte(stocke.detailJalon) || "",
    // Overrides manuels persistés (édition UI). Gilbertas : marché officiel prioritaire.
    statut: verrouilleGilbertas || verrouilleClientOussara ? defaut.statut : texte(stocke.statut) || defaut.statut,
    prenom: verrouilleClientOussara ? defaut.prenom || "" : texte(stocke.prenom) || defaut.prenom || "",
    telephone: verrouilleGilbertas ? defaut.telephone || "" : texte(stocke.telephone) || defaut.telephone || "",
    email: texte(stocke.email) || defaut.email || "",
    adresse: verrouilleGilbertas || verrouilleClientOussara
      ? defaut.adresse || ""
      : Object.prototype.hasOwnProperty.call(stocke, "adresse")
        ? texte(stocke.adresse)
        : defaut.adresse || "",
    ville: verrouilleClientOussara ? defaut.ville : texte(stocke.ville) || defaut.ville,
    codePostal: verrouilleClientOussara ? defaut.codePostal : texte(stocke.codePostal) || defaut.codePostal,
    typeProjet: verrouilleGilbertas || verrouilleClientOussara ? defaut.typeProjet || "" : texte(stocke.typeProjet) || defaut.typeProjet || "",
    description: verrouilleClientOussara ? defaut.description || "" : texte(stocke.description) || defaut.description || "",
    montantEstimeTtc: verrouilleGilbertas
      ? TOTAUX_GILBERTAS.totalTtc
      : defaut.id === OUSSARA_DOSSIER_ID
        ? TOTAUX_OUSSARA.totalTtc
        : verrouilleOussaraCombles
          ? TOTAUX_OUSSARA_COMBLES.totalTtc
          : montantEstimeTtc ?? defaut.montantEstimeTtc ?? null,
    montantHt: verrouilleGilbertas
      ? TOTAUX_GILBERTAS.totalHt
      : defaut.id === OUSSARA_DOSSIER_ID
        ? TOTAUX_OUSSARA.totalHt
        : verrouilleOussaraCombles
          ? TOTAUX_OUSSARA_COMBLES.totalHt
          : montantHt ?? defaut.montantHt ?? null,
    equipe: verrouilleGilbertas || defaut.id === OUSSARA_DOSSIER_ID || verrouilleOussaraCombles
      ? defaut.equipe || null
      : stocke.equipe && typeof stocke.equipe === "object"
        ? { ...(defaut.equipe || {}), ...stocke.equipe }
        : defaut.equipe || null,
    archive: stocke.archive === true,
  };
}

export function fusionnerAvecDefautBrunel(liste) {
  const items = Array.isArray(liste)
    ? liste.filter((item) => item && !IDS_DOSSIERS_TEST_PROTEGES.includes(item.id))
    : [];
  const stockeBrunel = items.find((item) => item.id === BRUNEL_DOSSIER_ID);
  const stockePereira = items.find((item) => item.id === PEREIRA_NERVIEUX_DOSSIER_ID);
  const stockeGilbertas = items.find((item) => item.id === GILBERTAS_DOSSIER_ID);
  const stockeMassardier = items.find((item) => item.id === MASSARDIER_LEAD_ID);
  const stockeLanoux = items.find((item) => item.id === LANOUX_LEAD_ID);
  const stockeCloisonSdb = items.find((item) => item.id === CLOISON_SDB_DOSSIER_ID);
  const stockeDamienPv = items.find((item) => item.id === DAMIEN_PV_100KWC_DOSSIER_ID);
  const stockeGesnouin = items.find((item) => item.id === GESNOUIN_DOSSIER_ID);
  const stockeCouty = items.find((item) => item.id === COUTY_ESCALIER_DOSSIER_ID);
  const stockeFariss = items.find((item) => item.id === FARISS_DOSSIER_ID);
  const stockeMasson = items.find((item) => item.id === MASSON_DOSSIER_ID);
  const stockeOussara = items.find((item) => item.id === OUSSARA_DOSSIER_ID);
  const stockeOussaraCombles = items.find((item) => item.id === OUSSARA_COMBLES_DOSSIER_ID);
  const sansOfficiels = items.filter(
    (item) =>
      item.id !== BRUNEL_DOSSIER_ID &&
      item.id !== PEREIRA_NERVIEUX_DOSSIER_ID &&
      item.id !== GILBERTAS_DOSSIER_ID &&
      item.id !== MASSARDIER_LEAD_ID &&
      item.id !== LANOUX_LEAD_ID &&
      item.id !== CLOISON_SDB_DOSSIER_ID &&
      item.id !== DAMIEN_PV_100KWC_DOSSIER_ID &&
      item.id !== GESNOUIN_DOSSIER_ID &&
      item.id !== COUTY_ESCALIER_DOSSIER_ID &&
      item.id !== FARISS_DOSSIER_ID &&
      item.id !== MASSON_DOSSIER_ID &&
      item.id !== OUSSARA_DOSSIER_ID &&
      item.id !== OUSSARA_COMBLES_DOSSIER_ID,
  );
  return [
    reprendreOperationnel(PROJET_BRUNEL_DEFAUT, stockeBrunel),
    reprendreOperationnel(PROJET_PEREIRA_NERVIEUX_DEFAUT, stockePereira),
    reprendreOperationnel(PROJET_GILBERTAS_DEFAUT, stockeGilbertas),
    reprendreOperationnel(PROJET_MASSARDIER_DEFAUT, stockeMassardier),
    reprendreOperationnel(PROJET_LANOUX_DEFAUT, stockeLanoux),
    reprendreOperationnel(PROJET_CLOISON_SDB_DEFAUT, stockeCloisonSdb),
    reprendreOperationnel(PROJET_DAMIEN_PV_100KWC_DEFAUT, stockeDamienPv),
    reprendreOperationnel(PROJET_GESNOUIN_DEFAUT, stockeGesnouin),
    reprendreOperationnel(PROJET_COUTY_ESCALIER_DEFAUT, stockeCouty),
    reprendreOperationnel(PROJET_FARISS_DEFAUT, stockeFariss),
    reprendreOperationnel(PROJET_MASSON_DEFAUT, stockeMasson),
    reprendreOperationnel(PROJET_OUSSARA_DEFAUT, stockeOussara),
    reprendreOperationnel(PROJET_OUSSARA_COMBLES_DEFAUT, stockeOussaraCombles),
    ...sansOfficiels,
  ];
}

function lireStockageBrut() {
  try {
    const raw = localStorage.getItem(STORAGE_PROJETS_MANUELS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ecrireStockage(liste) {
  try {
    localStorage.setItem(STORAGE_PROJETS_MANUELS, JSON.stringify(liste));
  } catch {
    /* quota / mode privé */
  }
}

export function lireProjetsManuels() {
  const fusionnes = fusionnerAvecDefautBrunel(lireStockageBrut());
  ecrireStockage(fusionnes);
  return fusionnes;
}

function champsEquipeDepuisBrut(brut, existant = null) {
  const base = existant?.equipe && typeof existant.equipe === "object" ? { ...existant.equipe } : {};
  if (brut.equipe && typeof brut.equipe === "object") {
    return {
      ...base,
      direction: texte(brut.equipe.direction) || texte(brut.equipe.directionContractantGeneral) || base.direction || "",
      commercial: texte(brut.equipe.commercial) || texte(brut.equipe.commercialApporteur) || base.commercial || "",
      design: texte(brut.equipe.design) || texte(brut.equipe.designAgencement) || base.design || "",
      coordination:
        texte(brut.equipe.coordination) ||
        texte(brut.equipe.coordinateur) ||
        base.coordination ||
        "Mohamed",
    };
  }
  return {
    ...base,
    direction: texte(brut.equipeDirection) || base.direction || "Sylvain LEMBELEMBE",
    commercial: texte(brut.equipeCommercial) || base.commercial || "Damien",
    design: texte(brut.equipeDesign) || base.design || "",
    coordination: texte(brut.equipeCoordination) || base.coordination || "Mohamed",
  };
}

export function enregistrerProjetManuel(brut) {
  const { ok, erreurs, valeurs } = validerProjetManuel(brut);
  if (!ok) return { ok: false, erreurs, projet: null };

  const actuels = lireProjetsManuels();
  if (actuels.some((item) => estDoublonProjet(item, valeurs))) {
    return {
      ok: false,
      erreurs: { nom: "Un dossier existe déjà pour ce client et cette localisation." },
      projet: null,
    };
  }

  const projet = {
    id: `projet-manuel-${Date.now()}`,
    nom: valeurs.nom,
    prenom: valeurs.prenom,
    ville: valeurs.ville,
    codePostal: valeurs.codePostal,
    rfr: valeurs.rfr,
    statut: valeurs.statut,
    typeProjet: valeurs.typeProjet,
    description: valeurs.description,
    montantEstimeTtc: valeurs.montantEstimeTtc,
    montantHt: valeurs.montantHt,
    equipe: champsEquipeDepuisBrut(brut),
    apporteurId: valeurs.apporteurId || SOURCE_APPORTEUR_DIRECT,
    apporteurNom: libelleSourceApporteur(valeurs.apporteurId || SOURCE_APPORTEUR_DIRECT, { select: true }),
    etapeAnah: brut.etapeAnah ? normaliserEtapeAnah(brut.etapeAnah) : etapeAnahDepuisStatut(valeurs.statut),
    validationMar: brut.validationMar === true || (brut.jalonsValides || []).includes(ETAPE_ANAH_VALIDATION_MAR),
    acompte30Encaisse: brut.acompte30Encaisse === true,
    dateVisiteTechnique: texte(brut.dateVisiteTechnique),
    consultationDuo: brut.consultationDuo === true,
    statutCommission: STATUT_COMMISSION_EN_ATTENTE,
    source: "manuel",
    createdAt: new Date().toISOString().slice(0, 10),
    adresse: texte(brut.adresse),
    telephone: texte(brut.telephone),
    email: texte(brut.email),
    profilAnah: texte(brut.profilAnah),
    statutOccupation: texte(brut.statutOccupation),
    ficheTerrain: ficheTerrainDepuis(brut),
    jalonsValides: Array.isArray(brut.jalonsValides) ? brut.jalonsValides : [],
    travaux: Array.isArray(brut.travaux) ? brut.travaux : [],
    bureauEtudesId: texte(brut.bureauEtudesId),
    bureauEtudesNom: libelleBureauEtudes(brut.bureauEtudesId),
    archive: false,
  };

  const suivante = [projet, ...actuels];
  ecrireStockage(suivante);
  return { ok: true, erreurs: {}, projet, liste: suivante };
}

export function modifierProjetManuel(id, brut) {
  const { ok, erreurs, valeurs } = validerProjetManuel(brut);
  if (!ok) return { ok: false, erreurs, projet: null };
  const actuels = lireProjetsManuels();
  const existant = actuels.find((item) => item.id === id);
  if (!existant || !peutEditerProjetLocal(existant)) {
    return { ok: false, erreurs: { nom: "Ce dossier ne peut pas être modifié depuis cette fiche." }, projet: null };
  }
  if (actuels.some((item) => item.id !== id && estDoublonProjet(item, valeurs))) {
    return { ok: false, erreurs: { nom: "Un dossier existe déjà pour ce client et cette localisation." }, projet: null };
  }
  const projet = {
    ...existant,
    ...valeurs,
    adresse: texte(brut.adresse),
    telephone: texte(brut.telephone),
    email: texte(brut.email),
    profilAnah: texte(brut.profilAnah),
    statutOccupation: texte(brut.statutOccupation),
    ficheTerrain: ficheTerrainDepuis(brut) || existant.ficheTerrain || null,
    typeProjet: valeurs.typeProjet || existant.typeProjet || "",
    description: valeurs.description || existant.description || "",
    montantEstimeTtc: valeurs.montantEstimeTtc ?? existant.montantEstimeTtc ?? null,
    montantHt: valeurs.montantHt ?? existant.montantHt ?? null,
    equipe: champsEquipeDepuisBrut(brut, existant),
    apporteurNom: libelleSourceApporteur(valeurs.apporteurId, { select: true }),
    etapeAnah: brut.etapeAnah ? normaliserEtapeAnah(brut.etapeAnah) : existant.etapeAnah,
    validationMar: brut.validationMar === true || (brut.jalonsValides || []).includes(ETAPE_ANAH_VALIDATION_MAR),
    acompte30Encaisse: brut.acompte30Encaisse === true,
    jalonsValides: Array.isArray(brut.jalonsValides) ? brut.jalonsValides : existant.jalonsValides || [],
    travaux: Array.isArray(brut.travaux) ? brut.travaux : existant.travaux || [],
    bureauEtudesId: texte(brut.bureauEtudesId),
    bureauEtudesNom: libelleBureauEtudes(brut.bureauEtudesId),
    archive: brut.archive === true,
  };
  const suivante = actuels.map((item) => (item.id === id ? projet : item));
  ecrireStockage(suivante);
  return { ok: true, erreurs: {}, projet, liste: suivante };
}

export function avancerStatutExpressProjet(id) {
  const actuels = lireProjetsManuels();
  const existant = actuels.find((item) => item.id === id);
  if (!existant || !peutEditerProjetLocal(existant)) {
    return { ok: false, erreur: "Dossier non modifiable.", liste: actuels };
  }
  const prochain = prochainStatutExpress(existant.statut);
  const projet = {
    ...existant,
    statut: prochain,
    etapeAnah:
      prochain.toLowerCase().includes("signé") || prochain.toLowerCase().includes("chantier")
        ? normaliserEtapeAnah("marche_signe_acompte")
        : prochain.toLowerCase().includes("devis")
          ? normaliserEtapeAnah("validation_mar_financement")
          : prochain.toLowerCase().includes("clôtur") || prochain.toLowerCase().includes("clotur")
            ? normaliserEtapeAnah("chantier_receptionne")
            : existant.etapeAnah || etapeAnahDepuisStatut(prochain),
  };
  const suivante = actuels.map((item) => (item.id === id ? projet : item));
  ecrireStockage(suivante);
  return { ok: true, erreur: "", projet, liste: suivante };
}

export function archiverProjetManuel(id) {
  const actuels = lireProjetsManuels();
  const existant = actuels.find((item) => item.id === id);
  if (!existant || !peutEditerProjetLocal(existant)) {
    return { ok: false, erreur: "Dossier non archivable.", liste: actuels };
  }
  const projet = { ...existant, archive: true, statut: existant.statut === "Archivé" ? existant.statut : "Archivé" };
  const suivante = actuels.map((item) => (item.id === id ? projet : item));
  ecrireStockage(suivante);
  return { ok: true, erreur: "", projet, liste: suivante };
}

export function supprimerProjetManuel(id) {
  const actuels = lireProjetsManuels();
  const existant = actuels.find((item) => item.id === id);
  if (!existant || !peutEditerProjetLocal(existant)) {
    return { ok: false, erreur: "Dossier non supprimable.", liste: actuels };
  }
  if (estDossierOfficiel(id)) {
    return archiverProjetManuel(id);
  }
  const suivante = actuels.filter((item) => item.id !== id);
  ecrireStockage(suivante);
  return { ok: true, erreur: "", projet: existant, liste: suivante };
}

export function mettreAJourOperationnelProjet(id, patch) {
  const fusionnes = fusionnerAvecDefautBrunel(lireStockageBrut());
  const index = fusionnes.findIndex((projet) => projet.id === id);
  if (index < 0) {
    return { ok: false, erreur: "Dossier introuvable dans le jeu local.", liste: fusionnes };
  }

  const projet = fusionnes[index];
  const candidat = { ...projet };
  if (patch?.apporteurId) {
    candidat.apporteurId = normaliserSourceApporteur(patch.apporteurId);
    candidat.apporteurNom = libelleSourceApporteur(candidat.apporteurId, { select: true });
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "consultationDuo")) {
    candidat.consultationDuo = patch.consultationDuo === true;
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "validationMar")) {
    candidat.validationMar = patch.validationMar === true;
  }
  if (patch?.statutCommission && statutCommissionValide(patch.statutCommission)) {
    candidat.statutCommission = patch.statutCommission;
  }
  if (patch?.etapeAnah) {
    const cible = normaliserEtapeAnah(patch.etapeAnah);
    if (!peutPasserAuJalon(candidat, cible)) {
      return {
        ok: false,
        erreur: "Jalon 3 verrouillé : validez d’abord le jalon 2 (MAR et financement bancaire).",
        liste: fusionnes,
      };
    }
    candidat.etapeAnah = cible;
    if (cible !== projet.etapeAnah) candidat.detailJalon = "";
    if (trouverEtapeAnah(cible).ordre < 3) {
      candidat.acompte30Encaisse = false;
      candidat.dateVisiteTechnique = "";
    }
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "acompte30Encaisse")) {
    if (patch.acompte30Encaisse === true && trouverEtapeAnah(candidat.etapeAnah).ordre < 3) {
      return {
        ok: false,
        erreur: "L’acompte de 30 % ne peut être confirmé avant le jalon 3.",
        liste: fusionnes,
      };
    }
    candidat.acompte30Encaisse = patch.acompte30Encaisse === true;
    if (!candidat.acompte30Encaisse) candidat.dateVisiteTechnique = "";
  }
  if (patch && Object.prototype.hasOwnProperty.call(patch, "dateVisiteTechnique")) {
    const dateVisiteTechnique = texte(patch.dateVisiteTechnique);
    if (dateVisiteTechnique && !peutPlanifierVisiteTechnique(candidat)) {
      return {
        ok: false,
        erreur: "Visite Technique verrouillée : signature du marché et acompte de 30 % encaissé requis.",
        liste: fusionnes,
      };
    }
    candidat.dateVisiteTechnique = dateVisiteTechnique;
  }

  const suivante = fusionnes.map((item, i) => (i === index ? candidat : item));
  ecrireStockage(suivante);
  return { ok: true, erreur: "", liste: suivante, projet: candidat };
}

export function projetManuelVersAudit(projet) {
  const villeAffichee = [projet.codePostal, projet.ville].filter(Boolean).join(" ");
  const workingBase = projet.id === BRUNEL_DOSSIER_ID ? lireBaseTravailBrunel() : null;
  const estPereiraNervieux = projet.id === PEREIRA_NERVIEUX_DOSSIER_ID;
  const estGilbertas = projet.id === GILBERTAS_DOSSIER_ID;
  const estMassardier = projet.id === MASSARDIER_LEAD_ID;
  const estCloisonSdb = projet.id === CLOISON_SDB_DOSSIER_ID;
  const estDamienPv = projet.id === DAMIEN_PV_100KWC_DOSSIER_ID;
  const estGesnouin = projet.id === GESNOUIN_DOSSIER_ID;
  const estCouty = projet.id === COUTY_ESCALIER_DOSSIER_ID;
  const estFariss = projet.id === FARISS_DOSSIER_ID;
  const estMasson = projet.id === MASSON_DOSSIER_ID;
  const estOussara = projet.id === OUSSARA_DOSSIER_ID;
  const estOussaraCombles = projet.id === OUSSARA_COMBLES_DOSSIER_ID;
  const horsAides = projet.horsAidesPubliques === true;
  const totauxPereira = estPereiraNervieux ? totauxContractuelsPereiraNervieux() : null;
  const estBrunel = Boolean(workingBase);
  const apporteurId = infererSourceApporteur({
    apporteurId: projet.apporteurId,
    apporteurNom: projet.apporteurNom,
  });
  const etapeAnah = horsAides ? null : (projet.etapeAnah || etapeAnahDepuisStatut(projet.statut));
  const devisDirect = projet.devisIndicatif && typeof projet.devisIndicatif === "object" ? projet.devisIndicatif : null;
  const margeDirectionHt = estBrunel
    ? MARGE_NETTE_DIRECTION_BRUNEL.ht
    : estPereiraNervieux
      ? TOTAUX_CG_20_PEREIRA.totalHt
      : Number(devisDirect?.margeCgHt) || null;
  const margeDirectionTtc = estBrunel
    ? MARGE_NETTE_DIRECTION_BRUNEL.ttc
    : estPereiraNervieux
      ? TOTAUX_CG_20_PEREIRA.totalTtc
      : Number(devisDirect?.margeCgTtc) || null;
  const travauxGilbertas = estGilbertas
    ? lotsGilbertasPourTravaux().map((lot) => ({
        id: lot.id,
        label: lot.nom,
        nom: lot.nom,
        quantite: lot.quantite,
        unite: lot.unite,
        puHt: lot.prixVentePuHt,
        ht: lot.totalHt,
        tauxTva: lot.tauxTva,
        coutAchatHt: lot.coutAchatHt,
        margeBruteHt: lot.margeBruteHt,
        postes: lot.postes,
        ordre: lot.ordre,
        totalTtc: lot.totalTtc,
      }))
    : null;
  const travauxCloisonSdb = estCloisonSdb
    ? lotsCloisonSdbPourTravaux().map((lot) => ({
        id: lot.id,
        label: lot.nom,
        nom: lot.nom,
        quantite: lot.quantite,
        unite: lot.unite,
        puHt: lot.prixVentePuHt,
        ht: lot.totalHt,
        tauxTva: lot.tauxTva,
        coutAchatHt: lot.coutAchatHt,
        margeBruteHt: lot.margeBruteHt,
        postes: lot.postes,
        ordre: lot.ordre,
        totalTtc: lot.totalTtc,
        categorieId: lot.categorieId,
        coordinateur: lot.coordinateur,
      }))
    : null;
  const travauxDamienPv = estDamienPv
    ? lotsDamienPv100kwcPourTravaux().map((lot) => ({
        id: lot.id,
        label: lot.nom,
        nom: lot.nom,
        quantite: lot.quantite,
        unite: lot.unite,
        puHt: lot.prixVentePuHt,
        ht: lot.totalHt,
        tauxTva: lot.tauxTva,
        coutAchatHt: lot.coutAchatHt,
        margeBruteHt: lot.margeBruteHt,
        postes: lot.postes,
        ordre: lot.ordre,
        totalTtc: lot.totalTtc,
        categorieId: lot.categorieId,
      }))
    : null;
  const travauxGesnouin = estGesnouin
    ? lotsGesnouinPourTravaux().map((lot) => ({
        id: lot.id,
        label: lot.nom,
        nom: lot.nom,
        quantite: lot.quantite,
        unite: lot.unite,
        puHt: lot.prixVentePuHt,
        ht: lot.totalHt,
        tauxTva: lot.tauxTva,
        coutAchatHt: lot.coutAchatHt,
        margeBruteHt: lot.margeBruteHt,
        postes: lot.postes,
        ordre: lot.ordre,
        totalTtc: lot.totalTtc,
        categorieId: lot.categorieId,
      }))
    : null;
  const travauxMasson = estMasson
    ? lotsMassonPourTravaux().map((lot) => ({
        id: lot.id,
        label: lot.nom,
        nom: lot.nom,
        quantite: lot.quantite,
        unite: lot.unite,
        puHt: lot.prixVentePuHt,
        ht: lot.totalHt,
        tauxTva: lot.tauxTva,
        coutAchatHt: null,
        postes: lot.postes,
        ordre: lot.ordre,
        totalTtc: lot.totalTtc,
        categorieId: lot.categorieId,
        artisan: lot.artisan,
      }))
    : null;
  const travauxManuels =
    travauxGilbertas ||
    travauxCloisonSdb ||
    travauxDamienPv ||
    travauxGesnouin ||
    travauxMasson ||
    (Array.isArray(projet.travaux) ? projet.travaux : []).map((lot) => {
      const quantite = Number(lot.quantite) || 0;
      const prixVentePuHt = Number(lot.prixVentePuHt) || 0;
      const coutAchatPuHt = Number(lot.coutAchatPuHt) || 0;
      const tauxTva = Number(lot.tauxTva) || 0.055;
      const ht = Math.round(quantite * prixVentePuHt * 100) / 100;
      return {
        id: lot.id,
        label: lot.nom || "Poste de travaux",
        nom: lot.nom || "Poste de travaux",
        quantite,
        unite: lot.unite || "u",
        puHt: prixVentePuHt,
        ht,
        tauxTva,
        coutAchatHt: Math.round(quantite * coutAchatPuHt * 100) / 100,
        margeBruteHt: Math.round((ht - quantite * coutAchatPuHt) * 100) / 100,
      };
    });
  const ventesManuellesHt = Math.round(travauxManuels.reduce((sum, lot) => sum + lot.ht, 0) * 100) / 100;
  const tvaManuelle = Math.round(travauxManuels.reduce((sum, lot) => sum + lot.ht * lot.tauxTva, 0) * 100) / 100;
  const achatsManuelsHt = Math.round(travauxManuels.reduce((sum, lot) => sum + lot.coutAchatHt, 0) * 100) / 100;

  return {
    id: projet.id,
    auditId: workingBase
      ? "CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL"
      : estPereiraNervieux
        ? PEREIRA_NERVIEUX_NUMERO
        : estGilbertas
          ? GILBERTAS_REFERENCE
          : estMassardier
            ? MASSARDIER_REFERENCE
            : estCloisonSdb
              ? CLOISON_SDB_REFERENCE
              : estDamienPv
                ? DAMIEN_PV_100KWC_REFERENCE
                : estGesnouin
                  ? GESNOUIN_REFERENCE
                  : estCouty
                    ? COUTY_ESCALIER_REFERENCE
                    : estFariss
                      ? FARISS_REFERENCE
                      : estMasson
                        ? MASSON_REFERENCE
                        : estOussara
                          ? OUSSARA_REFERENCE
                          : projet.numeroAuditMar || "",
    nom: projet.nom,
    nomRenseigne: true,
    prenoms: workingBase?.client?.prenoms ?? (estPereiraNervieux ? "David Emmanuel" : projet.prenom || ""),
    profession: workingBase?.client?.profession ?? "",
    partsIndiquees: workingBase?.client?.partsIndiquees ?? null,
    foyerReelVerifie: workingBase?.client?.foyerReelVerifie ?? false,
    ville: estGilbertas
      ? "Clermont-Ferrand (63)"
      : estDamienPv
        ? "Ardèche (07)"
        : estGesnouin
          ? "Giberville (14)"
          : estMassardier || estCloisonSdb
            ? "À préciser"
            : villeAffichee,
    adresse: workingBase?.client?.adresse ?? projet.adresse ?? "",
    surface: projet.surfaceHabitable ?? null,
    anneeConstruction: projet.anneeConstruction ?? "",
    codePostal: estMassardier || estCloisonSdb ? "" : projet.codePostal ?? "",
    statut: projet.statut,
    phase:
      projet.phase ||
      (estGilbertas
        ? PHASE_GILBERTAS
        : estCloisonSdb
          ? PHASE_CLOISON_SDB
          : estDamienPv
            ? PHASE_DAMIEN_PV_100KWC
            : estGesnouin
              ? PHASE_GESNOUIN
              : estCouty
                ? PHASE_COUTY_ESCALIER
                : estFariss
                  ? PHASE_FARISS
                  : estMasson
                    ? PHASE_MASSON
                    : estOussara
                      ? PHASE_OUSSARA
                      : ""),
    priorite: projet.priorite || (estMassardier ? PRIORITE_MASSARDIER : ""),
    etape: etapeDepuisStatutManuel(projet.statut),
    etapeAnah,
    parcoursAnah: horsAides ? "Hors MaPrimeRénov’ et hors CEE" : libelleParcoursAnah(etapeAnah),
    horsAidesPubliques: horsAides,
    paye: false,
    date: projet.createdAt ?? "",
    href: "",
    source:
      projet.source === "client-direct" ||
      projet.source === "releve-terrain-catarina" ||
      projet.source === "lead-prospect"
        ? projet.source
        : "manuel",
    sourceLead: estMassardier
      ? SOURCE_MASSARDIER
      : estCloisonSdb
        ? SOURCE_CLOISON_SDB
        : estDamienPv
          ? SOURCE_DAMIEN_PV_100KWC
          : estGesnouin
            ? SOURCE_GESNOUIN
            : estCouty
              ? SOURCE_COUTY_ESCALIER
              : estFariss
                ? SOURCE_FARISS
                : estMasson
                  ? SOURCE_MASSON
                  : estOussara
                    ? SOURCE_OUSSARA
                    : projet.sourceLead || "",
    categorie: estDamienPv
      ? CATEGORIE_DAMIEN_PV_100KWC
      : estGesnouin
        ? CATEGORIE_GESNOUIN
        : estCouty
          ? CATEGORIE_COUTY_ESCALIER
          : estFariss
            ? CATEGORIE_FARISS
            : estMasson
              ? CATEGORIE_MASSON
              : estOussara
                ? CATEGORIE_OUSSARA
                : projet.categorie || "",
    detailsTechniques: estDamienPv
      ? PROJET_DAMIEN_PV_100KWC_DEFAUT.detailsTechniques
        : estGesnouin
          ? PROJET_GESNOUIN_DEFAUT.detailsTechniques
          : estFariss
            ? PROJET_FARISS_DEFAUT.detailsTechniques || null
            : estMasson
              ? PROJET_MASSON_DEFAUT.detailsTechniques || null
              : estOussara
                ? PROJET_OUSSARA_DEFAUT.detailsTechniques || null
                : projet.detailsTechniques || null,
    typeProjet: projet.typeProjet
      ? projet.typeProjet
      : workingBase
        ? "Maison individuelle — passoire G → classe C — Scénario MAR n°3 — devis n°1 option baie 33 478,53 € TTC (TVA 5,5 %) — marge CG 5 200 € HT"
        : estPereiraNervieux
          ? "Rénovation globale sans ITI — PAC air/eau HT chauffage seul + CET 250 L, menuiseries 19,38 m², combles 60 m², plancher 19 m² — hors rampants, hors Velux"
          : estGilbertas
            ? PROJET_GILBERTAS_DEFAUT.typeProjet
            : estMassardier
              ? PROJET_MASSARDIER_DEFAUT.typeProjet
              : estCloisonSdb
                ? PROJET_CLOISON_SDB_DEFAUT.typeProjet
                : estDamienPv
                  ? PROJET_DAMIEN_PV_100KWC_DEFAUT.typeProjet
                  : estGesnouin
                    ? PROJET_GESNOUIN_DEFAUT.typeProjet
                    : estFariss
                      ? PROJET_FARISS_DEFAUT.typeProjet
                      : estMasson
                        ? PROJET_MASSON_DEFAUT.typeProjet
                        : estOussara
                          ? PROJET_OUSSARA_DEFAUT.typeProjet
                          : "",
    apporteurId,
    apporteurNom: estDamienPv
      ? "Damien (Éco-Technicien BtoC)"
      : estGesnouin
        ? EQUIPE_GESNOUIN.apporteur
          : estCouty
          ? EQUIPE_COUTY.apporteur
          : estFariss
            ? EQUIPE_FARISS.apporteur
            : estMasson
              ? EQUIPE_MASSON.apporteur
              : estOussara
                ? EQUIPE_OUSSARA.apporteur
                : projet.apporteurNom || libelleSourceApporteur(apporteurId, { select: true }),
    equipe: projet.equipe
      ? projet.equipe
      : estGilbertas
        ? EQUIPE_GILBERTAS
        : estMassardier
          ? EQUIPE_MASSARDIER
          : estCloisonSdb
            ? EQUIPE_CLOISON_SDB
            : estDamienPv
              ? EQUIPE_DAMIEN_PV_100KWC
              : estGesnouin
                ? EQUIPE_GESNOUIN
                : estCouty
                  ? EQUIPE_COUTY
                  : estFariss
                    ? EQUIPE_FARISS
                    : estMasson
                      ? EQUIPE_MASSON
                      : estOussara
                        ? EQUIPE_OUSSARA
                        : estOussaraCombles
                          ? EQUIPE_OUSSARA_COMBLES
                          : null,
    archive: projet.archive === true,
    consultationDuo: projet.consultationDuo === true,
    validationMar: projet.validationMar === true,
    acompte30Encaisse: projet.acompte30Encaisse === true,
    dateVisiteTechnique: projet.dateVisiteTechnique || "",
    statutCommission: projet.statutCommission || STATUT_COMMISSION_EN_ATTENTE,
    detailJalon: projet.detailJalon || "",
    interlocuteur: "",
    telephone: workingBase?.client?.telephone || projet.telephone || "",
    email: workingBase?.client?.email || projet.email || "",
    factureElectrique: "",
    caHt: (() => {
      if (estOussara) return TOTAUX_OUSSARA.totalHt;
      if (estOussaraCombles) return TOTAUX_OUSSARA_COMBLES.totalHt;
      if (estMasson) return TOTAUX_MASSON.totalHt;
      if (estFariss) return TOTAUX_FARISS.totalHt;
      if (estCouty) return TOTAUX_COUTY.totalHt;
      if (estGesnouin) return TOTAUX_GESNOUIN.totalHt;
      if (estDamienPv) return TOTAUX_DAMIEN_PV_100KWC.totalHt;
      if (estCloisonSdb) return TOTAUX_CLOISON_SDB.totalHt;
      if (travauxManuels.length) return ventesManuellesHt;
      if (workingBase) return TOTAUX_OPTION_BAIE.totalHt;
      if (totauxPereira) return totauxPereira.totalHt;
      if (projet.montantHt != null && Number.isFinite(Number(projet.montantHt))) return Number(projet.montantHt);
      if (estGilbertas) return TOTAUX_GILBERTAS.totalHt;
      if (estMassardier) return TOTAUX_MASSARDIER.totalHt;
      if (devisDirect?.totalHt != null) return devisDirect.totalHt;
      if (projet.montantEstimeTtc != null) {
        return Math.round((Number(projet.montantEstimeTtc) / 1.1) * 100) / 100;
      }
      return null;
    })(),
    caTtc: (() => {
      if (estOussara) return TOTAUX_OUSSARA.totalTtc;
      if (estOussaraCombles) return TOTAUX_OUSSARA_COMBLES.totalTtc;
      if (estMasson) return TOTAUX_MASSON.totalTtc;
      if (estFariss) return TOTAUX_FARISS.totalTtc;
      if (estCouty) return TOTAUX_COUTY.totalTtc;
      if (estGesnouin) return TOTAUX_GESNOUIN.totalTtc;
      if (estDamienPv) return TOTAUX_DAMIEN_PV_100KWC.totalTtc;
      if (estCloisonSdb) return TOTAUX_CLOISON_SDB.totalTtc;
      if (travauxManuels.length) return ventesManuellesHt + tvaManuelle;
      // Brunel / Pereira : marchés contractuels figés
      if (workingBase) return TOTAUX_OPTION_BAIE.totalTtc;
      if (totauxPereira) return totauxPereira.totalTtc;
      // Override manuel (édition UI) pour leads / Gilbertas / projets créés
      if (projet.montantEstimeTtc != null && Number.isFinite(Number(projet.montantEstimeTtc))) {
        return Number(projet.montantEstimeTtc);
      }
      if (estGilbertas) return TOTAUX_GILBERTAS.totalTtc;
      if (estMassardier) return TOTAUX_MASSARDIER.totalTtc;
      if (devisDirect?.totalTtc != null) return devisDirect.totalTtc;
      return null;
    })(),
    montantEstimeTtc: estDamienPv || estGesnouin
      ? null
      : projet.montantEstimeTtc != null
        ? Number(projet.montantEstimeTtc)
        : estMassardier
          ? MONTANT_ESTIME_MASSARDIER_TTC
          : estCloisonSdb
            ? TOTAUX_CLOISON_SDB.totalTtc
            : null,
    description:
      projet.description ||
      (estMassardier
        ? PROJET_MASSARDIER_DEFAUT.description
        : estCloisonSdb
          ? PROJET_CLOISON_SDB_DEFAUT.description
          : estDamienPv
            ? PROJET_DAMIEN_PV_100KWC_DEFAUT.description
              : estGesnouin
              ? PROJET_GESNOUIN_DEFAUT.description
              : estFariss
                ? PROJET_FARISS_DEFAUT.description
                : estMasson
                  ? PROJET_MASSON_DEFAUT.description
                  : estOussara
                    ? PROJET_OUSSARA_DEFAUT.description
                    : estOussaraCombles
                      ? PROJET_OUSSARA_COMBLES_DEFAUT.description
                      : ""),
    margeBruteHt: estOussara
      ? TOTAUX_OUSSARA.margeBruteHt
      : estOussaraCombles
        ? null
      : estFariss
      ? null
      : estMasson
        ? TOTAUX_MASSON.margeBruteHt
        : estGesnouin
      ? TOTAUX_GESNOUIN.margeNetteEnergiaHt
      : estDamienPv
        ? TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt
        : estCloisonSdb
          ? TOTAUX_CLOISON_SDB.margeNetteEnergiaHt
          : estMassardier
            ? TOTAUX_MASSARDIER.margeNetteEnergiaHt
            : estGilbertas
              ? TOTAUX_GILBERTAS.margeNetteEnergiaHt
              : devisDirect
                ? devisDirect.margeCgHt
                : travauxManuels.length
                  ? ventesManuellesHt - achatsManuelsHt
                  : null,
    coutAchatHt: estOussara
      ? TOTAUX_OUSSARA.coutsTravauxHt
      : estOussaraCombles
        ? null
      : estFariss
      ? null
      : estMasson
        ? TOTAUX_MASSON.coutsTravauxHt
        : estGesnouin
      ? TOTAUX_GESNOUIN.coutsTravauxHt
      : estDamienPv
        ? TOTAUX_DAMIEN_PV_100KWC.coutsTravauxHt
        : estCloisonSdb
          ? TOTAUX_CLOISON_SDB.coutsTravauxHt
          : estMassardier
            ? TOTAUX_MASSARDIER.coutsTravauxHt
            : estGilbertas
              ? TOTAUX_GILBERTAS.coutsTravauxHt
              : devisDirect
                ? null
                : travauxManuels.length
                  ? achatsManuelsHt
                  : null,
    coutArtisanHt: estOussara
      ? TOTAUX_OUSSARA.coutsTravauxHt
      : estOussaraCombles
        ? null
      : estFariss
      ? null
      : estMasson
        ? TOTAUX_MASSON.coutsTravauxHt
        : estCouty
      ? TOTAUX_COUTY.coutsTravauxHt
      : estGesnouin
      ? TOTAUX_GESNOUIN.coutsTravauxHt
      : estDamienPv
        ? TOTAUX_DAMIEN_PV_100KWC.coutsTravauxHt
        : estCloisonSdb
          ? TOTAUX_CLOISON_SDB.coutsTravauxHt
          : estMassardier
            ? TOTAUX_MASSARDIER.coutsTravauxHt
            : estGilbertas
              ? TOTAUX_GILBERTAS.coutsTravauxHt
              : null,
    partner_commission: estGilbertas ? TOTAUX_GILBERTAS.forfaitCatarinaHt : 0,
    partner_id: estGilbertas ? "catarina_martins" : null,
    commission_rate_default: estOussara || estOussaraCombles ? 0 : projet.commission_rate_default,
    commissionDamienHt: estFariss
      ? TOTAUX_FARISS.commissionDamienHt
      : estCouty
      ? TOTAUX_COUTY.commissionDamienHt
      : estGesnouin
      ? TOTAUX_GESNOUIN.commissionDamienHt
      : estDamienPv
        ? TOTAUX_DAMIEN_PV_100KWC.commissionDamienHt
        : estCloisonSdb
          ? TOTAUX_CLOISON_SDB.commissionDamienHt
          : estMassardier
            ? TOTAUX_MASSARDIER.commissionDamienHt
            : estGilbertas
              ? TOTAUX_GILBERTAS.commissionDamienHt
              : null,
    forfaitCatarinaHt: estGilbertas ? TOTAUX_GILBERTAS.forfaitCatarinaHt : null,
    margeNetteEnergiaHt: estOussara
      ? TOTAUX_OUSSARA.margeBruteHt
      : estFariss
      ? null
      : estMasson
        ? TOTAUX_MASSON.margeNetteEnergiaHt
        : estCouty
      ? TOTAUX_COUTY.margeNetteEnergiaHt
      : estGesnouin
      ? TOTAUX_GESNOUIN.margeNetteEnergiaHt
      : estDamienPv
        ? TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt
        : estCloisonSdb
          ? TOTAUX_CLOISON_SDB.margeNetteEnergiaHt
          : estMassardier
            ? TOTAUX_MASSARDIER.margeNetteEnergiaHt
            : estGilbertas
              ? TOTAUX_GILBERTAS.margeNetteEnergiaHt
              : null,
    syntheseFinanciere: estOussara
      ? { ...TOTAUX_OUSSARA, ...FINANCEMENT_OUSSARA }
      : estOussaraCombles
        ? { ...TOTAUX_OUSSARA_COMBLES, ...FINANCEMENT_OUSSARA_COMBLES }
      : estMasson
      ? { ...TOTAUX_MASSON, ...FINANCEMENT_MASSON }
      : estFariss
      ? { ...TOTAUX_FARISS, ...FINANCEMENT_FARISS }
      : estCouty
      ? { ...TOTAUX_COUTY }
      : estGesnouin
      ? { ...TOTAUX_GESNOUIN }
      : estDamienPv
        ? { ...TOTAUX_DAMIEN_PV_100KWC }
        : estCloisonSdb
          ? { ...TOTAUX_CLOISON_SDB }
          : estMassardier
            ? { ...TOTAUX_MASSARDIER }
            : estGilbertas
              ? { ...TOTAUX_GILBERTAS }
              : null,
    margeDirectionHt: estOussara
      ? TOTAUX_OUSSARA.margeBruteHt
      : estOussaraCombles
        ? null
      : estFariss
      ? null
      : estMasson
        ? TOTAUX_MASSON.margeNetteEnergiaHt
        : estCouty
      ? TOTAUX_COUTY.margeNetteEnergiaHt
      : estGesnouin
      ? TOTAUX_GESNOUIN.margeNetteEnergiaHt
      : estDamienPv
        ? TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt
        : margeDirectionHt,
    margeDirectionTtc: estOussara
      ? null
      : estOussaraCombles
        ? null
      : estFariss
      ? null
      : estMasson
        ? TOTAUX_MASSON.margeNetteTtc
        : estCouty
      ? Math.round(TOTAUX_COUTY.margeNetteEnergiaHt * 1.1 * 100) / 100
      : estGesnouin
      ? Math.round(TOTAUX_GESNOUIN.margeNetteEnergiaHt * 1.2 * 100) / 100
      : estDamienPv
        ? Math.round(TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt * 1.2 * 100) / 100
        : margeDirectionTtc,
    echeancier: workingBase
      ? {
          acompte: TOTAUX_OPTION_BAIE.acompte,
          intermediaire: TOTAUX_OPTION_BAIE.intermediaire,
          solde: TOTAUX_OPTION_BAIE.solde,
        }
      : estPereiraNervieux
        ? {
            acompte: FINANCEMENT_PEREIRA_CG.acompte,
            intermediaire: FINANCEMENT_PEREIRA_CG.intermediaire,
            solde: FINANCEMENT_PEREIRA_CG.solde,
          }
        : estGilbertas
          ? { ...FINANCEMENT_GILBERTAS }
          : estCloisonSdb
            ? { ...FINANCEMENT_CLOISON_SDB }
            : estDamienPv
              ? { ...FINANCEMENT_DAMIEN_PV_100KWC }
              : estGesnouin
                ? { ...FINANCEMENT_GESNOUIN }
                : estCouty
                  ? { ...FINANCEMENT_COUTY }
                  : estFariss
                    ? { ...FINANCEMENT_FARISS }
                    : estMasson
                      ? { ...FINANCEMENT_MASSON }
                      : estOussara
                        ? { ...FINANCEMENT_OUSSARA }
                        : estOussaraCombles
                          ? { ...FINANCEMENT_OUSSARA_COMBLES }
                          : null,
    horsSubvention: workingBase
      ? `Devis n°2 hors ANAH (locaux non chauffés, TVA 10 %) : 7 489,20 € HT / 8 238,12 € TTC (TVA ${TOTAUX_DEVIS_HORS_ANAH.totalTva.toLocaleString("fr-FR")} €).`
      : null,
    rfr: projet.rfr ?? null,
    categorieAide: estPereiraNervieux ? "violet" : workingBase ? null : projet.profilAnah || null,
    profilAnah: workingBase ? PROFIL_ANAH_BRUNEL.id : estPereiraNervieux ? "violet" : projet.profilAnah || "",
    statutOccupation: projet.statutOccupation || "",
    libelleRfr: libelleRfrRecu(projet.rfr),
    alertes: workingBase?.alertes ?? projet.alertes ?? [],
    commercial_id: null,
    travaux: travauxManuels,
    devisIndicatif: devisDirect,
    workingBase,
    dossier: projet,
  };
}

export function sanitiserProjetPourRole(audit, role) {
  if (!audit) return audit;
  const auditAvecCouts = peutVoirCoutsInternes(role)
    ? audit
    : {
        ...audit,
        margeBruteHt: null,
        coutAchatHt: null,
        coutArtisanHt: null,
        commissionDamienHt: null,
        forfaitCatarinaHt: null,
        margeNetteEnergiaHt: null,
        partner_commission: null,
        syntheseFinanciere: audit.syntheseFinanciere
          ? {
              ...audit.syntheseFinanciere,
              coutsTravauxHt: null,
              commissionDamienHt: null,
              forfaitCatarinaHt: null,
              margeNetteEnergiaHt: null,
            }
          : audit.syntheseFinanciere,
        travaux: (audit.travaux || []).map(({ coutAchatHt: _cout, margeBruteHt: _marge, ...lot }) => lot),
        dossier: audit.dossier
          ? {
              ...audit.dossier,
              travaux: (audit.dossier.travaux || []).map(
                ({ coutAchatPuHt: _pu, coutAchatHt: _achat, margeBruteHt: _marge, ...lot }) => lot,
              ),
              syntheseFinanciere: audit.dossier.syntheseFinanciere
                ? {
                    ...audit.dossier.syntheseFinanciere,
                    coutsTravauxHt: null,
                    commissionDamienHt: null,
                    forfaitCatarinaHt: null,
                    margeNetteEnergiaHt: null,
                  }
                : audit.dossier.syntheseFinanciere,
            }
          : audit.dossier,
      };
  audit = auditAvecCouts;
  const workingBase = audit.workingBase ? sanitiserBasePourRole(audit.workingBase, role) : null;
  const alertes = peutVoirAlertesIdentite(role) ? workingBase?.alertes ?? audit.alertes ?? [] : [];
  if (peutVoirRfr(role) || role === ROLE_ADMIN) {
    return { ...audit, workingBase, alertes };
  }
  const { rfr: _rfr, libelleRfr: _libelle, dossier, ...reste } = audit;
  const dossierPublic = dossier
    ? (({ rfr: _rfrDossier, alertes: _alertesDossier, ...resteDossier }) => resteDossier)(dossier)
    : dossier;
  return {
    ...reste,
    rfr: null,
    libelleRfr: "",
    categorieAide: null,
    alertes,
    workingBase,
    dossier: dossierPublic,
  };
}

/**
 * Mode édition CRM — persistance locale par dossier.
 * Les montants restent indicatifs. Le devis officiel (documents.devis) n’est pas fermé ici.
 */

import { HONORAIRES_HUB_ADMIN_HT, HONORAIRES_HUB_ADMIN_HT_ANCIEN } from "./operationnelCrm.js";
import { BRUNEL_DOSSIER_ID, enregistrerPrefillBrunel, lireBaseTravailBrunel } from "./brunelWorkingBase.js";
import { ROLE_ADMIN } from "./roles.js";
import { calculerMargesSousTraitance } from "./artisansRge.js";
import {
  AIDES_BRUNEL_V3,
  BRUNEL_FINAL_NUMERO,
  COMBLES_QTE_DEFAUT,
  CLAUSE_INDIVISION_COUBLE_815,
  BRUNEL_V4_VERSION,
  FINANCEMENT_BRUNEL_V3,
  FINANCEMENT_BRUNEL_V4,
  TOTAUX_BRUNEL_V3,
  TOTAUX_BRUNEL_V4,
  appliquerQuantiteComblesV3,
  calculerPosteCombles,
  editionOfficielleBrunelV3,
  editionOfficielleBrunelV4,
} from "./brunelDevisV3Officiel.js";
import {
  BRUNEL_V5_VERSION,
  FINANCEMENT_BRUNEL_V5_AUTONOMIE,
  NOTE_SOLAIRE_HORS_MPR,
  OFFRE_AUTONOMIE,
  OFFRE_PERFORMANCE,
  POSTE_SOLAIRE_V5_ID,
  TOTAUX_BRUNEL_V5_CUMUL,
  estOffreAutonomieBrunel,
  lignesTravauxBrunelV5,
  normaliserOffreBrunel,
} from "./brunelOffresV5.js";
import { OFFRE_BRUNEL_OPTION_SANS_BAIE } from "./brunelMarcheOfficiel2026.js";
import {
  AIDES_PEREIRA_VIOLET,
  FINANCEMENT_PEREIRA_CG,
  MENTION_AIDES_PEREIRA_NERVIEUX,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  PEREIRA_NERVIEUX_NUMERO,
  TOTAUX_PEREIRA_NERVIEUX,
  editionOfficiellePereiraNervieux,
} from "./pereiraNervieuxOfficiel.js";
import {
  CLOISON_SDB_CONTRAT_NUMERO,
  CLOISON_SDB_DOSSIER_ID,
  FINANCEMENT_CLOISON_SDB,
  TOTAUX_CLOISON_SDB,
  editionOfficielleCloisonSdb,
} from "./cloisonSdbOfficiel.js";
import { CLIENT_OUSSARA, OUSSARA_DOSSIER_ID } from "./oussaraColombierOfficiel.js";
import { OUSSARA_COMBLES_DOSSIER_ID } from "./oussaraComblesOfficiel.js";

export const EDITION_STORAGE_KEY = "energia-crm-edition-dossier-v1";

export const STATUTS_OCCUPATION = [
  { id: "proprietaire_occupant", label: "Propriétaire occupant" },
  { id: "bailleur", label: "Bailleur" },
  { id: "acquereur", label: "Acquéreur" },
];

export const PROFILS_ANAH = [
  { id: "bleu", label: "Bleu — très modestes", tauxParcours: 0.8, max2: 24000, max3: 32000, ecretement: 1 },
  { id: "jaune", label: "Jaune — modestes", tauxParcours: 0.6, max2: 18000, max3: 24000, ecretement: 0.8 },
  { id: "violet", label: "Violet — intermédiaires", tauxParcours: 0.45, max2: 13500, max3: 18000, ecretement: 0.8 },
  { id: "rose", label: "Rose — aisés", tauxParcours: 0.1, max2: 3000, max3: 4000, ecretement: 0.5 },
];

export const REGIONS_AIDES_LOCALES = [
  { id: "BFC", label: "Bourgogne-Franche-Comté", montantIndicatif: 2000 },
  { id: "AURA", label: "Auvergne-Rhône-Alpes", montantIndicatif: 2500 },
  { id: "autre", label: "Autre région", montantIndicatif: 1000 },
];

export const PIECES_OBLIGATOIRES = [
  { id: "photo_facades", libelle: "Photo façades", type: "photo", fiscal: false },
  { id: "photo_chaufferie", libelle: "Photo chaufferie", type: "photo", fiscal: false },
  { id: "photo_combles", libelle: "Photo combles", type: "photo", fiscal: false },
  { id: "photo_tableau", libelle: "Photo tableau électrique", type: "photo", fiscal: false },
  { id: "avis_imposition", libelle: "Dernier avis d’imposition (RFR)", type: "fiscal", fiscal: true },
  { id: "facture_energie_dpe", libelle: "Facture d’énergie / DPE actuel", type: "energie", fiscal: false },
];

export const STATUTS_PIECE = [
  { id: "manquante", label: "Manquante" },
  { id: "recue", label: "Reçue" },
  { id: "validee", label: "Validée" },
];

export const FAMILLES_THERMIQUES = [
  { id: "isolation", nom: "Isolation", categorieIds: ["isolation"] },
  { id: "menuiseries", nom: "Menuiseries", categorieIds: ["menuiserie", "double-vitrage"] },
  { id: "ventilation", nom: "Ventilation", categorieIds: ["electricite"], sousCategorieFiltre: /vmc/i },
  { id: "chauffage", nom: "Chauffage", categorieIds: ["pompe-a-chaleur", "chauffage"] },
  { id: "ecs", nom: "ECS", categorieIds: ["plomberie-sanitaire"], sousCategorieFiltre: /ballon|eau chaude|ecs/i },
  { id: "solaire", nom: "Solaire", categorieIds: ["photovoltaique", "chauffe-eau-solaire"] },
];

/** Catalogue complet — sélecteur travaux CRM (hors études / honoraires ENERGIA). */
export const FAMILLES_TRAVAUX_CRM = [
  ...FAMILLES_THERMIQUES,
  { id: "electricite", nom: "Électricité", categorieIds: ["electricite"] },
  { id: "mobilite-electrique", nom: "Mobilité électrique", categorieIds: ["mobilite-electrique"] },
  { id: "toiture", nom: "Toiture", categorieIds: ["toiture"] },
  { id: "charpente", nom: "Charpente", categorieIds: ["charpente"] },
  { id: "peinture", nom: "Peinture", categorieIds: ["peinture"] },
  { id: "plafonds-tendus", nom: "Plafonds tendus", categorieIds: ["plafonds-tendus"] },
  { id: "plomberie", nom: "Plomberie", categorieIds: ["plomberie"] },
  { id: "plomberie-sanitaire", nom: "Plomberie sanitaire", categorieIds: ["plomberie-sanitaire"] },
  { id: "carrelage", nom: "Carrelage", categorieIds: ["carrelage"] },
  { id: "maconnerie", nom: "Maçonnerie", categorieIds: ["maconnerie"] },
  { id: "poele-bois-granules", nom: "Poêle bois & granulés", categorieIds: ["poele-bois-granules"] },
  { id: "ravalement-facade", nom: "Ravalement de façade", categorieIds: ["ravalement-facade"] },
  { id: "menuiserie-interieure", nom: "Menuiserie intérieure", categorieIds: ["menuiserie-interieure"] },
  { id: "serrurerie", nom: "Serrurerie", categorieIds: ["serrurerie"] },
  { id: "vitrerie", nom: "Vitrerie", categorieIds: ["vitrerie"] },
  { id: "demolition", nom: "Démolition", categorieIds: ["demolition"] },
  { id: "terrassement", nom: "Terrassement", categorieIds: ["terrassement"] },
  { id: "paysagisme", nom: "Paysagisme", categorieIds: ["paysagisme"] },
  { id: "climatisation", nom: "Climatisation", categorieIds: ["climatisation"] },
  { id: "renovation-globale", nom: "Rénovation globale", categorieIds: ["renovation-globale"] },
  { id: "piscine", nom: "Piscine", categorieIds: ["piscine"] },
];

export const ORDRE_THERMIQUE_LABELS = [
  "Combles",
  "Murs",
  "Planchers",
  "Fenêtres",
  "VMC",
  "PAC",
  "ECS",
  "PV",
];

export const TVA_RENOVATION = 0.055;
export const COMMISSION_HT_DEFAUT = 10;

/** Coût interne Clyve — montage administratif / dossiers d’aides. Non facturé au client. */
export const COUT_CLYVE_HT_DEFAUT = HONORAIRES_HUB_ADMIN_HT;
export const LIBELLE_COUT_CLYVE = "Gestion administrative & montage aides (Clyve)";
export const ECO_PTZ_MIN = 0;
export const ECO_PTZ_MAX = 50000;
export const ECO_PTZ_DUREE_MIN = 10;
export const ECO_PTZ_DUREE_MAX = 20;

export const MENTION_AIDES_EDITION =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.";

export const MENTION_AIDES_DEVIS_V3 =
  "Aides financières 2026 (estimation à titre indicatif) — montants du contrat officiel CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL (100 m²). Aides à valider selon revenus réels et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.";

export const MENTION_CEE_INTEGREE_PARCOURS =
  "Valorisation CEE déjà intégrée dans le taux MaPrimeRénov'";

export const MENTION_FINANCEMENT_EDITION =
  "Simulation indicative. Elle ne constitue pas une offre de prêt. Aucun taux, accord ou mensualité n’est garanti sans validation par un organisme financier.";

export const CONTACT_FABIEN_COURTAGE = {
  nom: "FABIEN",
  societe: "VIVONS COURTIER",
  telephone: "06 71 19 96 45",
  libelle:
    "Courtier en travaux & financements : FABIEN — VIVONS COURTIER — 06 71 19 96 45",
};

/** Canal 1 — prêt d’État. Aucune association au courtage Fabien. */
export const CANAL_ECO_PTZ_ETAT = {
  id: "eco_ptz_etat",
  titre: "CANAL 1 : Éco-PTZ d’État à Taux 0 % (Banques de réseau conventionnées)",
  option: "Option A — Mensualité Éco-PTZ 0 % (Banques d’État)",
  rappel:
    "Prêt à taux zéro d’État (0,00 % d’intérêts) jusqu’à 50 000 € sur 15 à 20 ans, souscrit auprès des banques partenaires de l’État (Crédit Agricole, Caisse d’Épargne, etc.). L’Éco-PTZ à taux 0 % est instruit en banque partenaire avec le dossier technique fourni par ENERGIA CONSEIL IA®.",
};

export const CANAL_PRET_TRAVAUX_FABIEN = {
  id: "pret_travaux_fabien",
  titre: `CANAL 2 : Solutions Prêt Travaux & Regroupement de Crédits — ${CONTACT_FABIEN_COURTAGE.libelle}`,
  option: `Option B — Solutions Prêt Travaux ou Regroupement de crédits (${CONTACT_FABIEN_COURTAGE.nom} — ${CONTACT_FABIEN_COURTAGE.societe} ${CONTACT_FABIEN_COURTAGE.telephone})`,
  pretTravaux:
    "Prêts travaux rénovation : de 6 000 € à 75 000 € (apport 0 € possible, accord rapide, sans changer de banque).",
  regroupement:
    "Regroupement / rachat de crédits : restructuration des crédits en cours (immobilier + conso) avec enveloppe travaux intégrée pour lisser les mensualités globales et respecter le taux d’endettement de 35 %.",
  enveloppe: "Enveloppe travaux 6 000 € à 75 000 € sur étude de dossier.",
};

const GESTES_MPR = {
  combles: { bleu: 25, jaune: 20, violet: 15, rose: 0, parM2: true, surfaceMax: 100 },
  ite: { bleu: 75, jaune: 60, violet: 40, rose: 15, parM2: true },
  iti: { bleu: 25, jaune: 20, violet: 15, rose: 7, parM2: true },
  planchers: { bleu: 50, jaune: 40, violet: 25, rose: 0, parM2: true },
  fenetres: { bleu: 100, jaune: 80, violet: 40, rose: 0, parM2: false },
  pac: { bleu: 5000, jaune: 4000, violet: 3000, rose: 0, forfait: true },
  vmc: { bleu: 4000, jaune: 3000, violet: 2000, rose: 0, forfait: true },
  ballon: { bleu: 1200, jaune: 800, violet: 400, rose: 0, forfait: true },
};

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function nombreOuNull(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function extraireNombre(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value).replace(/\s/g, " ").match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const n = Number(match[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function nouveauId(prefix = "ed") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ordreThermiqueLigne({ categorieId = "", sousCategorieId = "", nom = "", familleId = "" } = {}) {
  const texte = `${familleId} ${categorieId} ${sousCategorieId} ${nom}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/comble|rampant/.test(texte)) return 1;
  if (/\bite\b|isolation des murs par l.exterieur|murs par l.exterieur/.test(texte)) return 2;
  if (/\biti\b|isolation des murs par l.interieur|murs par l.interieur/.test(texte)) return 2;
  if (/plancher/.test(texte)) return 3;
  if (/fenetre|menuiser|vitrage|porte-fenetre|baie/.test(texte)) return 4;
  if (/vmc|ventil/.test(texte)) return 5;
  if (/pac|pompe.a.chaleur|chaudiere|chauffage/.test(texte)) return 6;
  if (/ballon|ecs|eau chaude|thermodynamique|cet/.test(texte)) return 7;
  if (/photo|pv|solaire/.test(texte)) return 8;
  if (familleId === "isolation" || categorieId === "isolation") return 2;
  if (familleId === "menuiseries") return 4;
  if (familleId === "ventilation") return 5;
  if (familleId === "chauffage") return 6;
  if (familleId === "ecs") return 7;
  if (familleId === "solaire") return 8;
  return 9;
}

export function trierLignesThermiques(lignes) {
  return [...(lignes || [])].sort((a, b) => {
    const ca = Number(a.ordreContractuel);
    const cb = Number(b.ordreContractuel);
    if (Number.isFinite(ca) && Number.isFinite(cb) && ca !== cb) return ca - cb;
    const oa = a.ordreThermique ?? ordreThermiqueLigne(a);
    const ob = b.ordreThermique ?? ordreThermiqueLigne(b);
    if (oa !== ob) return oa - ob;
    return String(a.nom || "").localeCompare(String(b.nom || ""), "fr");
  });
}

export function regionDepuisCodePostal(codePostal) {
  const cp = String(codePostal || "").replace(/\D/g, "");
  const dep = cp.slice(0, 2);
  if (["21", "25", "39", "58", "70", "71", "89", "90"].includes(dep)) return "BFC";
  if (["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"].includes(dep)) return "AURA";
  return "autre";
}

function pieceVide(id) {
  return { id, statut: "manquante", nomFichier: "", documentId: null };
}

export function editionVide() {
  return {
    version: 1,
    client: {
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      adresse: "",
      anneeConstruction: "",
      surfaceHabitable: "",
      statutOccupation: "",
    },
    travaux: [],
    aides: {
      profil: "",
      parcours: "parcours",
      gainClasses: 2,
      region: "",
      overrides: { mpr: null, cee: null, locales: null, coupDePouce: null },
    },
    financement: {
      ecoPtzMontant: 15000,
      ecoPtzDuree: 15,
      apportPersonnel: null,
    },
    pieces: Object.fromEntries(PIECES_OBLIGATOIRES.map((p) => [p.id, pieceVide(p.id)])),
    finances: {
      coutMaterielHt: null,
      coutPoseRgeHt: null,
      tauxCommission: COMMISSION_HT_DEFAUT,
      coutClyveHt: COUT_CLYVE_HT_DEFAUT,
    },
    valorisation: {
      prixM2Constate: null,
      dpeActuel: "",
      dpeCible: "",
    },
    verrouillageOfficiel: false,
    devisOfficiel: null,
    mentionsJuridiques: [],
    prestataire: null,
    mar: null,
    offreActive: OFFRE_PERFORMANCE,
    qualification: {
      budgetMaxTtc: "",
      origineFonds: "",
      decisionnaires: "",
      statutFaisabilite: "",
      recadrageOral: false,
      qualifieLe: "",
    },
    phasage: {
      accordAnahNotifie: false,
      packs: {},
      phases: {},
      optionRetenue: "",
    },
  };
}

function fusionnerEdition(base, extra) {
  const vide = editionVide();
  const source = extra && typeof extra === "object" ? extra : {};
  return {
    ...vide,
    ...base,
    ...source,
    version: 1,
    client: { ...vide.client, ...(base?.client || {}), ...(source.client || {}) },
    travaux: Array.isArray(source.travaux) ? source.travaux : Array.isArray(base?.travaux) ? base.travaux : [],
    aides: {
      ...vide.aides,
      ...(base?.aides || {}),
      ...(source.aides || {}),
      overrides: {
        ...vide.aides.overrides,
        ...(base?.aides?.overrides || {}),
        ...(source.aides?.overrides || {}),
      },
    },
    financement: { ...vide.financement, ...(base?.financement || {}), ...(source.financement || {}) },
    pieces: { ...vide.pieces, ...(base?.pieces || {}), ...(source.pieces || {}) },
    finances: { ...vide.finances, ...(base?.finances || {}), ...(source.finances || {}) },
    valorisation: { ...vide.valorisation, ...(base?.valorisation || {}), ...(source.valorisation || {}) },
    qualification: {
      ...vide.qualification,
      ...(base?.qualification || {}),
      ...(source.qualification || {}),
    },
    phasage: {
      ...vide.phasage,
      ...(base?.phasage || {}),
      ...(source.phasage || {}),
      packs: { ...(base?.phasage?.packs || {}), ...(source.phasage?.packs || {}) },
      phases: { ...(base?.phasage?.phases || {}), ...(source.phasage?.phases || {}) },
    },
    devisOfficiel: source.devisOfficiel || base?.devisOfficiel || vide.devisOfficiel,
    mentionsJuridiques: Array.isArray(source.mentionsJuridiques)
      ? source.mentionsJuridiques
      : Array.isArray(base?.mentionsJuridiques)
        ? base.mentionsJuridiques
        : vide.mentionsJuridiques,
    prestataire: source.prestataire || base?.prestataire || vide.prestataire,
    mar: source.mar || base?.mar || vide.mar,
    verrouillageOfficiel: Boolean(source.verrouillageOfficiel ?? base?.verrouillageOfficiel),
    offreActive:
      (source.offreActive ?? base?.offreActive) === OFFRE_BRUNEL_OPTION_SANS_BAIE
        ? OFFRE_BRUNEL_OPTION_SANS_BAIE
        : normaliserOffreBrunel(source.offreActive ?? base?.offreActive ?? vide.offreActive),
  };
}

function hydraterDepuisDossier(dossier) {
  if (!dossier) return editionVide();
  const wb = dossier.workingBase;
  const nomComplet = String(dossier.nom || wb?.client?.nom || "").trim();
  const prenomConnu = String(dossier.prenoms || wb?.client?.prenoms || "").trim();
  let nom = nomComplet;
  let prenom = prenomConnu;
  if (!prenom && nomComplet.includes(" ")) {
    const parts = nomComplet.split(/\s+/);
    prenom = parts.slice(0, -1).join(" ");
    nom = parts.slice(-1).join(" ");
  }
  const surface = extraireNombre(
    wb?.logement?.surfaceHabitable ?? dossier.surface ?? dossier.dossier?.surfaceHabitable,
  );
  const annee = extraireNombre(
    wb?.logement?.anneeConstruction ?? dossier.anneeConstruction ?? dossier.dossier?.anneeConstruction,
  );
  return fusionnerEdition(editionVide(), {
    client: {
      nom,
      prenom,
      telephone: dossier.telephone || wb?.client?.telephone || "",
      email: dossier.email || wb?.client?.email || "",
      adresse: dossier.adresse || wb?.logement?.adresseExacte || wb?.client?.adresse || "",
      anneeConstruction: annee != null ? String(annee) : String(dossier.anneeConstruction || dossier.dossier?.anneeConstruction || ""),
      surfaceHabitable: surface != null ? String(surface) : "",
      statutOccupation: wb?.client?.statutOccupation || "",
    },
  });
}

function lireTous() {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(EDITION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function ecrireTous(tous) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(EDITION_STORAGE_KEY, JSON.stringify(tous));
  } catch {
    /* quota */
  }
}

export function appliquerVerrouillageBrunelV3(edition) {
  const v3 = editionOfficielleBrunelV3();
  const actuel = edition && typeof edition === "object" ? edition : {};
  const locked = fusionnerEdition(actuel, {
    ...v3,
    pieces: actuel.pieces,
    finances: actuel.finances,
  });
  return {
    ...locked,
    travaux: appliquerQuantiteComblesV3(locked.travaux, COMBLES_QTE_DEFAUT),
  };
}

export function appliquerVerrouillageBrunelV4(edition) {
  const v4 = editionOfficielleBrunelV4();
  const actuel = edition && typeof edition === "object" ? edition : {};
  const locked = fusionnerEdition(actuel, {
    ...v4,
    pieces: actuel.pieces,
    finances: { ...v4.finances, ...(actuel.finances || {}) },
  });
  return {
    ...locked,
    version: BRUNEL_V4_VERSION,
    travaux: locked.travaux,
    offreActive: normaliserOffreBrunel(actuel.offreActive),
  };
}

export function appliquerVerrouillageBrunelV5(edition) {
  const offre = normaliserOffreBrunel(edition?.offreActive);
  const v4 = appliquerVerrouillageBrunelV4(edition);
  const mentions = Array.isArray(v4.mentionsJuridiques) ? [...v4.mentionsJuridiques] : [];
  if (offre === OFFRE_AUTONOMIE && !mentions.includes(NOTE_SOLAIRE_HORS_MPR)) {
    mentions.push(NOTE_SOLAIRE_HORS_MPR);
  }
  const financement =
    offre === OFFRE_AUTONOMIE
      ? {
          ...v4.financement,
          ecoPtzMontant: FINANCEMENT_BRUNEL_V5_AUTONOMIE.ecoPtzMontant,
          ecoPtzDuree: FINANCEMENT_BRUNEL_V5_AUTONOMIE.ecoPtzDuree,
          apportPersonnel: FINANCEMENT_BRUNEL_V5_AUTONOMIE.apportPersonnel,
          acompte: FINANCEMENT_BRUNEL_V5_AUTONOMIE.acompte,
          intermediaire: FINANCEMENT_BRUNEL_V5_AUTONOMIE.intermediaire,
          solde: FINANCEMENT_BRUNEL_V5_AUTONOMIE.solde,
        }
      : v4.financement;
  return {
    ...v4,
    offreActive: edition?.offreActive === OFFRE_BRUNEL_OPTION_SANS_BAIE ? OFFRE_BRUNEL_OPTION_SANS_BAIE : offre,
    version: offre === OFFRE_AUTONOMIE ? BRUNEL_V5_VERSION : BRUNEL_V4_VERSION,
    travaux: lignesTravauxBrunelV5(offre),
    mentionsJuridiques: mentions.filter((m) => offre === OFFRE_AUTONOMIE || m !== NOTE_SOLAIRE_HORS_MPR),
    financement,
  };
}

export function appliquerVerrouillagePereiraNervieux(edition) {
  const officiel = editionOfficiellePereiraNervieux();
  const actuel = edition && typeof edition === "object" ? edition : {};
  const locked = fusionnerEdition(actuel, {
    ...officiel,
    pieces: actuel.pieces,
    finances: { ...officiel.finances, ...(actuel.finances || {}) },
    photos: {
      ...officiel.photos,
      ajouts: actuel.photos?.ajouts && typeof actuel.photos.ajouts === "object" ? actuel.photos.ajouts : {},
    },
  });
  if (actuel.offrePereira) locked.offrePereira = actuel.offrePereira;
  return locked;
}

export function appliquerVerrouillageCloisonSdb(edition) {
  const officiel = editionOfficielleCloisonSdb();
  const actuel = edition && typeof edition === "object" ? edition : {};
  return fusionnerEdition(actuel, {
    ...officiel,
    pieces: actuel.pieces,
    finances: { ...officiel.finances, ...(actuel.finances || {}) },
    photos: {
      ...officiel.photos,
      ajouts: actuel.photos?.ajouts && typeof actuel.photos.ajouts === "object" ? actuel.photos.ajouts : {},
    },
  });
}

export function appliquerVerrouillageOussara(edition) {
  const actuel = edition && typeof edition === "object" ? edition : {};
  return fusionnerEdition(actuel, {
    client: {
      ...(actuel.client || {}),
      nom: CLIENT_OUSSARA.nom,
      prenom: CLIENT_OUSSARA.prenom,
      adresse: CLIENT_OUSSARA.adresse,
    },
  });
}

export function lireEditionStockee(dossierId) {
  const id = String(dossierId || "").trim();
  if (!id) return null;
  const stocke = lireTous()[id];
  return stocke && typeof stocke === "object" ? stocke : null;
}

export function lireEditionDossier(dossierId, dossier) {
  const id = String(dossierId || "").trim();
  const hydrate = hydraterDepuisDossier(dossier);
  if (!id) return hydrate;
  const stocke = lireTous()[id];
  const fusion = fusionnerEdition(hydrate, stocke);
  if (id === BRUNEL_DOSSIER_ID) {
    const locked = appliquerVerrouillageBrunelV5(fusion);
    const tous = lireTous();
    tous[id] = locked;
    ecrireTous(tous);
    return locked;
  }
  if (id === PEREIRA_NERVIEUX_DOSSIER_ID) {
    const locked = appliquerVerrouillagePereiraNervieux(fusion);
    const tous = lireTous();
    tous[id] = locked;
    ecrireTous(tous);
    return locked;
  }
  if (id === CLOISON_SDB_DOSSIER_ID) {
    const locked = appliquerVerrouillageCloisonSdb(fusion);
    const tous = lireTous();
    tous[id] = locked;
    ecrireTous(tous);
    return locked;
  }
  if (id === OUSSARA_DOSSIER_ID || id === OUSSARA_COMBLES_DOSSIER_ID) {
    const locked = appliquerVerrouillageOussara(fusion);
    const tous = lireTous();
    tous[id] = locked;
    ecrireTous(tous);
    return locked;
  }
  return fusion;
}

export function enregistrerEditionDossier(dossierId, patch, dossier) {
  const id = String(dossierId || "").trim();
  const actuel = lireEditionDossier(id, dossier);
  const fusion = fusionnerEdition(actuel, patch);
  const suivant =
    id === BRUNEL_DOSSIER_ID
      ? appliquerVerrouillageBrunelV5(fusion)
      : id === CLOISON_SDB_DOSSIER_ID
        ? appliquerVerrouillageCloisonSdb(fusion)
        : id === OUSSARA_DOSSIER_ID || id === OUSSARA_COMBLES_DOSSIER_ID
          ? appliquerVerrouillageOussara(fusion)
          : fusion;
  if (id) {
    const tous = lireTous();
    tous[id] = suivant;
    ecrireTous(tous);
    synchroniserBaseTravail(id, suivant);
  }
  return suivant;
}

export function reinitialiserEditionTests() {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(EDITION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

function synchroniserBaseTravail(dossierId, edition) {
  if (dossierId !== BRUNEL_DOSSIER_ID) return;
  try {
    const actuel = lireBaseTravailBrunel();
    const surface = extraireNombre(edition.client.surfaceHabitable);
    const annee = extraireNombre(edition.client.anneeConstruction);
    enregistrerPrefillBrunel({
      client: {
        ...actuel.client,
        nom: [edition.client.prenom, edition.client.nom].filter(Boolean).join(" ") || actuel.client.nom,
        prenoms: edition.client.prenom || actuel.client.prenoms,
        telephone: edition.client.telephone || null,
        email: edition.client.email || null,
        adresse: edition.client.adresse || null,
        statutOccupation: edition.client.statutOccupation || actuel.client.statutOccupation || null,
      },
      logement: {
        ...actuel.logement,
        adresseExacte: edition.client.adresse || actuel.logement.adresseExacte,
        surfaceHabitable: surface != null ? `${surface} m²` : actuel.logement.surfaceHabitable,
        anneeConstruction: annee != null ? String(annee) : actuel.logement.anneeConstruction,
      },
      travauxProposes: (edition.travaux || []).map((ligne) => ({
        id: ligne.id,
        prestation: ligne.nom,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prixHt: ligne.totalHt,
        tva: ligne.tauxTva,
        prixTtc: ligne.totalTtc,
        sourcePrix: "catalogue_indicatif",
        prixFerme: false,
        statut: "propose",
        fourchette: true,
        ordreThermique: ligne.ordreThermique,
      })),
    });
  } catch {
    /* base de travail indisponible */
  }
}

export function prixUnitaireIndicatif(prestation) {
  if (!prestation) return { puHt: 0, tauxTva: TVA_RENOVATION, unite: "u", source: "saisie" };
  if (prestation.prixVenteHt != null && Number.isFinite(Number(prestation.prixVenteHt))) {
    return {
      puHt: round2(Number(prestation.prixVenteHt)),
      tauxTva: Number(prestation.tauxTva) || TVA_RENOVATION,
      unite: prestation.unite || "u",
      source: "catalogue",
    };
  }
  const ref = prestation.referenceMarche;
  if (ref?.priceMedianHT != null) {
    return {
      puHt: round2(Number(ref.priceMedianHT)),
      tauxTva: Number(ref.vatRate) || TVA_RENOVATION,
      unite: ref.unit || prestation.unite || "u",
      source: "marche",
    };
  }
  return {
    puHt: 0,
    tauxTva: Number(prestation.tauxTva) || TVA_RENOVATION,
    unite: prestation.unite || "u",
    source: "saisie",
  };
}

export function calculerLigneTravaux(ligne) {
  if (ligne?.quantiteFlexible) {
    const calcule = calculerPosteCombles(ligne.quantite);
    const ordre = ligne.ordreThermique ?? ordreThermiqueLigne(ligne);
    return {
      ...ligne,
      ...calcule,
      quantiteFlexible: true,
      ordreThermique: ordre,
      ordreLabel: ORDRE_THERMIQUE_LABELS[ordre - 1] || "Autre",
    };
  }
  if (ligne?.verrouillageOfficiel && ligne.totalHt != null && ligne.totalTva != null && ligne.totalTtc != null) {
    const ordre = ligne.ordreThermique ?? ordreThermiqueLigne(ligne);
    return {
      ...ligne,
      quantite: Math.max(0, nombreOuNull(ligne.quantite) ?? 0),
      puHt: Math.max(0, nombreOuNull(ligne.puHt) ?? 0),
      tauxTva: nombreOuNull(ligne.tauxTva) ?? TVA_RENOVATION,
      totalHt: round2(ligne.totalHt),
      totalTva: round2(ligne.totalTva),
      totalTtc: round2(ligne.totalTtc),
      ordreThermique: ordre,
      ordreLabel: ORDRE_THERMIQUE_LABELS[ordre - 1] || "Autre",
    };
  }
  const quantite = Math.max(0, nombreOuNull(ligne.quantite) ?? 0);
  const puHt = Math.max(0, nombreOuNull(ligne.puHt) ?? 0);
  const tauxTva = nombreOuNull(ligne.tauxTva) ?? TVA_RENOVATION;
  const totalHt = round2(quantite * puHt);
  const totalTva = round2(totalHt * tauxTva);
  const totalTtc = round2(totalHt + totalTva);
  const ordre = ligne.ordreThermique ?? ordreThermiqueLigne(ligne);
  return {
    ...ligne,
    quantite,
    puHt,
    tauxTva,
    totalHt,
    totalTva,
    totalTtc,
    ordreThermique: ordre,
    ordreLabel: ORDRE_THERMIQUE_LABELS[ordre - 1] || "Autre",
  };
}

export function creerLigneTravaux({ familleId, categorieId, sousCategorieId, prestation, quantite }) {
  const tarif = prixUnitaireIndicatif(prestation);
  return calculerLigneTravaux({
    id: nouveauId("trav"),
    familleId: familleId || "",
    categorieId: categorieId || prestation?.categorieId || "",
    sousCategorieId: sousCategorieId || prestation?.sousCategorieId || "",
    prestationId: prestation?.id || "",
    nom: prestation?.nom || "Prestation",
    quantite: nombreOuNull(quantite) ?? 1,
    unite: tarif.unite,
    puHt: tarif.puHt,
    tauxTva: tarif.tauxTva,
    sourcePrix: tarif.source,
    modeSousTraitance: prestation?.modeSousTraitance || "fourniture_pose",
    coutFourniturePoseHt: prestation?.coutFourniturePoseHt ?? null,
    fourniturePosePuHt: prestation?.coutFourniturePoseHt ?? null,
    poseSeulePuHt: prestation?.coutMainOeuvreHt ?? null,
    materielDirectPuHt: prestation?.coutMaterielHt ?? null,
  });
}

export function totauxTravaux(lignes) {
  const calculees = trierLignesThermiques((lignes || []).map(calculerLigneTravaux));
  const pereiraOfficiel = calculees.some(
    (l) =>
      String(l.id || "").startsWith("pereira-nvx-poste-") &&
      l.prestationId === "energia-contractant-general" &&
      l.verrouillageOfficiel,
  );
  if (pereiraOfficiel) {
    return {
      lignes: calculees,
      totalHt: TOTAUX_PEREIRA_NERVIEUX.totalHt,
      totalTva: TOTAUX_PEREIRA_NERVIEUX.totalTva,
      totalTtc: TOTAUX_PEREIRA_NERVIEUX.totalTtc,
    };
  }
  const brunelV5Solaire = calculees.some((l) => l.id === POSTE_SOLAIRE_V5_ID);
  if (brunelV5Solaire) {
    return {
      lignes: calculees,
      totalHt: TOTAUX_BRUNEL_V5_CUMUL.totalHt,
      totalTva: TOTAUX_BRUNEL_V5_CUMUL.totalTva,
      totalTtc: TOTAUX_BRUNEL_V5_CUMUL.totalTtc,
    };
  }
  const brunelV4 = calculees.some(
    (l) =>
      (l.id === "v3-poste-4-porte-entree" && l.totalHt === 1950 && l.verrouillageOfficiel) ||
      l.versionOfficielle === BRUNEL_V4_VERSION,
  );
  if (brunelV4) {
    return {
      lignes: calculees,
      totalHt: TOTAUX_BRUNEL_V4.totalHt,
      totalTva: TOTAUX_BRUNEL_V4.totalTva,
      totalTtc: TOTAUX_BRUNEL_V4.totalTtc,
    };
  }
  const brunelOfficiel = calculees.some(
    (l) => l.id === "v3-poste-1-combles" && l.verrouillageOfficiel,
  );
  if (brunelOfficiel) {
    return {
      lignes: calculees,
      totalHt: TOTAUX_BRUNEL_V3.totalHt,
      totalTva: TOTAUX_BRUNEL_V3.totalTva,
      totalTtc: TOTAUX_BRUNEL_V3.totalTtc,
    };
  }
  const cloisonOfficiel = calculees.some(
    (l) => String(l.id || "").startsWith("cloison-sdb-lot-") && l.verrouillageOfficiel,
  );
  if (cloisonOfficiel) {
    return {
      lignes: calculees,
      totalHt: TOTAUX_CLOISON_SDB.totalHt,
      totalTva: TOTAUX_CLOISON_SDB.totalTva,
      totalTtc: TOTAUX_CLOISON_SDB.totalTtc,
    };
  }
  const totalHt = round2(calculees.reduce((sum, l) => sum + (l.totalHt || 0), 0));
  const totalTva = round2(calculees.reduce((sum, l) => sum + (l.totalTva || 0), 0));
  const totalTtc = round2(calculees.reduce((sum, l) => sum + (l.totalTtc || 0), 0));
  return { lignes: calculees, totalHt, totalTva, totalTtc };
}

function typeGesteLigne(ligne) {
  const texte = `${ligne.familleId} ${ligne.categorieId} ${ligne.sousCategorieId} ${ligne.nom}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/comble|rampant/.test(texte)) return "combles";
  if (/\bite\b|exterieur/.test(texte) && /isol|mur|ite/.test(texte)) return "ite";
  if (/\biti\b|interieur/.test(texte) && /isol|mur|iti/.test(texte)) return "iti";
  if (/plancher/.test(texte)) return "planchers";
  if (/fenetre|menuiser|vitrage/.test(texte)) return "fenetres";
  if (/vmc|ventil/.test(texte)) return "vmc";
  if (/pac|pompe/.test(texte)) return "pac";
  if (/ballon|ecs|thermodynamique/.test(texte)) return "ballon";
  return null;
}

function profilOuNull(id) {
  return PROFILS_ANAH.find((p) => p.id === id) || null;
}

export function calculerAidesIndicatives(edition) {
  const totaux = totauxTravaux(edition?.travaux);
  const profil = profilOuNull(edition?.aides?.profil);
  const parcours = edition?.aides?.parcours === "geste" ? "geste" : "parcours";
  const gainClasses = Number(edition?.aides?.gainClasses) >= 3 ? 3 : 2;
  const region = REGIONS_AIDES_LOCALES.find((r) => r.id === edition?.aides?.region) || null;
  const overrides = edition?.aides?.overrides || {};

  if (
    (edition?.aides?.verrouillageOfficiel || edition?.verrouillageOfficiel) &&
    edition?.devisOfficiel?.numero === BRUNEL_FINAL_NUMERO
  ) {
    const totalHt = totaux.totalHt || TOTAUX_BRUNEL_V3.totalHt;
    const mpr = round2(overrides.mpr ?? AIDES_BRUNEL_V3.mpr);
    const cee = round2(overrides.cee ?? AIDES_BRUNEL_V3.cee);
    const locales = round2(overrides.locales ?? AIDES_BRUNEL_V3.locales);
    const mar = round2(overrides.mar ?? AIDES_BRUNEL_V3.mar);
    const coupDePouce = round2(overrides.coupDePouce ?? 0);
    const totalAides = round2(mpr + cee + locales + mar + coupDePouce);
    return {
      calculable: true,
      profil: profil?.id || "jaune",
      parcours,
      mention: MENTION_AIDES_DEVIS_V3,
      mentionCee: "Prime CEE Chauffage du contrat officiel FINAL (indicatif, instruction ANAH / obligés).",
      nonCumulCeeParcours: false,
      verrouillageOfficiel: true,
      clauseIndivision: CLAUSE_INDIVISION_COUBLE_815,
      libelleMpr: AIDES_BRUNEL_V3.libelleMpr,
      libelleCee: AIDES_BRUNEL_V3.libelleCee,
      libelleLocales: AIDES_BRUNEL_V3.libelleLocales,
      libelleMar: AIDES_BRUNEL_V3.libelleMar,
      totalHt,
      totalTtc: totaux.totalTtc || TOTAUX_BRUNEL_V3.totalTtc,
      mpr,
      cee,
      locales,
      mar,
      coupDePouce,
      totalAides,
      ecrete: false,
      plafondEcretement: round2((totaux.totalTtc || TOTAUX_BRUNEL_V3.totalTtc) * 0.8),
      lignesDetail: [
        { id: "mpr-v3", libelle: AIDES_BRUNEL_V3.libelleMpr, montant: mpr },
        { id: "cee-v3", libelle: AIDES_BRUNEL_V3.libelleCee, montant: cee },
        { id: "region-v3", libelle: AIDES_BRUNEL_V3.libelleLocales, montant: locales },
        { id: "mar-v3", libelle: AIDES_BRUNEL_V3.libelleMar, montant: mar },
      ],
    };
  }

  if (
    (edition?.aides?.verrouillageOfficiel || edition?.verrouillageOfficiel) &&
    edition?.devisOfficiel?.numero === PEREIRA_NERVIEUX_NUMERO
  ) {
    const a = AIDES_PEREIRA_VIOLET;
    return {
      calculable: true,
      profil: "violet",
      parcours,
      mention: MENTION_AIDES_PEREIRA_NERVIEUX,
      mentionCee: a.libelleCee,
      nonCumulCeeParcours: false,
      verrouillageOfficiel: true,
      libelleMpr: a.libelleMpr,
      libelleCee: a.libelleCee,
      totalHt: totaux.totalHt || TOTAUX_PEREIRA_NERVIEUX.totalHt,
      totalTtc: totaux.totalTtc || TOTAUX_PEREIRA_NERVIEUX.totalTtc,
      travauxEligiblesHt: a.travauxEligiblesHt,
      mpr: a.mpr,
      cee: a.cee,
      locales: 0,
      mar: a.mar,
      coupDePouce: a.coupDePouce,
      totalAides: a.totalAides,
      ecrete: false,
      plafondEcretement: a.plafondEcretement,
      lignesDetail: [
        {
          id: "mpr-pereira",
          libelle: a.libelleMpr,
          montant: a.mpr,
        },
        {
          id: "cee-pereira",
          libelle: a.libelleCee,
          montant: a.cee,
        },
        {
          id: "mar-pereira",
          libelle: "Prestation MAR remboursée (80 % × plafond 2 000 €)",
          montant: a.mar,
        },
      ],
    };
  }

  const base = {
    calculable: Boolean(profil),
    profil: profil?.id || "",
    parcours,
    mention: MENTION_AIDES_EDITION,
    totalHt: totaux.totalHt,
    totalTtc: totaux.totalTtc,
    mpr: 0,
    cee: 0,
    locales: 0,
    coupDePouce: 0,
    totalAides: 0,
    ecrete: false,
    lignesDetail: [],
  };

  if (!profil || totaux.totalHt <= 0) {
    return { ...base, calculable: Boolean(profil) && totaux.totalHt > 0 };
  }

  let mpr = 0;
  if (parcours === "parcours") {
    const plafondHt = gainClasses >= 3 ? 40000 : 30000;
    const eligible = Math.min(totaux.totalHt, plafondHt);
    const max = gainClasses >= 3 ? profil.max3 : profil.max2;
    mpr = round2(Math.min(eligible * profil.tauxParcours, max));
    base.lignesDetail.push({
      id: "mpr-parcours",
      libelle: `MaPrimeRénov’ Parcours (${profil.label})`,
      montant: mpr,
    });
  } else {
    for (const ligne of totaux.lignes) {
      const geste = typeGesteLigne(ligne);
      if (!geste || !GESTES_MPR[geste]) continue;
      const bar = GESTES_MPR[geste];
      const taux = bar[profil.id] ?? 0;
      let montant = 0;
      if (bar.forfait) montant = taux;
      else if (bar.parM2) {
        const qte = bar.surfaceMax ? Math.min(ligne.quantite, bar.surfaceMax) : ligne.quantite;
        montant = round2(qte * taux);
      } else {
        montant = round2(ligne.quantite * taux);
      }
      if (montant > 0) {
        mpr = round2(mpr + montant);
        base.lignesDetail.push({
          id: `mpr-${geste}-${ligne.id}`,
          libelle: `MPR geste — ${ligne.nom}`,
          montant,
        });
      }
    }
  }

  /** CEE classiques + Coup de pouce : uniquement en geste par geste. En Parcours Accompagné, valorisation CEE déjà dans le taux MPR Anah. */
  let cee = 0;
  let coupDePouce = 0;
  if (parcours === "geste") {
    for (const ligne of totaux.lignes) {
      const geste = typeGesteLigne(ligne);
      if (geste === "ite" || geste === "iti") continue;
      if (geste === "combles" || geste === "planchers") cee = round2(cee + ligne.quantite * 15);
      else if (geste === "fenetres") cee = round2(cee + ligne.quantite * 65);
      else if (geste === "pac") cee = round2(cee + 3500);
      else if (geste === "vmc") cee = round2(cee + 500);
      else if (geste === "ballon") cee = round2(cee + 125);
    }
    coupDePouce = gainClasses >= 3 ? 5800 : 4700;
  }

  const mprRetenu = overrides.mpr != null ? Number(overrides.mpr) : mpr;
  const ceeRetenu = parcours === "parcours" ? 0 : overrides.cee != null ? Number(overrides.cee) : cee;
  const cdpRetenu = parcours === "parcours" ? 0 : overrides.coupDePouce != null ? Number(overrides.coupDePouce) : coupDePouce;
  const localesRetenu = overrides.locales != null ? Number(overrides.locales) : 0;

  if (parcours === "parcours") {
    base.lignesDetail.push({
      id: "cee",
      libelle: "Primes CEE estimées",
      montant: 0,
      mention: MENTION_CEE_INTEGREE_PARCOURS,
    });
    base.lignesDetail.push({
      id: "coup-de-pouce",
      libelle: "Coup de pouce",
      montant: 0,
      mention: MENTION_CEE_INTEGREE_PARCOURS,
    });
  } else {
    if (ceeRetenu > 0) {
      base.lignesDetail.push({ id: "cee", libelle: "Primes CEE estimées (fourchette médiane)", montant: round2(ceeRetenu) });
    }
    if (cdpRetenu > 0) {
      base.lignesDetail.push({
        id: "coup-de-pouce",
        libelle: `Coup de pouce (${gainClasses}+ classes)`,
        montant: round2(cdpRetenu),
      });
    }
  }
  if (localesRetenu > 0) {
    base.lignesDetail.push({
      id: "locales",
      libelle: region ? `Aides locales ${region.label} (saisie manuelle)` : "Aides locales (saisie manuelle)",
      montant: round2(localesRetenu),
    });
  }

  let totalAides = round2(
    Math.max(0, mprRetenu) + Math.max(0, ceeRetenu) + Math.max(0, localesRetenu) + Math.max(0, cdpRetenu),
  );
  const plafondEcretement = round2(totaux.totalTtc * profil.ecretement);
  let ecrete = false;
  if (totalAides > plafondEcretement) {
    totalAides = plafondEcretement;
    ecrete = true;
  }
  if (totalAides > totaux.totalTtc) {
    totalAides = totaux.totalTtc;
    ecrete = true;
  }

  return {
    ...base,
    calculable: true,
    mpr: round2(Math.max(0, mprRetenu)),
    cee: round2(Math.max(0, ceeRetenu)),
    locales: round2(Math.max(0, localesRetenu)),
    coupDePouce: round2(Math.max(0, cdpRetenu)),
    totalAides,
    ecrete,
    plafondEcretement,
    mentionCee: parcours === "parcours" ? MENTION_CEE_INTEGREE_PARCOURS : null,
    nonCumulCeeParcours: parcours === "parcours",
  };
}

export function mensualiteTauxZero(montant, dureeAns) {
  const m = Math.max(0, Number(montant) || 0);
  const d = Number(dureeAns);
  if (!Number.isFinite(d) || d <= 0) return 0;
  return round2(m / (d * 12));
}

export function simulationsEcoPtzEtat(montant) {
  const plafonne = round2(Math.min(ECO_PTZ_MAX, Math.max(ECO_PTZ_MIN, Number(montant) || 0)));
  return {
    montant: plafonne,
    mensualite15: mensualiteTauxZero(plafonne, 15),
    mensualite20: mensualiteTauxZero(plafonne, 20),
  };
}

export function calculerFinancement(edition) {
  const totaux = totauxTravaux(edition?.travaux);
  const aides = calculerAidesIndicatives(edition);
  const resteACharge = round2(Math.max(0, totaux.totalTtc - (aides.totalAides || 0)));
  let ecoPtzMontant = nombreOuNull(edition?.financement?.ecoPtzMontant) ?? 0;
  ecoPtzMontant = round2(Math.min(ECO_PTZ_MAX, Math.max(ECO_PTZ_MIN, ecoPtzMontant)));
  let duree = Math.round(nombreOuNull(edition?.financement?.ecoPtzDuree) ?? 15);
  duree = Math.min(ECO_PTZ_DUREE_MAX, Math.max(ECO_PTZ_DUREE_MIN, duree));
  const mensualite = mensualiteTauxZero(ecoPtzMontant, duree);
  const simu = simulationsEcoPtzEtat(ecoPtzMontant);
  const apportSaisi = nombreOuNull(edition?.financement?.apportPersonnel);
  const apportCalcule = round2(Math.max(0, resteACharge - ecoPtzMontant));
  const apportPersonnel = apportSaisi != null ? round2(Math.max(0, apportSaisi)) : apportCalcule;
  const verrouBrunel =
    Boolean(edition?.aides?.verrouillageOfficiel || edition?.verrouillageOfficiel) &&
    edition?.devisOfficiel?.numero === BRUNEL_FINAL_NUMERO;
  const verrouBrunelV5 = verrouBrunel && (estOffreAutonomieBrunel(edition) || edition?.version === BRUNEL_V5_VERSION);
  const verrouBrunelV4 =
    verrouBrunel &&
    !verrouBrunelV5 &&
    (edition?.version === BRUNEL_V4_VERSION || edition?.devisOfficiel?.version === BRUNEL_V4_VERSION);
  const financementBrunel = verrouBrunelV5
    ? FINANCEMENT_BRUNEL_V5_AUTONOMIE
    : verrouBrunelV4
      ? FINANCEMENT_BRUNEL_V4
      : FINANCEMENT_BRUNEL_V3;
  const verrouPereira =
    Boolean(edition?.aides?.verrouillageOfficiel || edition?.verrouillageOfficiel) &&
    edition?.devisOfficiel?.numero === PEREIRA_NERVIEUX_NUMERO;
  const verrouCloison =
    Boolean(edition?.aides?.verrouillageOfficiel || edition?.verrouillageOfficiel) &&
    edition?.devisOfficiel?.numero === CLOISON_SDB_CONTRAT_NUMERO;
  const verrouOfficiel = verrouBrunel || verrouPereira || verrouCloison;
  const resteAChargeLive = verrouCloison ? FINANCEMENT_CLOISON_SDB.resteACharge : resteACharge;
  const ecoPtzLive = verrouCloison ? 0 : verrouOfficiel ? resteAChargeLive : ecoPtzMontant;
  const dureeLive = verrouCloison ? 15 : verrouOfficiel ? 20 : duree;
  const mensualiteLive = verrouBrunel
    ? financementBrunel.mensualiteExacte
    : mensualiteTauxZero(ecoPtzLive, dureeLive);
  const simuLive = simulationsEcoPtzEtat(ecoPtzLive);
  const economies = verrouBrunel ? financementBrunel.economiesMensuelles : null;

  return {
    totalHt: totaux.totalHt,
    totalTtc: totaux.totalTtc,
    totalAides: verrouCloison ? 0 : aides.totalAides,
    resteACharge: resteAChargeLive,
    ecoPtzMontant: ecoPtzLive,
    ecoPtzDuree: dureeLive,
    mensualite: mensualiteLive,
    mensualite15: simuLive.mensualite15,
    mensualite20: verrouBrunel ? financementBrunel.mensualiteExacte : simuLive.mensualite20,
    apportPersonnel: verrouCloison ? FINANCEMENT_CLOISON_SDB.resteACharge : verrouOfficiel ? 0 : apportPersonnel,
    apportCalcule: verrouCloison ? FINANCEMENT_CLOISON_SDB.resteACharge : verrouOfficiel ? 0 : apportCalcule,
    mention: MENTION_FINANCEMENT_EDITION,
    canalEcoPtz: CANAL_ECO_PTZ_ETAT,
    canalPretTravaux: CANAL_PRET_TRAVAUX_FABIEN,
    acompte: verrouBrunel
      ? financementBrunel.acompte
      : verrouPereira
        ? FINANCEMENT_PEREIRA_CG.acompte
        : verrouCloison
          ? FINANCEMENT_CLOISON_SDB.acompte
          : round2(totaux.totalTtc * 0.3),
    intermediaire: verrouBrunel
      ? financementBrunel.intermediaire
      : verrouPereira
        ? FINANCEMENT_PEREIRA_CG.intermediaire
        : verrouCloison
          ? FINANCEMENT_CLOISON_SDB.intermediaire
          : round2(totaux.totalTtc * 0.4),
    solde: verrouBrunel
      ? financementBrunel.solde
      : verrouPereira
        ? FINANCEMENT_PEREIRA_CG.solde
        : verrouCloison
          ? FINANCEMENT_CLOISON_SDB.solde
          : round2(totaux.totalTtc * 0.3),
    economiesMensuelles: economies,
    bilanNetMensuel: verrouBrunel
      ? financementBrunel.bilanNetMensuel
      : economies == null
        ? null
        : round2(economies - mensualiteLive),
    verrouillageOfficiel: verrouOfficiel,
  };
}

export function extraireRecetteCoordinationHt(travaux) {
  const lignes = Array.isArray(travaux) ? travaux : [];
  const ligne = lignes.find(
    (item) =>
      item?.id === "v3-poste-8-coordination" ||
      item?.id === "v3-poste-6-coordination" ||
      item?.id === "pereira-nvx-poste-6-contractant-general" ||
      item?.id === "pereira-nvx-poste-7-contractant-general" ||
      item?.id === "pereira-nvx-poste-8-contractant-general" ||
      /coordination|contractant g/i.test(String(item?.nom || "")),
  );
  if (!ligne) return 0;
  if (nombreOuNull(ligne.totalHt) != null) return round2(ligne.totalHt);
  const qte = nombreOuNull(ligne.quantite) ?? 1;
  const pu = nombreOuNull(ligne.puHt) ?? 0;
  return round2(qte * pu);
}

export function coutClyveEffectif(finances) {
  const saisi = nombreOuNull(finances?.coutClyveHt);
  if (saisi == null || saisi === HONORAIRES_HUB_ADMIN_HT_ANCIEN) return COUT_CLYVE_HT_DEFAUT;
  return Math.max(0, round2(saisi));
}

export function calculerFinancesInternes(edition, role = ROLE_ADMIN) {
  const totaux = totauxTravaux(edition?.travaux);
  const taux = nombreOuNull(edition?.finances?.tauxCommission) ?? COMMISSION_HT_DEFAUT;
  const commission = totaux.totalHt > 0 ? round2(totaux.totalHt * (taux / 100)) : 0;
  const coutMaterielHt = nombreOuNull(edition?.finances?.coutMaterielHt);
  const coutPoseRgeHt = nombreOuNull(edition?.finances?.coutPoseRgeHt);
  const coutClyveHt = coutClyveEffectif(edition?.finances);
  const recetteCoordinationHt = extraireRecetteCoordinationHt(totaux.lignes);
  const margeNetteCoordination = recetteCoordinationHt > 0 ? round2(recetteCoordinationHt - coutClyveHt) : null;
  const sousTraitance = calculerMargesSousTraitance(totaux.lignes);
  const coutRevient =
    coutMaterielHt == null && coutPoseRgeHt == null
      ? sousTraitance.applicable
        ? sousTraitance.coutRevientHt
        : null
      : round2((coutMaterielHt ?? 0) + (coutPoseRgeHt ?? 0));
  const margeBrute = coutRevient == null ? null : round2(totaux.totalHt - coutRevient);
  const margeNette = margeBrute == null ? null : round2(margeBrute - commission - coutClyveHt);

  if (role !== ROLE_ADMIN) {
    return {
      visibleComplet: false,
      commission,
      taux,
      venteHt: totaux.totalHt,
      coutMaterielHt: null,
      coutPoseRgeHt: null,
      coutClyveHt: null,
      recetteCoordinationHt: null,
      margeNetteCoordination: null,
      coutRevient: null,
      margeBrute: null,
      margeNette: null,
      sousTraitance: null,
    };
  }

  return {
    visibleComplet: true,
    commission,
    taux,
    venteHt: totaux.totalHt,
    coutMaterielHt,
    coutPoseRgeHt,
    coutClyveHt,
    recetteCoordinationHt,
    margeNetteCoordination,
    coutRevient,
    margeBrute,
    margeNette,
    sousTraitance,
  };
}

export function sanitiserEditionPourRole(edition, role, { voirPiecesSensibles = false } = {}) {
  const copie = fusionnerEdition(editionVide(), edition);
  if (role !== ROLE_ADMIN) {
    copie.finances = {
      coutMaterielHt: null,
      coutPoseRgeHt: null,
      tauxCommission: COMMISSION_HT_DEFAUT,
      coutClyveHt: null,
    };
    copie.aides = {
      ...copie.aides,
      overrides: { mpr: null, cee: null, locales: null, coupDePouce: null },
    };
  }
  if (!voirPiecesSensibles) {
    for (const piece of PIECES_OBLIGATOIRES) {
      if (piece.fiscal) {
        copie.pieces[piece.id] = {
          ...copie.pieces[piece.id],
          nomFichier: copie.pieces[piece.id]?.statut === "manquante" ? "" : "Document sécurisé",
          documentId: null,
        };
      }
    }
  }
  return copie;
}

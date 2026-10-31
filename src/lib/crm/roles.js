/** Rôles CRM locaux (sélecteur hors production). Aucune table Supabase ajoutée. */

export const ROLE_ADMIN = "administrateur";
export const ROLE_COMMERCIAL = "commercial";
export const ROLE_PRESENTATION = "presentation_client";
export const ROLE_PARTENAIRE = "partenaire_apporteur";
export const ROLE_ASSOCIATION = "raphaelle";

export const ROLE_STORAGE_KEY = "energia-crm-role";
export const TABLETTE_STORAGE_KEY = "energia-crm-tablette";
export const DEMO_STORAGE_KEY = "energia-crm-jeu-demo";

export const ROLES = [
  {
    id: ROLE_ADMIN,
    label: "Super-Admin (Sylvain)",
    hint: "Accès complet : Carte DPE, devis et marges, artisans, messagerie. Les autres profils n'y entrent pas.",
  },
  {
    id: ROLE_COMMERCIAL,
    label: "Commercial",
    hint: "CRM, pipeline, fiches. Voit uniquement sa commission 10 % HT — jamais la marge nette ENERGIA",
  },
  {
    id: ROLE_PRESENTATION,
    label: "Présentation client",
    hint: "Travaux, budget client, aides indicatives, financement",
  },
  {
    id: ROLE_PARTENAIRE,
    label: "Partenaire apporteur",
    hint: "Prospects et dossiers rattachés uniquement — aucune donnée financière interne (coûts, commissions ENERGIA, marge nette)",
  },
  {
    id: ROLE_ASSOCIATION,
    label: "RAPHAËLLE — Agent Association",
    hint: "Radar insalubrité et dossiers association uniquement — aucune donnée nominative, aucun accès commercial",
  },
];

export const PARTNER_ID_STORAGE_KEY = "energia-crm-partenaire-id";
export const COMMERCIAL_ID_STORAGE_KEY = "energia-crm-commercial-id";
export const COMMERCIAL_DAMIEN_ID = "commercial-damien";

/** Champs internes jamais exposés au commercial, au partenaire ni au client. */
export const CHAMPS_INTERDITS_HORS_ADMIN = [
  "coûts fournisseurs",
  "coûts matériel",
  "coûts de pose",
  "marge ENERGIA",
  "marge nette",
  "coût artisan",
  "coût Clyve",
  "commission partenaire",
  "commission Damien",
  "prix plancher",
];

export function estRoleValide(role) {
  return (
    role === ROLE_ADMIN ||
    role === ROLE_COMMERCIAL ||
    role === ROLE_PRESENTATION ||
    role === ROLE_PARTENAIRE ||
    role === ROLE_ASSOCIATION
  );
}

export function lireRoleStocke() {
  try {
    const value = sessionStorage.getItem(ROLE_STORAGE_KEY);
    if (value === ROLE_COMMERCIAL) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, ROLE_PRESENTATION);
      return ROLE_PRESENTATION;
    }
    return estRoleValide(value) ? value : ROLE_PRESENTATION;
  } catch {
    return ROLE_PRESENTATION;
  }
}

export function enregistrerRole(role) {
  if (!estRoleValide(role) || role === ROLE_COMMERCIAL) return;
  try {
    sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    /* ignore */
  }
}

export function lireFlag(key, fallback = false) {
  try {
    return sessionStorage.getItem(key) === "1" ? true : fallback;
  } catch {
    return fallback;
  }
}

export function enregistrerFlag(key, value) {
  try {
    sessionStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function estAdministrateurProprietaire(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirCoutsInternes(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirCentreControle(role) {
  return role === ROLE_ADMIN;
}

/** Catalogue métiers : admin (édition) et commercial (lecture, sans marges). */
export function peutVoirCatalogueMetiers(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL;
}

/** Book de vente Damien : admin, commercial et présentation client. */
export function peutVoirCatalogueCommercial(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL || role === ROLE_PRESENTATION;
}

/** Book Maison Martins : admin, commercial, présentation client et Catarina. */
export function peutVoirCatalogueMaisonMartins(role) {
  return (
    role === ROLE_ADMIN ||
    role === ROLE_COMMERCIAL ||
    role === ROLE_PRESENTATION ||
    role === ROLE_PARTENAIRE
  );
}

export function peutModifierCatalogueMetiers(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirCrmCommercial(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL;
}

/** Carte DPE et prospection territoriale : Super-Admin uniquement. */
export function peutVoirDpeMapper(role) {
  return estAdministrateurProprietaire(role);
}

/** Devis et marges réelles : Super-Admin uniquement. */
export function peutVoirDevisEtMarges(role) {
  return estAdministrateurProprietaire(role);
}

/** Artisans RGE et sous-traitance : Super-Admin uniquement. */
export function peutVoirArtisansSousTraitance(role) {
  return estAdministrateurProprietaire(role);
}

/** Messagerie Resend : Super-Admin uniquement. */
export function peutVoirMessagerie(role) {
  return estAdministrateurProprietaire(role);
}

/** Le profil commercial Damien et le mode tablette ne sont plus des accès valides. */
export function purgerAccesDamien() {
  try {
    const commercial = sessionStorage.getItem(COMMERCIAL_ID_STORAGE_KEY);
    if (!commercial || commercial === COMMERCIAL_DAMIEN_ID) {
      sessionStorage.removeItem(COMMERCIAL_ID_STORAGE_KEY);
    }
    sessionStorage.removeItem(TABLETTE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function estAgentAssociation(role) {
  return role === ROLE_ASSOCIATION;
}

/** Radar insalubrité : administrateur et RAPHAËLLE uniquement. */
export function peutVoirRadarInsalubrite(role) {
  return role === ROLE_ADMIN || role === ROLE_ASSOCIATION;
}

export function lirePartenaireIdStocke() {
  try {
    return sessionStorage.getItem(PARTNER_ID_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function enregistrerPartenaireId(partenaireId) {
  try {
    const value = String(partenaireId || "").trim();
    if (value) sessionStorage.setItem(PARTNER_ID_STORAGE_KEY, value);
    else sessionStorage.removeItem(PARTNER_ID_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function estPartenaireApporteur(role) {
  return role === ROLE_PARTENAIRE;
}

export function peutVoirPipelinePartenaire(role) {
  return peutVoirCrmCommercial(role) || estPartenaireApporteur(role);
}

export function estPresentationClient(role) {
  return role === ROLE_PRESENTATION;
}

/** Onglet Finances : admin (tout) et commercial (sa commission uniquement). Partenaire et client : non. */
export function peutVoirOngletFinances(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL;
}

/** Édition opérationnelle des 6 modules CRM (hors présentation client). */
export function peutEditerDossierCrm(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL || role === ROLE_PARTENAIRE;
}

/** Écrasement manuel d’un montant d’aide : administrateur uniquement. */
export function peutEcraserAidesIndicatives(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirMargeNette(role) {
  return role === ROLE_ADMIN;
}

/** Création manuelle d’un projet depuis l’onglet Projets. */
export function peutCreerProjetManuel(role) {
  return role === ROLE_ADMIN;
}

/** RFR et pièces fiscales : administrateur uniquement. */
export function peutVoirRfr(role) {
  return role === ROLE_ADMIN;
}

/** Pièces d’identité, avis d’impôt, notaire : administrateur uniquement. */
export function peutVoirDocumentsSensibles(role) {
  return role === ROLE_ADMIN;
}

/** Validation humaine et déblocage d’un document final. */
export function peutValiderDossier(role) {
  return role === ROLE_ADMIN;
}

/** Import de documents dans un dossier : administrateur uniquement. */
export function peutImporterDocument(role) {
  return role === ROLE_ADMIN;
}

/** Alertes d’identité (naissance) et références documentaires internes. */
export function peutVoirAlertesIdentite(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirReferencesDocumentaires(role) {
  return role === ROLE_ADMIN;
}

export function estIdentifiantDamien(commercialId) {
  return String(commercialId || "").trim() === COMMERCIAL_DAMIEN_ID;
}

export function lireCommercialIdStocke() {
  try {
    const value = sessionStorage.getItem(COMMERCIAL_ID_STORAGE_KEY) || "";
    if (estIdentifiantDamien(value)) {
      sessionStorage.removeItem(COMMERCIAL_ID_STORAGE_KEY);
      return "";
    }
    return value;
  } catch {
    return "";
  }
}

export function enregistrerCommercialId(commercialId) {
  try {
    const value = String(commercialId || "").trim();
    if (!value || estIdentifiantDamien(value)) {
      sessionStorage.removeItem(COMMERCIAL_ID_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(COMMERCIAL_ID_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

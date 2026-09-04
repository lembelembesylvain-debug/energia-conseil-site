/** Rôles CRM locaux (sélecteur hors production). Aucune table Supabase ajoutée. */

export const ROLE_ADMIN = "administrateur";
export const ROLE_COMMERCIAL = "commercial";
export const ROLE_PRESENTATION = "presentation_client";

export const ROLE_STORAGE_KEY = "energia-crm-role";
export const TABLETTE_STORAGE_KEY = "energia-crm-tablette";
export const DEMO_STORAGE_KEY = "energia-crm-jeu-demo";

export const ROLES = [
  {
    id: ROLE_ADMIN,
    label: "Administrateur propriétaire",
    hint: "Accès complet, dont Centre de Contrôle Interne",
  },
  {
    id: ROLE_COMMERCIAL,
    label: "Commercial",
    hint: "CRM, pipeline, fiches commerciales, présentation client",
  },
  {
    id: ROLE_PRESENTATION,
    label: "Présentation client",
    hint: "Travaux, budget client, aides indicatives, financement",
  },
];

/** Champs internes jamais exposés au commercial ni au client. */
export const CHAMPS_INTERDITS_HORS_ADMIN = [
  "coûts fournisseurs",
  "coûts matériel",
  "coûts de pose",
  "marge ENERGIA",
  "coût Clyve",
  "commission Damien",
  "prix plancher",
];

export function estRoleValide(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL || role === ROLE_PRESENTATION;
}

export function lireRoleStocke() {
  try {
    const value = sessionStorage.getItem(ROLE_STORAGE_KEY);
    return estRoleValide(value) ? value : ROLE_COMMERCIAL;
  } catch {
    return ROLE_COMMERCIAL;
  }
}

export function enregistrerRole(role) {
  if (!estRoleValide(role)) return;
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

export function peutVoirCoutsInternes(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirCentreControle(role) {
  return role === ROLE_ADMIN;
}

export function peutVoirCrmCommercial(role) {
  return role === ROLE_ADMIN || role === ROLE_COMMERCIAL;
}

export function estPresentationClient(role) {
  return role === ROLE_PRESENTATION;
}

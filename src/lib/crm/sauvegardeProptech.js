/**
 * Sauvegarde automatique de l’état PropTech (édition + sniper + tunnel).
 * localStorage toujours ; fichier JSON dans data/sauvegardes/ via /api/sauvegarde-proptech en local.
 * Les marges / coûts internes ne sont jamais persistés hors rôle administrateur.
 */

import { ROLE_ADMIN } from "./roles.js";
import { sanitiserEditionPourRole } from "./editionDossier.js";

export const SAUVEGARDE_STORAGE_KEY = "energia-crm-proptech-sauvegarde-v1";
export const SNIPER_SESSION_KEY = "energia-proptech-sniper-dernier";

export function memoriserSniperSession(payload) {
  if (typeof sessionStorage === "undefined" || !payload) return;
  try {
    sessionStorage.setItem(SNIPER_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

export function lireSniperSession() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SNIPER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function snapshotProptech({ dossierId, edition, role, sniper, tunnel } = {}) {
  const roleSafe = String(role || "commercial");
  const editionSafe = sanitiserEditionPourRole(edition, roleSafe, { voirPiecesSensibles: false });
  if (roleSafe !== ROLE_ADMIN) {
    editionSafe.finances = {
      coutMaterielHt: null,
      coutPoseRgeHt: null,
      tauxCommission: null,
      coutClyveHt: null,
    };
  }

  const tunnelSafe =
    tunnel && typeof tunnel === "object"
      ? {
          surfaces: tunnel.surfaces,
          totaux: tunnel.totaux,
          aides: tunnel.aides
            ? {
                profil: tunnel.aides.profil,
                parcours: tunnel.aides.parcours,
                mpr: tunnel.aides.mpr,
                cee: tunnel.aides.cee,
                locales: tunnel.aides.locales,
                mar: tunnel.aides.mar || 0,
                coupDePouce: tunnel.aides.coupDePouce,
                totalAides: tunnel.aides.totalAides,
                mention: tunnel.aides.mention,
                mentionCee: tunnel.aides.mentionCee || null,
                nonCumulCeeParcours: tunnel.aides.nonCumulCeeParcours === true,
                verrouillageOfficiel: tunnel.aides.verrouillageOfficiel === true,
              }
            : null,
          resteACharge: tunnel.resteACharge,
          ecoPtzAuto: tunnel.ecoPtzAuto,
          plusValue: tunnel.plusValue,
          roi: tunnel.roi,
        }
      : null;

  return {
    version: 1,
    date: new Date().toISOString(),
    dossierId: String(dossierId || "").trim(),
    role: roleSafe,
    edition: editionSafe,
    sniper: sniper || null,
    tunnel: tunnelSafe,
    controles: {
      financesInternesIncluses: roleSafe === ROLE_ADMIN,
      mention:
        "Onglet Finances et marges masqué pour le mode commercial / partenaire. Snapshot sans coûts d’achat ni marge nette hors administrateur.",
    },
  };
}

export function enregistrerSnapshotLocal(snapshot) {
  if (typeof localStorage === "undefined" || !snapshot?.dossierId) return snapshot;
  try {
    const raw = localStorage.getItem(SAUVEGARDE_STORAGE_KEY);
    const tous = raw ? JSON.parse(raw) : {};
    tous[snapshot.dossierId] = snapshot;
    localStorage.setItem(SAUVEGARDE_STORAGE_KEY, JSON.stringify(tous));
  } catch {
    /* quota */
  }
  return snapshot;
}

export async function pousserSnapshotFichier(snapshot, { signal } = {}) {
  if (!snapshot) return { ok: false, stockeFichier: false };
  try {
    const reponse = await fetch("/api/sauvegarde-proptech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
      signal,
    });
    if (!reponse.ok) {
      return { ok: false, stockeFichier: false, status: reponse.status };
    }
    return reponse.json();
  } catch {
    return { ok: false, stockeFichier: false };
  }
}

export async function sauvegarderEtatProptech(params) {
  const snapshot = snapshotProptech(params);
  enregistrerSnapshotLocal(snapshot);
  const fichier = await pousserSnapshotFichier(snapshot);
  return { snapshot, fichier };
}

/**
 * Notifications CRM locales pour les leads partenaires.
 * Ne remplace pas le moteur Quantum. Aucune liste de prospects n’est exposée publiquement.
 */

import { estPartenaireApporteur } from "./roles.js";

export const STORAGE_NOTIFS_PARTENAIRE = "energia-crm-notifs-partenaire-v1";

function lireBrut() {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFS_PARTENAIRE);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ecrireBrut(notifs) {
  localStorage.setItem(STORAGE_NOTIFS_PARTENAIRE, JSON.stringify(notifs.slice(0, 200)));
}

export function notifierLeadPartenaire(lead, partner) {
  if (!lead || !partner) return null;
  const partenaire_id = partner.crmPartnerId || partner.id || lead.partenaire_id;
  const notif = {
    id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`,
    type: "lead_diagnostic",
    partenaire_id,
    source: lead.source || partner.sourceLabel || "",
    titre: "Nouveau prospect pré-qualifié",
    message: `${lead.prenom} ${lead.nom} — ${lead.objectif_projet || "projet"} · DPE ${lead.dpe || "n.c."}`,
    lead_id: lead.id,
    created_at: new Date().toISOString(),
    lue: false,
  };
  const notifs = lireBrut();
  notifs.unshift(notif);
  ecrireBrut(notifs);
  return notif;
}

export function lireNotificationsPourRole(role, partenaireId) {
  const toutes = lireBrut();
  if (estPartenaireApporteur(role)) {
    return toutes.filter((notif) => notif.partenaire_id === partenaireId);
  }
  return toutes;
}

export function marquerNotificationLue(id) {
  const notifs = lireBrut();
  const idx = notifs.findIndex((notif) => notif.id === id);
  if (idx < 0) return null;
  notifs[idx] = { ...notifs[idx], lue: true };
  ecrireBrut(notifs);
  return notifs[idx];
}

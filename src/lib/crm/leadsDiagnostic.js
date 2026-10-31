/**
 * Leads diagnostic pré-qualifié — Quantum MVP.
 * Source : Catarina / QR flyer. Isolation par partenaire_id.
 * Aucune donnée d’un autre partenaire n’est renvoyée au rôle partenaire.
 */

import { PARTENAIRE_CATARINA, SOURCE_QR_FLYER } from "./partenaires.js";
import { estPartenaireApporteur } from "./roles.js";
import {
  SOURCE_APPORTEUR_CATARINA,
  infererSourceApporteur,
} from "./operationnelCrm.js";

export const PARTENAIRE_ID_CATARINA = PARTENAIRE_CATARINA.id;
export const STORAGE_LEADS_DIAGNOSTIC = "energia-leads-diagnostic-v1";

export const STATUTS_LEAD = [
  "nouveau",
  "contact à effectuer",
  "contact effectué",
  "audit proposé",
  "audit commandé",
  "travaux en étude",
  "travaux réalisés",
  "clôturé",
];

export const TYPES_LOGEMENT = ["maison", "appartement"];
export const TYPES_CHAUFFAGE = ["gaz", "fioul", "électrique", "bois", "PAC", "autre"];
export const CLASSES_DPE = ["A", "B", "C", "D", "E", "F", "G", "inconnu"];
export const OBJECTIFS_PROJET = ["vendre", "acheter", "rénover"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_RE = /^(?:(?:\+33|0033)[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
const CP_RE = /^\d{5}$/;

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normaliserEmail(email) {
  return texte(email).toLowerCase();
}

export function normaliserTelephone(tel) {
  return texte(tel).replace(/[.\s-]/g, "");
}

export function validerLeadDiagnostic(brut) {
  const erreurs = {};
  const prenom = texte(brut.prenom);
  const nom = texte(brut.nom);
  const email = normaliserEmail(brut.email);
  const telephone = texte(brut.telephone);
  const code_postal = texte(brut.code_postal);
  const annee_construction = Number(brut.annee_construction);
  const surface_habitable = Number(brut.surface_habitable);
  const type_logement = texte(brut.type_logement);
  const type_chauffage = texte(brut.type_chauffage);
  const dpe = texte(brut.dpe);
  const objectif_projet = texte(brut.objectif_projet);
  const consentement_contact = brut.consentement_contact === true || brut.consentement_contact === "true";
  const consentement_email = brut.consentement_email === true || brut.consentement_email === "true";

  if (prenom.length < 2) erreurs.prenom = "Prénom requis.";
  if (nom.length < 2) erreurs.nom = "Nom requis.";
  if (!EMAIL_RE.test(email)) erreurs.email = "Email invalide.";
  const telNorm = normaliserTelephone(telephone);
  if (!TEL_RE.test(telephone) && !/^0[1-9]\d{8}$/.test(telNorm) && !/^\+33[1-9]\d{8}$/.test(telNorm)) {
    erreurs.telephone = "Téléphone invalide.";
  }
  if (!CP_RE.test(code_postal)) erreurs.code_postal = "Code postal à 5 chiffres.";
  if (!Number.isInteger(annee_construction) || annee_construction < 1800 || annee_construction > 2026) {
    erreurs.annee_construction = "Année de construction invalide.";
  }
  if (!Number.isInteger(surface_habitable) || surface_habitable < 15 || surface_habitable > 800) {
    erreurs.surface_habitable = "Surface habitable invalide.";
  }
  if (!TYPES_LOGEMENT.includes(type_logement)) erreurs.type_logement = "Type de logement requis.";
  if (!TYPES_CHAUFFAGE.includes(type_chauffage)) erreurs.type_chauffage = "Type de chauffage requis.";
  if (!CLASSES_DPE.includes(dpe)) erreurs.dpe = "Classe DPE requise.";
  if (!OBJECTIFS_PROJET.includes(objectif_projet)) erreurs.objectif_projet = "Objectif requis.";
  if (!consentement_contact) erreurs.consentement_contact = "Le consentement de recontact est obligatoire.";

  const valeurs = {
    prenom,
    nom,
    email,
    telephone: normaliserTelephone(telephone),
    code_postal,
    annee_construction,
    surface_habitable,
    type_logement,
    type_chauffage,
    dpe,
    objectif_projet,
    consentement_contact,
    consentement_email,
  };

  return { ok: Object.keys(erreurs).length === 0, erreurs, valeurs };
}

/**
 * Score 0–100 indicatif. Ne produit aucun montant d’aides, d’économies ou de valeur.
 */
export function calculerPreQualification({ dpe, annee_construction, type_chauffage, objectif_projet, type_logement }) {
  let score = 20;

  const dpePts = { G: 32, F: 28, E: 20, D: 12, C: 6, B: 2, A: 0, inconnu: 14 };
  score += dpePts[dpe] ?? 10;

  if (annee_construction < 1975) score += 22;
  else if (annee_construction < 1990) score += 16;
  else if (annee_construction < 2005) score += 10;
  else if (annee_construction < 2012) score += 5;

  const heatPts = { fioul: 16, électrique: 14, gaz: 8, bois: 6, autre: 7, PAC: 3 };
  score += heatPts[type_chauffage] ?? 5;

  if (objectif_projet === "rénover") score += 8;
  else if (objectif_projet === "vendre") score += 6;
  else score += 4;

  if (type_logement === "maison") score += 2;

  score = Math.max(0, Math.min(100, score));

  const niveau = score >= 70 ? "élevé" : score >= 45 ? "moyen" : "à approfondir";

  const pointsAttention = [];
  if (dpe === "F" || dpe === "G") {
    pointsAttention.push("Le DPE déclaré (passoire énergétique) justifie une étude prioritaire de l’enveloppe.");
  } else if (dpe === "inconnu") {
    pointsAttention.push("Sans DPE connu, l’orientation reste large : un audit permettra de préciser les postes.");
  } else if (dpe === "E" || dpe === "D") {
    pointsAttention.push("La classe DPE déclarée suggère des gains possibles, à confirmer par un audit.");
  }
  if (annee_construction < 1975) {
    pointsAttention.push("Un bâti antérieur à 1975 présente souvent des déperditions élevées (isolation, menuiseries).");
  }
  if (type_chauffage === "fioul" || type_chauffage === "électrique") {
    pointsAttention.push("Le mode de chauffage déclaré est souvent coûteux : un dimensionnement post-isolation est recommandé.");
  }
  if (pointsAttention.length === 0) {
    pointsAttention.push("Le profil déclaré ne révèle pas d’alerte majeure, mais un audit reste nécessaire pour conclure.");
  }

  const travaux = ["Isolation des combles (si encore insuffisante)"];
  if (type_logement === "maison" || annee_construction < 2005) {
    travaux.push("Isolation des murs (ITI ou ITE selon le bâti)");
  }
  if (annee_construction < 2005 || ["E", "F", "G", "inconnu"].includes(dpe)) {
    travaux.push("Menuiseries et étanchéité à l’air");
  }
  travaux.push("Ventilation adaptée après isolation");
  if (type_chauffage !== "PAC") {
    travaux.push("Système de chauffage à étudier après isolation (jamais avant)");
  }

  return {
    score_prequalification: score,
    niveau_potentiel: niveau,
    points_attention: pointsAttention,
    travaux_possibles: travaux,
    message_confort:
      "Selon les éléments déclarés, des travaux bien ordonnés peuvent améliorer le confort et, le cas échéant, la valeur du bien. Aucun montant, aucune aide et aucune plus-value ne sont garantis.",
    disclaimer:
      "Résultats indicatifs établis à partir de vos déclarations. Ils ne constituent pas un diagnostic thermique, ni une mesure réelle, ni un devis.",
  };
}

function lireBrut() {
  try {
    const raw = localStorage.getItem(STORAGE_LEADS_DIAGNOSTIC);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ecrireBrut(leads) {
  localStorage.setItem(STORAGE_LEADS_DIAGNOSTIC, JSON.stringify(leads));
}

export function lireTousLesLeadsDiagnostic() {
  return lireBrut();
}

export function filtrerLeadsPartenaire(leads, partenaireId = PARTENAIRE_ID_CATARINA) {
  return (leads ?? []).filter((lead) => lead.partenaire_id === partenaireId);
}

export function lireLeadsPourRole(role, partenaireId = PARTENAIRE_ID_CATARINA) {
  const tous = lireTousLesLeadsDiagnostic();
  if (estPartenaireApporteur(role)) {
    return filtrerLeadsPartenaire(tous, partenaireId || PARTENAIRE_ID_CATARINA);
  }
  return tous;
}

export function enregistrerLeadDiagnostic(valeurs, extras = {}) {
  const now = new Date().toISOString();
  const prequal = calculerPreQualification(valeurs);
  const partenaire_id = extras.partenaire_id || PARTENAIRE_ID_CATARINA;
  const source = extras.source || SOURCE_QR_FLYER;
  const sourceApporteur =
    extras.sourceApporteur ||
    infererSourceApporteur({
      apporteurId: extras.apporteurId,
      partenaireId: partenaire_id,
      source,
    });
  const assignee = extras.assignee || PARTENAIRE_CATARINA.nom;
  const email_norm = normaliserEmail(valeurs.email);
  const leads = lireBrut();
  const idx = leads.findIndex((lead) => lead.email_norm === email_norm && lead.partenaire_id === partenaire_id);

  const base = idx >= 0 ? leads[idx] : null;
  const record = {
    id: base?.id || (crypto.randomUUID ? crypto.randomUUID() : `lead-${Date.now()}`),
    ...valeurs,
    email_norm,
    source,
    sourceApporteur: sourceApporteur || SOURCE_APPORTEUR_CATARINA,
    partenaire_id,
    assignee,
    consentement_contact: true,
    consentement_contact_at: base?.consentement_contact_at || now,
    consentement_email: Boolean(valeurs.consentement_email),
    statut_lead: extras.statut_lead || base?.statut_lead || "nouveau",
    date_transmission: now,
    created_at: base?.created_at || now,
    updated_at: now,
    ...prequal,
  };

  if (idx >= 0) leads[idx] = record;
  else leads.unshift(record);
  ecrireBrut(leads);
  return record;
}

export function mettreAJourStatutLead(id, statut_lead, role, partenaireId = PARTENAIRE_ID_CATARINA) {
  if (!STATUTS_LEAD.includes(statut_lead)) return null;
  const leads = lireBrut();
  const idx = leads.findIndex((lead) => lead.id === id);
  if (idx < 0) return null;
  if (estPartenaireApporteur(role) && leads[idx].partenaire_id !== (partenaireId || PARTENAIRE_ID_CATARINA)) {
    return null;
  }
  leads[idx] = { ...leads[idx], statut_lead, updated_at: new Date().toISOString() };
  ecrireBrut(leads);
  return leads[idx];
}

export async function transmettreLeadServeur(record) {
  try {
    const res = await fetch("/api/diagnostic-rapide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom: record.prenom,
        nom: record.nom,
        email: record.email,
        telephone: record.telephone,
        code_postal: record.code_postal,
        annee_construction: record.annee_construction,
        surface_habitable: record.surface_habitable,
        type_logement: record.type_logement,
        type_chauffage: record.type_chauffage,
        dpe: record.dpe,
        objectif_projet: record.objectif_projet,
        consentement_contact: record.consentement_contact,
        consentement_email: record.consentement_email,
        source: record.source,
        partenaire_id: record.partenaire_id,
        statut_lead: record.statut_lead,
        score_prequalification: record.score_prequalification,
      }),
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return { ok: false, distant: false };
    return { ok: true, distant: true };
  } catch {
    return { ok: true, distant: false };
  }
}

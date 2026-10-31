/**
 * Synchronisation CRM ↔ Supabase (crm_projets + leads_courtier).
 * Actif uniquement si VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY sont définis.
 */

import { createClient } from "@supabase/supabase-js";
import { DAMIEN_PV_100KWC_DOSSIER_ID } from "./damienPv100kwcOfficiel.js";
import { CLOISON_SDB_DOSSIER_ID } from "./cloisonSdbOfficiel.js";
import { MASSARDIER_LEAD_ID } from "./massardierLeadOfficiel.js";
import { GILBERTAS_DOSSIER_ID } from "./gilbertasClermontOfficiel.js";
import { GESNOUIN_DOSSIER_ID } from "./gesnouinBatterieOfficiel.js";
import { COUTY_ESCALIER_DOSSIER_ID } from "./coutyEscalierOfficiel.js";
import { FARISS_DOSSIER_ID } from "./farissLaRicamarieOfficiel.js";
import { MASSON_DOSSIER_ID } from "./massonToulonOfficiel.js";
import { OUSSARA_DOSSIER_ID } from "./oussaraColombierOfficiel.js";
import { OUSSARA_COMBLES_DOSSIER_ID } from "./oussaraComblesOfficiel.js";

function texte(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function montant(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function lireConfigSupabase() {
  const url = texte(import.meta.env?.VITE_SUPABASE_URL);
  const key = texte(import.meta.env?.VITE_SUPABASE_ANON_KEY);
  return { url, key, configure: Boolean(url && key) };
}

export function clientSupabaseCrm() {
  const { url, key, configure } = lireConfigSupabase();
  if (!configure) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

/** Mappe un projet manuel CRM vers une ligne `crm_projets`. */
export function projetManuelVersLigneCrm(projet) {
  if (!projet?.id) return null;
  const synthese = projet.syntheseFinanciere && typeof projet.syntheseFinanciere === "object" ? projet.syntheseFinanciere : {};
  return {
    id: String(projet.id),
    reference: texte(projet.reference || projet.numeroAuditMar),
    client_nom: texte(projet.nom) || "Projet CRM",
    statut: texte(projet.statut),
    type_projet: texte(projet.typeProjet || projet.typeBien),
    source: texte(projet.source) || "manuel",
    source_lead: texte(projet.sourceLead),
    apporteur_id: texte(projet.apporteurId),
    apporteur_nom: texte(projet.apporteurNom),
    telephone: texte(projet.telephone),
    email: texte(projet.email),
    ville: texte(projet.ville),
    code_postal: texte(projet.codePostal),
    montant_ht: montant(projet.montantHt ?? synthese.totalHt),
    montant_ttc: montant(projet.montantEstimeTtc ?? synthese.totalTtc),
    commission_ht: montant(projet.commissionDamienHt ?? synthese.commissionDamienHt),
    marge_nette_ht: montant(projet.margeNetteEnergiaHt ?? synthese.margeNetteEnergiaHt),
    categorie: texte(projet.categorie),
    payload: {
      ...projet,
      postesContractuels: projet.postesContractuels || projet.travauxCoches || projet.travaux || [],
      travauxCoches: projet.travauxCoches || projet.postesContractuels || projet.travaux || [],
    },
    archive: projet.archive === true,
    updated_at: new Date().toISOString(),
  };
}

/** Prépare un lead `leads_courtier` — refuse les téléphones factices (000… / 061000000X). */
export function projetManuelVersLeadCourtier(projet) {
  if (!projet?.id) return null;
  const telBrut = texte(projet.telephone);
  const telDigits = telBrut.replace(/\D/g, "");
  if (!telDigits || /^0+$/.test(telDigits) || /^0?61000000\d$/.test(telDigits)) {
    return null;
  }
  const nomComplet = texte(projet.nom);
  const parties = nomComplet.split(/\s+/);
  const prenom = texte(projet.prenom) || (parties.length > 1 ? parties[0] : "Lead");
  const nom = parties.length > 1 ? parties.slice(1).join(" ") : nomComplet || projet.id;
  const synthese = projet.syntheseFinanciere && typeof projet.syntheseFinanciere === "object" ? projet.syntheseFinanciere : {};
  const montantTtc = montant(projet.montantEstimeTtc ?? synthese.totalTtc);
  return {
    prenom: prenom.slice(0, 120) || "Lead",
    nom: nom.slice(0, 120) || projet.id,
    email: texte(projet.email) || null,
    telephone: telBrut,
    ville: texte(projet.ville) || "",
    code_postal: texte(projet.codePostal) || "",
    adresse: texte(projet.adresse) || "",
    statut: texte(projet.statut) || "Nouveau",
    type_travaux: texte(projet.typeProjet || projet.description).slice(0, 500),
    budget: montantTtc,
    apporteur: texte(projet.apporteurNom || projet.apporteurId || projet.source) || "crm",
    commission_apporteur: montant(projet.commissionDamienHt ?? synthese.commissionDamienHt),
    notes: texte(projet.description || projet.reference || projet.numeroAuditMar || projet.id).slice(0, 2000),
  };
}

export const IDS_PROJETS_SYNC_PRIORITAIRES = [
  OUSSARA_COMBLES_DOSSIER_ID,
  OUSSARA_DOSSIER_ID,
  MASSON_DOSSIER_ID,
  FARISS_DOSSIER_ID,
  COUTY_ESCALIER_DOSSIER_ID,
  GESNOUIN_DOSSIER_ID,
  DAMIEN_PV_100KWC_DOSSIER_ID,
  CLOISON_SDB_DOSSIER_ID,
  MASSARDIER_LEAD_ID,
  GILBERTAS_DOSSIER_ID,
];

/**
 * Upsert des projets CRM vers `crm_projets`.
 * @returns {{ ok: boolean, upserted: number, erreur?: string, configure: boolean }}
 */
export async function synchroniserProjetsVersSupabase(liste) {
  const configure = lireConfigSupabase().configure;
  const supabase = clientSupabaseCrm();
  if (!supabase) {
    return { ok: false, upserted: 0, configure, erreur: "Supabase non configuré (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)." };
  }
  const rows = (Array.isArray(liste) ? liste : [])
    .map(projetManuelVersLigneCrm)
    .filter(Boolean);
  if (!rows.length) return { ok: true, upserted: 0, configure };
  const { error, data } = await supabase.from("crm_projets").upsert(rows, { onConflict: "id" }).select("id");
  if (error) {
    return { ok: false, upserted: 0, configure, erreur: error.message };
  }
  return { ok: true, upserted: (data || rows).length, configure };
}

/**
 * Pousse uniquement les dossiers prioritaires avec téléphone réel vers `leads_courtier`.
 * Aucun insert avec 0000000000 / 061000000X.
 */
export async function synchroniserLeadsCourtierDepuisProjets(liste) {
  const configure = lireConfigSupabase().configure;
  const supabase = clientSupabaseCrm();
  if (!supabase) {
    return { ok: false, inserted: 0, configure, erreur: "Supabase non configuré." };
  }
  const candidats = (Array.isArray(liste) ? liste : []).filter(
    (p) => p && IDS_PROJETS_SYNC_PRIORITAIRES.includes(p.id) && p.archive !== true,
  );
  let inserted = 0;
  const erreurs = [];
  for (const projet of candidats) {
    const lead = projetManuelVersLeadCourtier(projet);
    if (!lead) continue;
    const tel = lead.telephone;
    if (tel) {
      const { data: existants, error: errLecture } = await supabase
        .from("leads_courtier")
        .select("id")
        .eq("telephone", tel)
        .limit(1);
      if (errLecture) {
        erreurs.push(errLecture.message);
        continue;
      }
      if (existants?.length) continue;
    }
    const { error } = await supabase.from("leads_courtier").insert(lead);
    if (error) {
      const minimal = {
        prenom: lead.prenom,
        nom: lead.nom,
        telephone: lead.telephone,
        ...(lead.email ? { email: lead.email } : {}),
      };
      const retry = await supabase.from("leads_courtier").insert(minimal);
      if (retry.error) erreurs.push(retry.error.message);
      else inserted += 1;
    } else {
      inserted += 1;
    }
  }
  return {
    ok: erreurs.length === 0,
    inserted,
    configure,
    erreur: erreurs[0],
    avertissements: erreurs.slice(1),
  };
}

/** Lecture `crm_projets` pour fusion CRM production. */
export async function lireProjetsCrmDepuisSupabase() {
  const supabase = clientSupabaseCrm();
  if (!supabase) return { ok: false, data: [], message: "non configuré" };
  const { data, error } = await supabase
    .from("crm_projets")
    .select("*")
    .eq("archive", false)
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) return { ok: false, data: [], message: error.message };
  return { ok: true, data: data || [], message: "" };
}

export function ligneCrmVersProjetManuel(row) {
  if (!row) return null;
  const payload = row.payload && typeof row.payload === "object" ? row.payload : {};
  return {
    ...payload,
    id: row.id,
    nom: row.client_nom || payload.nom,
    reference: row.reference || payload.reference,
    statut: row.statut || payload.statut,
    typeProjet: row.type_projet || payload.typeProjet,
    source: row.source || payload.source || "manuel",
    sourceLead: row.source_lead || payload.sourceLead,
    apporteurId: row.apporteur_id || payload.apporteurId,
    apporteurNom: row.apporteur_nom || payload.apporteurNom,
    telephone: row.telephone || payload.telephone,
    email: row.email || payload.email,
    ville: row.ville || payload.ville,
    codePostal: row.code_postal || payload.codePostal,
    montantHt: row.montant_ht ?? payload.montantHt,
    montantEstimeTtc: row.montant_ttc ?? payload.montantEstimeTtc,
    commissionDamienHt: row.commission_ht ?? payload.commissionDamienHt,
    margeNetteEnergiaHt: row.marge_nette_ht ?? payload.margeNetteEnergiaHt,
    categorie: row.categorie || payload.categorie,
    archive: row.archive === true,
  };
}

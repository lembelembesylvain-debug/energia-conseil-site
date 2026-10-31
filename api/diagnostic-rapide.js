/**
 * POST /api/diagnostic-rapide
 * Ne renvoie jamais la liste des prospects.
 * Attribue le lead au partenaire connu (prototype Catarina par défaut).
 */
import { createClient } from "@supabase/supabase-js";
import { getPartnerAttribution, isKnownPartnerId } from "../src/config/partners.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_RE = /^(?:(?:\+33|0033)[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
const CP_RE = /^\d{5}$/;
const LOGEMENT = ["maison", "appartement"];
const CHAUFFAGE = ["gaz", "fioul", "électrique", "bois", "PAC", "autre"];
const DPE = ["A", "B", "C", "D", "E", "F", "G", "inconnu"];
const OBJECTIFS = ["vendre", "acheter", "rénover"];
const STATUTS = [
  "nouveau",
  "contact à effectuer",
  "contact effectué",
  "audit proposé",
  "audit commandé",
  "travaux en étude",
  "travaux réalisés",
  "clôturé",
];

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

function valider(body) {
  const prenom = texte(body?.prenom);
  const nom = texte(body?.nom);
  const email = texte(body?.email).toLowerCase();
  const telephone = texte(body?.telephone).replace(/[.\s-]/g, "");
  const code_postal = texte(body?.code_postal);
  const annee_construction = Number(body?.annee_construction);
  const surface_habitable = Number(body?.surface_habitable);
  const type_logement = texte(body?.type_logement);
  const type_chauffage = texte(body?.type_chauffage);
  const dpe = texte(body?.dpe);
  const objectif_projet = texte(body?.objectif_projet);
  const consentement_contact = body?.consentement_contact === true;
  const consentement_email = body?.consentement_email === true;
  const statut_lead = STATUTS.includes(body?.statut_lead) ? body.statut_lead : "nouveau";
  const score = Number(body?.score_prequalification);

  if (prenom.length < 2 || nom.length < 2) return { ok: false, error: "Identité invalide." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Email invalide." };
  if (!TEL_RE.test(telephone) && !/^0[1-9]\d{8}$/.test(telephone) && !/^\+33[1-9]\d{8}$/.test(telephone)) {
    return { ok: false, error: "Téléphone invalide." };
  }
  if (!CP_RE.test(code_postal)) return { ok: false, error: "Code postal invalide." };
  if (!Number.isInteger(annee_construction) || annee_construction < 1800 || annee_construction > 2026) {
    return { ok: false, error: "Année invalide." };
  }
  if (!Number.isInteger(surface_habitable) || surface_habitable < 15 || surface_habitable > 800) {
    return { ok: false, error: "Surface invalide." };
  }
  if (!LOGEMENT.includes(type_logement) || !CHAUFFAGE.includes(type_chauffage) || !DPE.includes(dpe) || !OBJECTIFS.includes(objectif_projet)) {
    return { ok: false, error: "Champs logement invalides." };
  }
  if (!consentement_contact) return { ok: false, error: "Consentement de recontact obligatoire." };

  const requestedPartner = texte(body?.partenaire_id);
  if (requestedPartner && !isKnownPartnerId(requestedPartner)) {
    return { ok: false, error: "Partenaire inconnu." };
  }
  const attribution = getPartnerAttribution(requestedPartner || "catarina-martins");
  const sourceDemandee = texte(body?.source);

  return {
    ok: true,
    row: {
      prenom,
      nom,
      email,
      telephone,
      code_postal,
      annee_construction,
      surface_habitable,
      type_logement,
      type_chauffage,
      dpe,
      objectif_projet,
      consentement_contact,
      consentement_email,
      source: sourceDemandee || attribution.sourceLabel,
      partenaire_id: attribution.partenaire_id,
      statut_lead,
      date_transmission: new Date().toISOString(),
      score_prequalification: Number.isFinite(score) ? Math.round(score) : null,
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  const parsed = valider(req.body ?? {});
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    res.status(202).json({ ok: true, stored: "local" });
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("leads_diagnostic_rapide").upsert(parsed.row, {
    onConflict: "email,partenaire_id",
  });

  if (error) {
    res.status(202).json({ ok: true, stored: "local", warning: "base distante indisponible" });
    return;
  }

  res.status(200).json({ ok: true, stored: "remote" });
}

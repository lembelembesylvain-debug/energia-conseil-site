import { createClient } from "@supabase/supabase-js";

const ORIGINE_FLYER = "Origine : Flyer Catarina";
const TELEPHONE_RE = /^(?:(?:\+33|0033)[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
const CHAUFFAGES = new Set(["Gaz", "Fioul", "Électricité", "Bois / granulés", "Pompe à chaleur", "Autre / je ne sais pas"]);

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

function estDateIsoFutureOuAujourdhui(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const aujourdHui = new Date().toISOString().slice(0, 10);
  return value >= aujourdHui;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Méthode non autorisée." });
    return;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const prenom = texte(body.prenom);
  const nom = texte(body.nom);
  const telephone = texte(body.telephone);
  const adresseMaison = texte(body.adresse_maison);
  const chauffageActuel = texte(body.chauffage_actuel);
  const dateSouhaitee = texte(body.date_souhaitee);

  if (prenom.length < 2 || prenom.length > 100 || nom.length < 2 || nom.length > 100) {
    res.status(400).json({ ok: false, error: "Veuillez vérifier le nom et le prénom saisis." });
    return;
  }
  if (!TELEPHONE_RE.test(telephone)) {
    res.status(400).json({ ok: false, error: "Veuillez saisir un numéro de téléphone valide." });
    return;
  }
  if (adresseMaison.length < 5 || adresseMaison.length > 300) {
    res.status(400).json({ ok: false, error: "Veuillez saisir une adresse complète." });
    return;
  }
  if (!CHAUFFAGES.has(chauffageActuel)) {
    res.status(400).json({ ok: false, error: "Veuillez sélectionner le chauffage actuel." });
    return;
  }
  if (!estDateIsoFutureOuAujourdhui(dateSouhaitee)) {
    res.status(400).json({ ok: false, error: "Veuillez sélectionner une date valide à partir d’aujourd’hui." });
    return;
  }
  if (body.consentement_contact !== true) {
    res.status(400).json({ ok: false, error: "Votre accord est nécessaire pour traiter la demande." });
    return;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    res.status(503).json({ ok: false, error: "Le service de réservation est momentanément indisponible. Merci de réessayer plus tard." });
    return;
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("demandes_visite_catarina").insert({
    prenom,
    nom,
    telephone,
    adresse_maison: adresseMaison,
    chauffage_actuel: chauffageActuel,
    date_souhaitee: dateSouhaitee,
    consentement_contact: true,
    origine: ORIGINE_FLYER,
  });

  if (error) {
    console.error("[demandes-visite-catarina] Enregistrement Supabase impossible", error.message);
    res.status(503).json({ ok: false, error: "La demande n’a pas pu être enregistrée. Réessayez ou contactez-nous par téléphone." });
    return;
  }

  res.status(201).json({ ok: true });
}

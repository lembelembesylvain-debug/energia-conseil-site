/**
 * POST /api/estimer-chagny
 * Alerte RDV vitrine Chagny — destinataire principal Sylvain LEMBELEMBE.
 */
import { Resend } from "resend";

const DESTINATAIRE = "lembelembe.sylvain@gmail.com";
const FROM_NAME = "Vitrine catarinamartins-immobilier.fr";
const FROM_EMAIL = "noreply@energia-conseil-ia.com";

const LABELS = {
  typeBien: { maison: "Maison individuelle", appartement: "Appartement" },
  dpe: {
    passoire: "G / F — Passoire thermique",
    energivore: "E — Très énergivore",
    standard: "D — Standard",
    performant: "A / B / C",
  },
  chauffage: {
    fioul: "Fioul",
    gaz: "Gaz",
    electrique: "Électrique convecteurs",
    bois: "Bois",
    autre: "Autre / Bois",
  },
  creneau: { matin: "Matin", "apres-midi": "Après-midi" },
  formule: {
    domicile: "Offre B — Consultation Duo à domicile · Arbitrage Vente VS Rénovation · 390 € TTC (Catarina MARTINS & Sylvain LEMBELEMBE)",
    telephone: "Option A — Échange téléphonique de pré-qualification (15 min) offert",
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL_RE = /^(?:(?:\+33|0033)[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
const TYPES = ["maison", "appartement"];
const DPE = ["passoire", "energivore", "standard", "performant"];
const CHAUFFAGE = ["fioul", "gaz", "electrique", "bois", "autre"];
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const CRENEAUX = ["matin", "apres-midi"];
const FORMULES = ["domicile", "telephone"];
const HEURE_RE = /^(?:[01]\d|2[0-3])[:hH][0-5]\d$/;
const JOUR_LIBELLE_RE = /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi)\b/i;

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

function valider(body) {
  const prenom = texte(body?.prenom);
  const nom = texte(body?.nom);
  const email = texte(body?.email).toLowerCase();
  const telephone = texte(body?.telephone).replace(/[.\s-]/g, "");
  const adresse = texte(body?.adresse);
  const jour = texte(body?.jour);
  const creneau = texte(body?.creneau);
  const typeBien = texte(body?.typeBien);
  const dpe = texte(body?.dpe);
  const chauffage = texte(body?.chauffage);
  const commune = texte(body?.commune);
  const surface = Number(body?.surface);
  const consentement = body?.consentement === true;
  const formule = texte(body?.formule);
  const formuleLabel = texte(body?.formuleLabel);
  const secteur = commune || adresse;

  const creneauOk = CRENEAUX.includes(creneau) || HEURE_RE.test(creneau);
  const jourOk = JOURS.includes(jour) || (jour.length >= 6 && JOUR_LIBELLE_RE.test(jour));

  if (prenom.length < 2 || nom.length < 2) return { ok: false, error: "Identité invalide." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Email invalide." };
  if (!TEL_RE.test(telephone) && !/^0[1-9]\d{8}$/.test(telephone) && !/^\+33[1-9]\d{8}$/.test(telephone)) {
    return { ok: false, error: "Téléphone invalide." };
  }
  if (adresse.length < 8) return { ok: false, error: "Adresse du bien requise." };
  if (!jourOk || !creneauOk) return { ok: false, error: "Créneau invalide." };
  if (typeBien && !TYPES.includes(typeBien)) return { ok: false, error: "Questionnaire incomplet." };
  if (dpe && !DPE.includes(dpe)) return { ok: false, error: "Questionnaire incomplet." };
  if (chauffage && !CHAUFFAGE.includes(chauffage)) return { ok: false, error: "Questionnaire incomplet." };
  if (Number.isFinite(surface) && (surface < 50 || surface > 300)) return { ok: false, error: "Surface invalide." };
  if (secteur.length < 2) return { ok: false, error: "Secteur requis." };
  if (formule && !FORMULES.includes(formule)) return { ok: false, error: "Formule invalide." };
  if (!consentement) return { ok: false, error: "Consentement de recontact obligatoire." };

  return {
    ok: true,
    lead: {
      prenom,
      nom,
      email,
      telephone,
      adresse,
      jour,
      creneau,
      formule,
      formuleLabel,
      typeBien,
      dpe,
      chauffage,
      commune: secteur,
      surface: Number.isFinite(surface) ? Math.round(surface) : 0,
      scenarios: body?.scenariosResume || "",
      souhaitAudit: body?.souhaitAudit === true,
      dateIso: texte(body?.dateIso),
      dpeActuel: texte(body?.dpeActuel),
      dpeCible: texte(body?.dpeCible),
      energieDepart: texte(body?.energieDepart) || LABELS.chauffage[chauffage] || chauffage,
      aidesAnah: Number(body?.aidesAnah) || 0,
      aidesAnahLabel: texte(body?.aidesAnahLabel),
      calendarUrl: texte(body?.calendarUrl),
    },
  };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function calendarDates(dateIso, heure) {
  const parts = String(heure || "09:00").replace("h", ":").split(":");
  let h = Number(parts[0]);
  let m = Number(parts[1]);
  if (!Number.isFinite(h)) h = 9;
  if (!Number.isFinite(m)) m = 0;
  const end = h * 60 + m + 15;
  const day = String(dateIso || "").replace(/-/g, "");
  if (day.length !== 8) return "";
  return `${day}T${pad2(h)}${pad2(m)}00/${day}T${pad2(Math.floor(end / 60))}${pad2(end % 60)}00`;
}

function calendarUrl(lead) {
  if (lead.calendarUrl && lead.calendarUrl.startsWith("https://calendar.google.com/")) return lead.calendarUrl;
  const text = `RDV Pré-qualification Catarina et Sylvain — ${lead.prenom} ${lead.nom}`;
  const details = [
    "Pré-qualification 15 min · catarinamartins-immobilier.fr",
    "Offre visée : Consultation Duo 390 € TTC",
    `${lead.jour} à ${String(lead.creneau || "").replace(":", "h")}`,
    `Tél. ${lead.telephone}`,
    `Adresse : ${lead.adresse}`,
    `Énergie de départ : ${lead.energieDepart || ""}`,
    `Classe visée : ${lead.dpeActuel || ""} → ${lead.dpeCible || ""}`,
    `Aides Anah estimées : ${lead.aidesAnahLabel || lead.aidesAnah || ""} (à titre indicatif 2026)`,
  ].join("\n");
  const dates = calendarDates(lead.dateIso, lead.creneau);
  return "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + `&text=${encodeURIComponent(text)}`
    + (dates ? `&dates=${dates}` : "")
    + `&details=${encodeURIComponent(details)}`
    + `&location=${encodeURIComponent(lead.adresse || "")}`
    + "&ctz=Europe/Paris";
}

function htmlEmail(lead) {
  const creneau = LABELS.creneau[lead.creneau] || String(lead.creneau || "").replace(":", "h");
  const typeBien = LABELS.typeBien[lead.typeBien] || lead.typeBien;
  const chauffage = lead.energieDepart || LABELS.chauffage[lead.chauffage] || lead.chauffage;
  const formule = lead.formuleLabel || LABELS.formule[lead.formule] || "";
  const classe = lead.dpeActuel && lead.dpeCible ? `${lead.dpeActuel} → ${lead.dpeCible}` : (LABELS.dpe[lead.dpe] || lead.dpe);
  const aides = lead.aidesAnahLabel || (lead.aidesAnah ? `${lead.aidesAnah} €` : "non calculées");
  const agenda = calendarUrl(lead);
  return `<!DOCTYPE html>
<html lang="fr"><body style="font-family:Georgia,serif;color:#0b1f3a;line-height:1.5">
  <h1 style="font-size:18px">[NOUVEAU RDV VITRINE CHAGNY] — Consultation Duo 390 €</h1>
  <p>Alerte vitrine catarinamartins-immobilier.fr — pré-qualification 15 min, puis Duo 390 € TTC si éligible.</p>
  <h2 style="font-size:15px">Date et heure</h2>
  <ul>
    <li><strong>Date :</strong> ${escapeHtml(lead.jour)}</li>
    <li><strong>Heure :</strong> ${escapeHtml(creneau)}</li>
  </ul>
  <h2 style="font-size:15px">Coordonnées du propriétaire</h2>
  <ul>
    <li><strong>Nom :</strong> ${escapeHtml(lead.nom)}</li>
    <li><strong>Prénom :</strong> ${escapeHtml(lead.prenom)}</li>
    <li><strong>Téléphone :</strong> ${escapeHtml(lead.telephone)}</li>
    <li><strong>E-mail :</strong> ${escapeHtml(lead.email)}</li>
    <li><strong>Adresse du bien :</strong> ${escapeHtml(lead.adresse)}</li>
    <li><strong>Formule :</strong> ${escapeHtml(formule || "Non précisée")}</li>
    <li><strong>Audit réglementaire souhaité :</strong> ${lead.souhaitAudit ? "oui — dès 990 € TTC (MaPrimeRénov’ jusqu’à 500 €, à titre indicatif)" : "non"}</li>
  </ul>
  <h2 style="font-size:15px">Cockpit</h2>
  <ul>
    <li><strong>Énergie de départ :</strong> ${escapeHtml(chauffage)}</li>
    <li><strong>Classe visée :</strong> ${escapeHtml(classe)}</li>
    <li><strong>Aides Anah estimées :</strong> ${escapeHtml(aides)}</li>
    <li><strong>Type :</strong> ${escapeHtml(typeBien)} · ${lead.surface} m²</li>
  </ul>
  <p><a href="${escapeHtml(agenda)}" style="display:inline-block;padding:10px 16px;background:#D4AF37;color:#1a1408;text-decoration:none;border-radius:999px;font-weight:700">Ajouter à Google Calendar</a></p>
  <p style="font-size:12px;word-break:break-all">${escapeHtml(agenda)}</p>
  <h2 style="font-size:15px">Simulation cockpit (indicative)</h2>
  <p style="white-space:pre-wrap">${escapeHtml(String(lead.scenarios || ""))}</p>
  <p style="font-size:12px;color:#5b6b7c">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Consultation Duo 390 € TTC, 100 % déductible à la signature d’un mandat exclusif de vente ou d’un contrat de rénovation Contractant Général. Aucun déplacement gratuit avant validation d’éligibilité.</p>
</body></html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    res.status(202).json({ ok: true, delivered: false, reason: "email non configuré" });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const fromRaw = (process.env.RESEND_FROM_EMAIL || FROM_EMAIL).replace(/renovoptim-ia\.com/gi, "energia-conseil-ia.com");
    const from = fromRaw.includes("<") ? fromRaw : `${FROM_NAME} <${fromRaw}>`;
    const { error } = await resend.emails.send({
      from,
      to: [DESTINATAIRE],
      replyTo: parsed.lead.email,
      subject: `[NOUVEAU RDV VITRINE CHAGNY] - Consultation Duo 390 € - ${parsed.lead.prenom} ${parsed.lead.nom}`,
      html: htmlEmail(parsed.lead),
    });
    if (error) {
      res.status(202).json({ ok: true, delivered: false, reason: error.message || "envoi partiel" });
      return;
    }
    res.status(200).json({ ok: true, delivered: true });
  } catch {
    res.status(202).json({ ok: true, delivered: false, reason: "erreur d'envoi" });
  }
}

/**
 * POST /api/messagerie-email
 * Envoi professionnel Resend pour le CRM. L'expéditeur est figé.
 * La clé est lue côté serveur (RESEND_API_KEY, sinon VITE_RESEND_API_KEY dans .env.local).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resend } from "resend";

const FROM = "ENERGIA CONSEIL IA®️ <contact@renovoptim-ia.com>";
const REPLY_TO = "contact@renovoptim-ia.com";
const ADRESSE_VERIFIEE = "contact@renovoptim-ia.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fenetre = [];

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

function lireTexteEnv(chemin) {
  const brut = readFileSync(chemin);
  const utf16 =
    (brut.length >= 2 && brut[0] === 0xff && brut[1] === 0xfe) ||
    (brut.length >= 4 && brut[1] === 0x00 && brut[3] === 0x00);
  return (utf16 ? brut.toString("utf16le") : brut.toString("utf8")).replace(/^\uFEFF/, "");
}

function lireCle() {
  const directe = texte(process.env.RESEND_API_KEY) || texte(process.env.VITE_RESEND_API_KEY);
  if (directe) return directe;
  for (const fichier of [".env.local", ".env"]) {
    const chemin = resolve(process.cwd(), fichier);
    if (!existsSync(chemin)) continue;
    const contenu = lireTexteEnv(chemin);
    const serveur = contenu.match(/^RESEND_API_KEY\s*=\s*(.+)$/m);
    const vite = contenu.match(/^VITE_RESEND_API_KEY\s*=\s*(.+)$/m);
    const brut = (serveur || vite)?.[1]?.trim().replace(/^["']|["']$/g, "");
    if (brut) return brut;
  }
  return "";
}

function htmlDepuisTexte(valeur) {
  const echappe = valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:24px;background:#f4f7fb;color:#0a0f1d;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d7e0ea;border-radius:12px;">
    <tr><td style="padding:20px 24px;background:#0a0f1d;color:#e8fff6;font-family:Arial,sans-serif;">
      <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#5eead4;">ENERGIA CONSEIL IA®</div>
      <div style="margin-top:6px;font-size:18px;">Bureau d'études &amp; AMO</div>
    </td></tr>
    <tr><td style="padding:24px;font-size:16px;line-height:1.55;white-space:pre-wrap;">${echappe}</td></tr>
  </table></body></html>`;
}

function tropFrequent() {
  const maintenant = Date.now();
  while (fenetre.length > 0 && maintenant - fenetre[0] > 60_000) fenetre.shift();
  if (fenetre.length >= 12) return true;
  fenetre.push(maintenant);
  return false;
}

function htmlSur(html, texteBrut) {
  if (typeof html !== "string" || html.length < 80 || html.length > 150000) return htmlDepuisTexte(texteBrut);
  if (!/ENERGIA/i.test(html)) return htmlDepuisTexte(texteBrut);
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function expediteur(from) {
  const brut = texte(from).replace(/[\r\n]/g, "");
  const nomBrut = brut.includes("<") ? brut.split("<")[0] : brut;
  const nom = nomBrut.replace(/[<>]/g, "").trim().slice(0, 80);
  return nom ? `${nom} <${ADRESSE_VERIFIEE}>` : FROM;
}

function piecesJointes(liste) {
  if (!Array.isArray(liste)) return undefined;
  const pieces = [];
  for (const item of liste.slice(0, 2)) {
    const filename = texte(item?.filename).replace(/[^\w.\- ()àâäéèêëïîôùûüç]/gi, "").slice(0, 80);
    const content = typeof item?.content === "string" ? item.content : "";
    if (!filename || content.length < 16 || content.length > 1_800_000) continue;
    pieces.push({ filename, content });
  }
  return pieces.length > 0 ? pieces : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  const to = texte(req.body?.to);
  const subject = texte(req.body?.subject);
  const text = texte(req.body?.text);
  if (!EMAIL_RE.test(to)) {
    res.status(400).json({ error: "Adresse destinataire invalide." });
    return;
  }
  if (subject.length < 3 || subject.length > 180) {
    res.status(400).json({ error: "Objet invalide." });
    return;
  }
  if (text.length < 20 || text.length > 20000) {
    res.status(400).json({ error: "Message invalide." });
    return;
  }
  if (tropFrequent()) {
    res.status(429).json({ error: "Trop d'envois sur une minute. Réessayez dans un instant." });
    return;
  }

  const apiKey = lireCle();
  if (!apiKey) {
    res.status(202).json({ ok: false, delivered: false, reason: "RESEND_API_KEY absente" });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: expediteur(req.body?.from),
      to: [to],
      replyTo: REPLY_TO,
      subject,
      text,
      html: htmlSur(req.body?.html, text),
      attachments: piecesJointes(req.body?.attachments),
    });
    if (error) {
      res.status(502).json({ error: error.message || "Resend a refusé l'envoi." });
      return;
    }
    res.status(200).json({ ok: true, delivered: true, id: data?.id || "" });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Envoi impossible." });
  }
}

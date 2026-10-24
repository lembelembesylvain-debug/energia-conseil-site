import { EXPEDITEUR_EMAIL } from "./signature";
import type { ResultatEnvoi } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CorpsResend = {
  id?: string;
  message?: string;
  error?: string | { message?: string };
};

export type PieceResend = {
  filename: string;
  content: string;
};

function lireCleNavigateur(): string {
  const env = (import.meta as ImportMeta & { env?: { VITE_RESEND_API_KEY?: string } }).env;
  return (env?.VITE_RESEND_API_KEY || "").trim();
}

function messageErreur(corps: CorpsResend, secours: string): string {
  if (typeof corps.message === "string" && corps.message.trim()) return corps.message.trim();
  if (typeof corps.error === "string" && corps.error.trim()) return corps.error.trim();
  if (corps.error && typeof corps.error === "object" && corps.error.message) return corps.error.message;
  return secours;
}

async function lireJson(reponse: Response): Promise<CorpsResend> {
  try {
    return (await reponse.json()) as CorpsResend;
  } catch {
    return {};
  }
}

async function tenterResendDirect(
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
  attachments: PieceResend[],
): Promise<ResultatEnvoi | null> {
  const cle = lireCleNavigateur();
  if (!cle) return null;
  try {
    const reponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: EXPEDITEUR_EMAIL,
        subject,
        text,
        html,
        attachments: attachments.length > 0 ? attachments : undefined,
      }),
    });
    const corps = await lireJson(reponse);
    if (reponse.ok) {
      return {
        ok: true,
        canal: "resend",
        resendId: corps.id,
        message: `Email envoyé avec succès à ${to}`,
        detail: corps.id ? `Resend ${corps.id}` : "Remise acceptée par Resend",
      };
    }
    return {
      ok: false,
      canal: "resend",
      message: messageErreur(corps, `Resend a répondu ${reponse.status}.`),
    };
  } catch {
    return null;
  }
}

async function tenterProxy(
  from: string,
  to: string,
  subject: string,
  text: string,
  html: string,
  attachments: PieceResend[],
): Promise<ResultatEnvoi | null> {
  try {
    const reponse = await fetch("/api/messagerie-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, text, html, from, attachments }),
    });
    const corps = await lireJson(reponse);
    if (reponse.status === 202) return null;
    if (reponse.ok) {
      return {
        ok: true,
        canal: "proxy",
        resendId: corps.id,
        message: `Email envoyé avec succès à ${to}`,
        detail: corps.id ? `Resend ${corps.id}` : "Remise acceptée par le serveur ENERGIA",
      };
    }
    if (reponse.status >= 500) return null;
    return {
      ok: false,
      canal: "proxy",
      message: messageErreur(corps, "Le serveur de messagerie a refusé l'envoi."),
    };
  } catch {
    return null;
  }
}

export async function envoyerEmailProfessionnel(saisie: {
  to: string;
  subject: string;
  text: string;
  html: string;
  from: string;
  attachments?: PieceResend[];
}): Promise<ResultatEnvoi> {
  const to = saisie.to.trim();
  const subject = saisie.subject.trim();
  const text = saisie.text.trim();
  const html = saisie.html;
  const from = saisie.from.trim();
  const attachments = (saisie.attachments || []).filter((piece) => piece.filename && piece.content.length > 16 && piece.content.length < 1_800_000);
  if (!EMAIL_RE.test(to)) {
    return { ok: false, canal: "simulation", message: "Adresse destinataire invalide." };
  }
  if (subject.length < 3 || subject.length > 180) {
    return { ok: false, canal: "simulation", message: "L'objet doit contenir entre 3 et 180 caractères." };
  }
  if (text.length < 20 || text.length > 20000) {
    return { ok: false, canal: "simulation", message: "Le message doit contenir entre 20 et 20 000 caractères." };
  }

  const direct = await tenterResendDirect(from, to, subject, text, html, attachments);
  if (direct?.ok) return direct;
  if (direct && !direct.ok && direct.message && !/cors|failed to fetch|network/i.test(direct.message)) {
    const proxyApresRefus = await tenterProxy(from, to, subject, text, html, attachments);
    if (proxyApresRefus?.ok) return proxyApresRefus;
    return direct;
  }

  const proxy = await tenterProxy(from, to, subject, text, html, attachments);
  if (proxy?.ok) return proxy;
  if (proxy && !proxy.ok) return proxy;

  return {
    ok: true,
    canal: "simulation",
    message: `Email envoyé avec succès à ${to}`,
    detail: "Resend est injoignable depuis le navigateur (CORS ou clé absente). L'email est horodaté dans l'historique de ce dossier. Renseignez RESEND_API_KEY pour la remise réelle.",
  };
}

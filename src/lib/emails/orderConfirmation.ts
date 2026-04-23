import { Resend } from "resend";

import { buildResendFromHeader } from "@/lib/emails/resendFrom";
import { getAppBaseUrl } from "./getAppBaseUrl";

const brand = "#2d5a3d";
const accent = "#52b788";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildOrderConfirmationHtml(params: {
  firstName: string;
  orderId: string;
  guidePhotosUrl: string;
}): string {
  const { firstName, orderId, guidePhotosUrl } = params;
  const safeName = escapeHtml(firstName);
  const safeOrder = escapeHtml(orderId);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirmation ENERGIA-CONSEIL IA</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f5;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(45,90,61,0.12);">
          <tr>
            <td style="background:${brand};padding:28px 32px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">ENERGIA-CONSEIL IA<sup style="font-size:11px;">®</sup></div>
              <div style="font-size:12px;color:rgba(255,255,255,0.85);margin-top:6px;">Audit Énergétique Intelligence Artificielle</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a1a;">Merci ${safeName}, votre commande est confirmée !</p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#444;">Votre audit énergétique IA est enregistré. Notre équipe traite votre dossier dans les meilleurs délais.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8faf9;border-radius:12px;border:1px solid #e5ebe7;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${brand};text-transform:uppercase;letter-spacing:0.06em;">Récapitulatif</p>
                    <p style="margin:0;font-size:15px;color:#333;line-height:1.7;">
                      <strong>Produit :</strong> Audit Énergétique IA<br/>
                      <strong>Montant :</strong> 199&nbsp;€ TTC<br/>
                      <strong>Livraison :</strong> rapport PDF sous 48&nbsp;h<br/>
                      <strong>N° commande :</strong> <code style="background:#eef2f0;padding:2px 8px;border-radius:6px;font-size:13px;">${safeOrder}</code>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,${accent}22,${brand}18);border-radius:12px;border-left:4px solid ${accent};">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 10px;font-size:15px;font-weight:800;color:${brand};">📸 ÉTAPE SUIVANTE : Envoyez vos photos</p>
                    <p style="margin:0;font-size:14px;line-height:1.65;color:#2d3748;">
                      Envoyez <strong>15 photos</strong> nettes : <strong>façades</strong> (toutes orientations), <strong>pièces principales</strong>, <strong>équipements</strong> (chaudière, ballon, VMC, tableau électrique, combles si accessibles).
                    </p>
                    <p style="margin:14px 0 0;font-size:14px;color:${brand};font-weight:600;">
                      → <a href="mailto:audit@energia-conseil-ia.com" style="color:${brand};">audit@energia-conseil-ia.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${escapeHtml(guidePhotosUrl)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;box-shadow:0 4px 14px rgba(82,183,136,0.45);">Voir le guide photos complet</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#f8faf9;border-top:1px solid #e5ebe7;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
                L&apos;équipe ENERGIA-CONSEIL IA<br/>
                16 Rue Cuvier, 69006 Lyon<br/>
                <a href="https://www.energia-conseil.com" style="color:${brand};">www.energia-conseil.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type SendOrderConfirmationParams = {
  to: string;
  firstName: string;
  orderId: string;
};

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams,
): Promise<{ id: string } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey?.trim()) {
    return { error: "RESEND_API_KEY manquant" };
  }

  const from = buildResendFromHeader(
    process.env.RESEND_FROM_EMAIL,
    "ENERGIA CONSEIL IA",
  );

  const guidePhotosUrl = `${getAppBaseUrl()}/guide-photos`;
  const subject = `✅ Confirmation - Audit Énergétique IA ENERGIA CONSEIL (#${params.orderId})`;

  const html = buildOrderConfirmationHtml({
    firstName: params.firstName,
    orderId: params.orderId,
    guidePhotosUrl,
  });

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: params.to,
    replyTo: process.env.RESEND_REPLY_TO?.trim() || "contact@energia-conseil-ia.com",
    subject,
    html,
    text: `Merci ${params.firstName}, votre commande ${params.orderId} est confirmée. Audit IA 199€, livraison 48h. Envoyez vos 15 photos à audit@energia-conseil-ia.com. Guide : ${guidePhotosUrl}`,
  });

  if (error) {
    console.error("[Resend]", error);
    return { error: error.message || "Erreur Resend" };
  }
  if (!data?.id) {
    return { error: "Réponse Resend invalide" };
  }
  return { id: data.id };
}

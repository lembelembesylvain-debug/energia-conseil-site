import { euro, lienAbsolu } from "./modeles";
import type { MarqueEmail } from "./marque";
import type { ContexteEmail, PieceJointe } from "./types";

export type RenduEmail = {
  destinataire: string;
  sujet: string;
  corps: string;
  marque: MarqueEmail;
  lienAction?: string;
  libelleAction?: string;
  contexte?: ContexteEmail;
  pieces?: PieceJointe[];
  /** Aperçu CRM : le bouton et les pièces restent visibles, sans charger le devis dans le cadre. */
  figerLiens?: boolean;
};

function echapper(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlLogo(logoUrl: string): string {
  if (logoUrl.startsWith("data:") || /^https?:\/\//i.test(logoUrl)) return logoUrl;
  return lienAbsolu(logoUrl);
}

function carteKpi(libelle: string, valeur: string): string {
  return `<td style="width:33%;padding:6px;vertical-align:top;">
    <div style="border:1px solid #d7efe6;border-radius:12px;padding:12px 10px;background:#f3fbf8;">
      <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#0f766e;">${echapper(libelle)}</div>
      <div style="margin-top:6px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#0a0f1d;">${echapper(valeur)}</div>
    </div>
  </td>`;
}

function kpis(contexte?: ContexteEmail): string {
  if (!contexte) return "";
  const cellules: string[] = [];
  if (contexte.puissanceThermiqueKw) {
    cellules.push(carteKpi("Déperditions", `${contexte.puissanceThermiqueKw.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kW`));
  } else if (contexte.puissanceKw) {
    cellules.push(carteKpi("Puissance PAC", `${contexte.puissanceKw.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kW`));
  }
  if (contexte.economiesAnnuelles) cellules.push(carteKpi("Économies / an", euro(contexte.economiesAnnuelles)));
  if (contexte.ceeEur) cellules.push(carteKpi("CEE déduits", euro(contexte.ceeEur)));
  if (contexte.kwc) cellules.push(carteKpi("Puissance solaire", `${contexte.kwc.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kWc`));
  if (contexte.gainAnnuel && !contexte.economiesAnnuelles) cellules.push(carteKpi("Gain année 1", euro(contexte.gainAnnuel)));
  if (cellules.length === 0) return "";
  return `<tr><td style="padding:0 28px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cellules.slice(0, 3).join("")}</tr></table></td></tr>`;
}

function listePieces(pieces: PieceJointe[] | undefined, figerLiens: boolean): string {
  const utiles = (pieces || []).filter((piece) => piece.nom.trim());
  if (utiles.length === 0) return "";
  const lignes = utiles
    .map((piece) => {
      const nom = echapper(piece.nom);
      if (piece.url && !figerLiens) {
        return `<li style="margin:0 0 6px;"><a href="${echapper(lienAbsolu(piece.url))}" style="color:#0369a1;text-decoration:none;">${nom}</a></li>`;
      }
      return `<li style="margin:0 0 6px;color:#0a0f1d;">${nom}</li>`;
    })
    .join("");
  return `<tr><td style="padding:4px 28px 8px;font-family:Arial,sans-serif;font-size:13px;color:#334155;">
    <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#0f766e;">Pièces jointes</div>
    <ul style="margin:8px 0 0;padding-left:18px;">${lignes}</ul>
  </td></tr>`;
}

export function rendreEmailHtml(rendu: RenduEmail): string {
  const logo = urlLogo(rendu.marque.logoUrl);
  const corps = echapper(rendu.corps).replace(/\n/g, "<br>");
  const signature = echapper(rendu.marque.signature).replace(/\n/g, "<br>");
  const lien = rendu.lienAction ? lienAbsolu(rendu.lienAction) : "";
  const libelle = rendu.libelleAction || "Consulter mon étude / devis";
  const figer = Boolean(rendu.figerLiens);
  const styleBouton =
    "display:inline-block;background:#0284c7;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:999px;";
  const bouton = lien
    ? `<tr><td style="padding:8px 28px 20px;">
        ${
          figer
            ? `<span style="${styleBouton}">${echapper(libelle)}</span>`
            : `<a href="${echapper(lien)}" style="${styleBouton}">${echapper(libelle)}</a>`
        }
      </td></tr>`
    : "";
  const destinataire = rendu.destinataire.trim() || "—";
  const sujet = rendu.sujet.trim() || "—";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e7eef2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e7eef2;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d5e2ea;">
        <tr><td style="background:#0a0f1d;padding:22px 28px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
              <div style="display:inline-block;background:#ffffff;border-radius:12px;padding:8px 10px;line-height:0;">
                <img src="${echapper(logo)}" alt="ENERGIA CONSEIL IA — logo des trois arbres" width="168" style="display:block;width:168px;max-width:100%;height:auto;border:0;">
              </div>
            </td>
          </tr></table>
          <div style="margin-top:14px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#5eead4;">ENERGIA CONSEIL IA®</div>
          <div style="margin-top:4px;font-family:Georgia,serif;font-size:20px;color:#f8fafc;">Bureau d'études &amp; Contractant Général</div>
          <div style="margin-top:12px;height:3px;background:linear-gradient(90deg,#34d399,#22d3ee);border-radius:99px;"></div>
        </td></tr>
        <tr><td style="padding:18px 28px 0;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#334155;">
          <div><strong style="color:#0f766e;">Destinataire</strong> · ${echapper(destinataire)}</div>
          <div style="margin-top:4px;"><strong style="color:#0f766e;">Objet</strong> · ${echapper(sujet)}</div>
        </td></tr>
        <tr><td style="padding:18px 28px 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#0a0f1d;">${corps}</td></tr>
        ${kpis(rendu.contexte)}
        ${listePieces(rendu.pieces, figer)}
        ${bouton}
        <tr><td style="padding:0 28px 22px;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#64748b;">
          Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
        </td></tr>
        <tr><td style="background:#0a0f1d;padding:22px 28px 26px;">
          <div style="display:inline-block;background:#ffffff;border-radius:10px;padding:6px 8px;line-height:0;">
            <img src="${echapper(logo)}" alt="ENERGIA CONSEIL IA" width="120" style="display:block;width:120px;max-width:100%;height:auto;border:0;">
          </div>
          <div style="margin-top:12px;font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#e2e8f0;">${signature}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function texteAvecSignature(corps: string, signature: string): string {
  const propre = corps.replace(/\s+$/u, "");
  if (propre.includes("energia-conseil-ia.com") && propre.includes("renovoptim-ia.com") && propre.includes("Sylvain Lembelembe")) {
    return propre;
  }
  return `${propre}\n\n${signature.trim()}`;
}

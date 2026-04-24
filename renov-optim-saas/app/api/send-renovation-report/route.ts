import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generatePremiumRenovationPdfBuffer } from "@/lib/generate-pdf-puppeteer";
import type { RenovationReportInput } from "@/lib/generate-renovation-report-pdf";

const RESEND_VERIFIED_ADDRESS = "noreply@energia-conseil-ia.com";

function buildResendFromHeader(
  envFrom: string | undefined,
  displayName: string,
): string {
  const raw = (envFrom?.trim() || RESEND_VERIFIED_ADDRESS).replace(
    /renovoptim-ia\.com/gi,
    "energia-conseil-ia.com",
  );
  if (raw.includes("<")) {
    return raw;
  }
  return `${displayName} <${raw}>`;
}

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtEur(n: number): string {
  const v = Math.round(Number.isFinite(n) ? n : 0);
  return `${v.toLocaleString("fr-FR")} €`;
}

function buildRenovationEmailHtml(input: RenovationReportInput): string {
  const prenom =
    (input.clientPrenom && input.clientPrenom.trim()) ||
    (input.clientName && input.clientName.trim().split(/\s+/)[0]) ||
    "Bonjour";
  const roiStr =
    input.roi > 0 && Number.isFinite(input.roi) ? `${input.roi.toFixed(1).replace(".", ",")} ans` : "—";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,Segoe UI,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;">
  <p>Bonjour ${escapeHtml(prenom)},</p>
  <p>Veuillez trouver ci-joint votre rapport complet de rénovation énergétique personnalisé.</p>
  <ul style="margin:16px 0;padding-left:20px;">
    <li>Coût travaux : <strong>${fmtEur(input.totalCostHT)}</strong></li>
    <li>Total aides : <strong>${fmtEur(input.totalAides)}</strong></li>
    <li>Reste à charge : <strong>${fmtEur(input.resteACharge)}</strong></li>
    <li>ROI estimé : <strong>${escapeHtml(roiStr)}</strong></li>
  </ul>
  <p>Cordialement,<br/>
  Sylvain LEMBELEMBE<br/>
  ENERGIA CONSEIL IA®<br/>
  <a href="tel:+33610596898">06 10 59 68 98</a></p>
</body>
</html>`;
}

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  input?: RenovationReportInput;
  toEmail?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY manquant côté serveur." },
      { status: 501 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const input = body.input;
  const toEmail = (body.toEmail ?? input?.clientEmail ?? "").trim().toLowerCase();
  if (!input || !toEmail || !toEmail.includes("@")) {
    return NextResponse.json(
      { error: "Corps invalide : input et toEmail (ou clientEmail) requis." },
      { status: 400 },
    );
  }

  try {
    const pdfBuf = await generatePremiumRenovationPdfBuffer({
      ...input,
      clientEmail: toEmail,
    });
    const date = input.reportDate ?? new Date().toISOString().split("T")[0];
    const filename = `rapport-renovation-${date}.pdf`;

    const resend = new Resend(apiKey);
    const from = buildResendFromHeader(process.env.RESEND_FROM_EMAIL, "ENERGIA CONSEIL IA®");

    const subject =
      "Votre rapport de rénovation énergétique personnalisé - ENERGIA CONSEIL IA®";
    const html = buildRenovationEmailHtml(input);

    const { error } = await resend.emails.send({
      from,
      to: [toEmail],
      subject,
      html,
      text: `Bonjour,\n\nVeuillez trouver ci-joint votre rapport complet de rénovation énergétique personnalisé.\nCoût travaux : ${fmtEur(input.totalCostHT)}\nTotal aides : ${fmtEur(input.totalAides)}\nReste à charge : ${fmtEur(input.resteACharge)}\nROI estimé : ${input.roi > 0 ? `${input.roi.toFixed(1)} ans` : "—"}\n\nCordialement,\nSylvain LEMBELEMBE\nENERGIA CONSEIL IA®\n06 10 59 68 98`,
      attachments: [
        {
          filename,
          content: Buffer.from(pdfBuf).toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("[send-renovation-report]", error);
      return NextResponse.json(
        { error: error.message ?? "Erreur Resend" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur envoi email";
    console.error("[send-renovation-report]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

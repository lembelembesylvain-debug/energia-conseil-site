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
    const from = buildResendFromHeader(
      process.env.RESEND_FROM_EMAIL,
      "Rénov'Optim IA",
    );

    const { error } = await resend.emails.send({
      from,
      to: [toEmail],
      subject: "Votre rapport de rénovation énergétique",
      text: `Bonjour,\n\nVous trouverez en pièce jointe votre rapport de rénovation énergétique (${filename}).\n\nCordialement,\nRénov'Optim IA`,
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

import { NextResponse } from "next/server";
import { generatePremiumRenovationPdfBuffer } from "@/lib/generate-pdf-puppeteer";
import type { RenovationReportInput } from "@/lib/generate-renovation-report-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: RenovationReportInput;
  try {
    body = (await req.json()) as RenovationReportInput;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  try {
    const buf = await generatePremiumRenovationPdfBuffer(body);
    const date = body.reportDate ?? new Date().toISOString().split("T")[0];
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport-renovation-${date}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur génération PDF";
    console.error("[renovation-report-pdf]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

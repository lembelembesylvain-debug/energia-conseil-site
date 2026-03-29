import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/emails/orderConfirmation";

export const runtime = "nodejs";

function authorizeInternal(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) {
    console.warn(
      "[send-confirmation] INTERNAL_API_SECRET non défini — route ouverte (développement uniquement).",
    );
    return true;
  }
  const header = req.headers.get("x-internal-api-secret");
  return header === secret;
}

export async function POST(req: NextRequest) {
  if (!authorizeInternal(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { email, firstName, orderId } = body as {
    email?: string;
    firstName?: string;
    orderId?: string;
  };

  if (!email?.trim() || !orderId?.trim()) {
    return NextResponse.json(
      { error: "Champs requis : email, orderId" },
      { status: 400 },
    );
  }

  const result = await sendOrderConfirmationEmail({
    to: email.trim(),
    firstName: (firstName?.trim() || "Cher client").split(/\s+/)[0] || "Cher client",
    orderId: orderId.trim(),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, emailId: result.id });
}

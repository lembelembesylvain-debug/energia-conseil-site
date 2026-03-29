import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAppBaseUrl } from "@/lib/emails/getAppBaseUrl";

export const runtime = "nodejs";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

async function notifySendConfirmation(payload: {
  email: string;
  firstName: string;
  orderId: string;
}): Promise<void> {
  const base = getAppBaseUrl();
  const url = `${base}/api/send-confirmation`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (secret) {
    headers["x-internal-api-secret"] = secret;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`send-confirmation ${res.status}: ${text}`);
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json(
      { error: "Webhook non configuré" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature absente" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signature invalide";
    console.error("[webhook] constructEvent:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email =
      session.customer_details?.email || session.customer_email || null;
    const orderId = session.id;
    const fullName = session.customer_details?.name?.trim() || "";
    const firstName =
      fullName.split(/\s+/).filter(Boolean)[0] || "Cher client";

    if (email) {
      try {
        await notifySendConfirmation({ email, firstName, orderId });
      } catch (e) {
        console.error("[webhook] send-confirmation:", e);
        return NextResponse.json(
          { error: "Échec envoi email", received: true },
          { status: 500 },
        );
      }
    } else {
      console.warn("[webhook] checkout.session.completed sans email", orderId);
    }
  }

  return NextResponse.json({ received: true });
}

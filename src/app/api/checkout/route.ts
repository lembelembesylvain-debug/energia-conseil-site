import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquant");
  }
  return new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    const originHeader = req.headers.get("origin");
    const referer = req.headers.get("referer");
    let origin = originHeader ?? req.nextUrl.origin;
    if (!originHeader && referer) {
      try {
        origin = new URL(referer).origin;
      } catch {
        /* garde req.nextUrl.origin */
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Audit Énergétique IA - ENERGIA CONSEIL",
              description:
                "Audit énergétique complet par IA — livraison sous 48h",
            },
            unit_amount: 19900,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      billing_address_collection: "required",
      locale: "fr",
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("[checkout]", err);
    const message =
      err instanceof Error ? err.message : "Erreur création session Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

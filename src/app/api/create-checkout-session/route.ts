import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";          // Stripe requiert Node.js runtime
export const dynamic = "force-dynamic";   // pas de cache

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY as string;
if (!STRIPE_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// GET facultatif pour éviter le 405 quand on ouvre l’URL dans le navigateur
export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST only. Send {pendingText}." });
}

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_KEY) {
      return NextResponse.json({ error: "MISSING_ENV" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const raw = typeof body?.pendingText === "string" ? body.pendingText : "";
    const text = raw.trim();

    if (!text || text.length > 500) {
      return NextResponse.json(
        { error: "TEXT_INVALID", detail: "1–500 caractères requis." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Message" },
            unit_amount: 100, // 1,00 €
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: { pending_text: text },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Stripe error:", msg);
    return NextResponse.json(
      { error: "SERVER_ERROR", detail: msg },
      { status: 500 }
    );
  }
}
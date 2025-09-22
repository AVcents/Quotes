import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "NO_SESSION_ID" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "UNPAID" }, { status: 402 });
  }

  // 1) renvoyer l'ancien message
  const previous = store.read();

  // 2) enregistrer le nouveau comme “dernier”
  const text = String(session.metadata?.pending_text ?? "").trim();
  if (text) store.write(text);

  return NextResponse.json({ previous, saved: Boolean(text) });
}
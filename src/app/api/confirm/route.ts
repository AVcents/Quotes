import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- Env checks ----
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE as string | undefined;

if (!STRIPE_KEY) console.error("ENV_MISSING: STRIPE_SECRET_KEY");
if (!SUPABASE_URL) console.error("ENV_MISSING: SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE) console.error("ENV_MISSING: SUPABASE_SERVICE_ROLE");

const stripe = new Stripe(STRIPE_KEY ?? "");
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } })
  : null;

export async function GET(req: NextRequest) {
  try {
    if (!STRIPE_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !supabase) {
      return NextResponse.json({ error: "SERVER_MISCONFIGURED" }, { status: 500 });
    }

    const url = req.nextUrl;
    const sessionId = url.searchParams.get("session_id");
    const intentId = url.searchParams.get("intent_id");

    let paid = false;
    let pendingText = "";

    if (sessionId) {
      // Checkout Session flow
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      pendingText = String(session.metadata?.pending_text ?? "").trim();
    } else if (intentId) {
      // PaymentIntent flow (Apple Pay via Payment Request Button)
      const pi = await stripe.paymentIntents.retrieve(intentId);
      paid = pi.status === "succeeded";
      pendingText = String(pi.metadata?.pending_text ?? "").trim();
    } else {
      return NextResponse.json({ error: "NO_TOKEN" }, { status: 400 });
    }

    if (!paid) {
      return NextResponse.json({ error: "UNPAID" }, { status: 402 });
    }

    // 1) Read last message from Supabase
    const { data: lastRow, error: selErr } = await supabase
      .from("messages")
      .select("text")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selErr) {
      console.error("SUPABASE_SELECT_ERROR", selErr.message);
    }

    const previous = lastRow?.text ?? null;

    // 2) Insert new message from metadata
    if (pendingText) {
      const { error: insErr } = await supabase.from("messages").insert({ text: pendingText });
      if (insErr) {
        console.error("SUPABASE_INSERT_ERROR", insErr.message);
      }
    }

    return NextResponse.json({ previous, saved: Boolean(pendingText) }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("CONFIRM_ROUTE_ERROR", msg);
    return NextResponse.json({ error: "SERVER_ERROR", detail: msg }, { status: 500 });
  }
}
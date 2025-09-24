import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { amount, text } = await req.json();

    if (!amount || !text) {
      return NextResponse.json({ error: "Missing amount or text" }, { status: 400 });
    }

    // Création du PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // en centimes
      currency: "eur",
      payment_method_types: ["card"], // Apple Pay est inclus ici automatiquement
      metadata: {
        pending_text: text,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
"use client";
import { useState, useEffect, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import Image from "next/image";

export default function Home() {
  const [text, setText] = useState("");
  type Msg = { text: string; created_at: string } | null;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [canPay, setCanPay] = useState(false);
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const t = text.trim();
    if (!t || t.length > 500) {
      setErr("Message requis, max 500 caractères.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingText: t }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error("Création paiement échouée");
      window.location.href = data.url; // redirection vers Stripe
    } catch (err: unknown) {
      setErr(err instanceof Error ? err.message : "Erreur serveur");
      setLoading(false);
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= 500) {
      setText(newText);
      setCharCount(newText.length);
    }
  };

  useEffect(() => {
    async function checkApplePay() {
      const stripe = await stripePromise;
      if (!stripe) return;
      const pr = stripe.paymentRequest({
        country: "FR",
        currency: "eur",
        total: { label: "Message", amount: 100 },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      const result = await pr.canMakePayment();
      if (result) setCanPay(true);
    }
    checkApplePay();
  }, []);

  return (
    <Elements stripe={stripePromise}>
      <main className="min-h-screen relative overflow-hidden">
      {/* Background animé avec dégradés */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950 to-pink-950">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Orbes flottants animés */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <Image
            src="/logo.png"
            alt="Quotes Social"
            width={580}
            height={280}
            className="mx-auto mb-4"
          />
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide">
            Une chaîne infinie d'expressions humaines
          </p>
          <p className="text-md text-gray-400 mt-2">
            Lever le voile et laisser votre vérité
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 backdrop-blur-sm bg-white/5 rounded-full border border-white/10">
              Curiosité
            </span>
            <span className="text-gray-600">×</span>
            <span className="px-3 py-1 backdrop-blur-sm bg-white/5 rounded-full border border-white/10">
              Mystère
            </span>
            <span className="text-gray-600">×</span>
            <span className="px-3 py-1 backdrop-blur-sm bg-white/5 rounded-full border border-white/10">
              Humanité
            </span>
          </div>
        </header>

        {/* Card principale */}
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Placeholder pour le dernier message */}
          <Suspense fallback={
            <div className="mb-8 p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
                  Fragment Précédent
                </span>
                <span className="text-xs text-gray-500">
                  Chargement...
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-full animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-5/6 animate-pulse animation-delay-200" />
                <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-4/6 animate-pulse animation-delay-400" />
              </div>
            </div>
          }>
            <RevealedMessage />
          </Suspense>

          {/* Formulaire */}
          <form onSubmit={pay} className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-8 space-y-6">
            <div>
              <div className="mb-3">
                <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
                  Votre fragment
                </span>
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Amour, espoir, colère, joie... Partagez votre vérité au monde entier, de manière anonyme et éternelle..."
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  style={{ scrollbarWidth: 'thin' }}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {charCount}/500
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className={`
                w-full h-14 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform
                ${loading || !text.trim()
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]'
                }
                shadow-lg relative overflow-hidden group
              `}
            >
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Ouverture du portail de paiement...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">🔮</span>
                    Révéler et partager
                  </>
                )}
              </span>
              {!loading && text.trim() && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>

            <ApplePaySection text={text} />

            {/* Message d'erreur */}
            {err && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
                <p className="text-red-400 text-sm text-center">{err}</p>
              </div>
            )}
          </form>

          {/* Footer info */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p className="mb-2 text-sm text-gray-400">✨ Une expérience sociale mondiale ✨</p>
            <p>Le monde est-il fait d'amour ou de haine ?</p>
            <p className="mt-1">Rejoignez la chaîne humaine infinie.</p>
            <p className="mt-3 text-[10px] text-gray-600">
              Chaque message reste anonyme • Chaque vérité compte
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      </main>
    </Elements>
  );
function ApplePaySection({ text }: { text: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (!stripe || !elements) return;

    const pr = stripe.paymentRequest({
      country: "FR",
      currency: "eur",
      total: { label: "Message", amount: 100 },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result: any) => {
      if (result) setPaymentRequest(pr);
    });

    // Ecoute l'évènement de paiement Apple Pay
    pr.on("paymentmethod", async (ev: any) => {
      try {
        // 1) Crée le PaymentIntent côté serveur avec le texte courant
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 100, text }),
        });
        const data = await res.json();
        if (!res.ok || !data?.clientSecret) throw new Error("intent_error");

        // 2) Confirme le paiement avec Stripe
        const confirmRes = await stripe!.confirmCardPayment(data.clientSecret, {
          payment_method: ev.paymentMethod.id,
        });

        if (confirmRes.error) {
          ev.complete("fail");
          return;
        }

        ev.complete("success");

        // 3) Appelle l'API de confirmation pour révéler / enregistrer
        const piId = confirmRes.paymentIntent?.id;
        if (piId) {
          // Redirige avec intent_id pour que la page révèle le message
          window.location.href = `/?intent_id=${encodeURIComponent(piId)}`;
          return;
        }
      } catch (e) {
        try { ev.complete("fail"); } catch {}
      }
    });
  }, [stripe, elements, text]);

  if (!paymentRequest) return null;

  return (
    <div className="mt-2">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: "buy",
              theme: "dark",
              height: "56px",
            },
          },
        }}
      />
    </div>
  );
}
}

import { useSearchParams } from "next/navigation";

function RevealedMessage() {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const params = useSearchParams();

  useEffect(() => {
    const sessionId = params.get("session_id");
    const intentId = params.get("intent_id");
    const token = sessionId || intentId;
    if (!token) return;

    const qs = sessionId
      ? `session_id=${encodeURIComponent(sessionId)}`
      : `intent_id=${encodeURIComponent(intentId!)}`;

    fetch(`/api/confirm?${qs}`)
      .then((r) => {
        if (!r.ok) throw new Error("confirm_failed");
        return r.json();
      })
      .then((d) => {
        if (d && typeof d.previous === "string" && d.previous.length > 0) {
          setRevealed(d.previous);
          window.history.replaceState({}, "", "/");
        } else {
          setErr("Aucun message à révéler");
        }
      })
      .catch(() => setErr("Erreur lors de la révélation"));
  }, [params]);

  return (
    <div className="mb-8 p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
          Fragment Précédent
        </span>
        <span className="text-xs text-gray-500">
          {revealed ? "Révélé pour vous" : "Caché jusqu'au paiement"}
        </span>
      </div>

      {err ? (
        <p className="text-red-400 text-sm">{err}</p>
      ) : revealed ? (
        <blockquote className="text-gray-100 text-lg leading-relaxed italic">
          "{revealed}"
        </blockquote>
      ) : (
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-full animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-5/6 animate-pulse animation-delay-200" />
          <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-4/6 animate-pulse animation-delay-400" />
        </div>
      )}
    </div>
  );
}
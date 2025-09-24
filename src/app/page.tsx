"use client";
import { useState, useEffect, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

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
      <main className="min-h-screen relative overflow-hidden bg-black">
      {/* Background minimaliste avec effet de profondeur */}
      <div className="fixed inset-0">
        {/* Gradient subtil */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-neutral-950" />
        
        {/* Grille perspective */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
            perspective: '1000px',
            transformStyle: 'preserve-3d',
          }}
        />

        {/* Lueur centrale mystique */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[800px] h-[800px] bg-white/[0.02] rounded-full filter blur-[150px] animate-pulse-slow" />
          <div className="absolute inset-0 w-[600px] h-[600px] bg-white/[0.01] rounded-full filter blur-[100px] animate-pulse-slower" />
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header épuré */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-thin text-white tracking-[0.2em] mb-2">
              QUOTES<span className="text-white/30">.</span>SOCIAL
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          
          <p className="text-sm md:text-base text-white/60 font-light tracking-wider uppercase mb-8">
            Une chaîne infinie d'expressions humaines
          </p>

          {/* Philosophie du projet */}
          <div className="flex items-center justify-center gap-8 text-xs text-white/40 uppercase tracking-widest">
            <span className="animate-fade-in-delay-1">Curiosité</span>
            <span className="text-white/20">•</span>
            <span className="animate-fade-in-delay-2">Mystère</span>
            <span className="text-white/20">•</span>
            <span className="animate-fade-in-delay-3">Humanité</span>
          </div>
        </header>

        {/* Container principal */}
        <div className="w-full max-w-md animate-fade-in-up">
          
          {/* Message révélé */}
          <Suspense fallback={
            <div className="mb-10 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-white/5 rounded-lg blur-sm" />
              <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-8">
                <div className="mb-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Dernier Fragment
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-white/5 rounded-sm animate-pulse" style={{width: '85%'}} />
                  <div className="h-3 bg-white/5 rounded-sm animate-pulse" style={{width: '95%'}} />
                  <div className="h-3 bg-white/5 rounded-sm animate-pulse" style={{width: '70%'}} />
                </div>
              </div>
            </div>
          }>
            <RevealedMessage />
          </Suspense>

          {/* Le Rituel - Formulaire */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/[0.03] to-white/[0.03] rounded-lg blur-sm" />
            <form onSubmit={pay} className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-8">
              
              {/* Titre du rituel */}
              <div className="text-center mb-8">
                <h2 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
                  Le Rituel
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  1€ pour lever le voile<br/>
                  et laisser votre vérité
                </p>
              </div>

              {/* Zone de texte */}
              <div className="mb-6">
                <div className="relative group">
                  <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Votre vérité, votre fragment d'humanité..."
                    rows={5}
                    maxLength={500}
                    className="w-full px-0 py-4 bg-transparent border-0 border-b border-white/10 text-white/90 placeholder-white/20 resize-none focus:outline-none focus:border-white/30 transition-all duration-500 text-center font-light"
                    style={{ 
                      scrollbarWidth: 'none',
                      letterSpacing: '0.05em'
                    }}
                  />
                  <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700" />
                </div>
                
                {/* Compteur de caractères */}
                <div className="mt-3 text-center">
                  <span className="text-[10px] text-white/30 tracking-wider">
                    {charCount} / 500
                  </span>
                </div>
              </div>

              {/* Bouton principal */}
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className={`
                  relative w-full py-5 px-8 rounded-sm font-light tracking-wider uppercase text-sm
                  transition-all duration-700 overflow-hidden group
                  ${loading || !text.trim()
                    ? 'bg-white/[0.02] text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-white/[0.05] text-white/80 hover:bg-white/[0.08] border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Effet de hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <span className="relative">
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Ouverture du portail...
                    </span>
                  ) : (
                    'Participer au rituel — 1€'
                  )}
                </span>
              </button>

              <ApplePaySection text={text} />

              {/* Erreur */}
              {err && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-sm">
                  <p className="text-red-400/80 text-xs text-center">{err}</p>
                </div>
              )}
            </form>
          </div>

          {/* Question philosophique */}
          <div className="mt-12 text-center animate-fade-in-delay-4">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
              Le monde est-il fait<br/>
              <span className="text-white/40">d'amour ou de haine ?</span>
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
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.02; }
          50% { opacity: 0.04; }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.01; }
          50% { opacity: 0.02; }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.2;
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1.5s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1.5s ease-out;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 1.5s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 1.5s ease-out 0.4s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 1.5s ease-out 0.6s both;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 2s ease-out 1s both;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 12s ease-in-out infinite;
        }

        .animate-float {
          animation: float 30s linear infinite;
        }

        textarea::-webkit-scrollbar {
          display: none;
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

    pr.on("paymentmethod", async (ev: any) => {
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 100, text }),
        });
        const data = await res.json();
        if (!res.ok || !data?.clientSecret) throw new Error("intent_error");

        const confirmRes = await stripe!.confirmCardPayment(data.clientSecret, {
          payment_method: ev.paymentMethod.id,
        });

        if (confirmRes.error) {
          ev.complete("fail");
          return;
        }

        ev.complete("success");

        const piId = confirmRes.paymentIntent?.id;
        if (piId) {
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
    <div className="mt-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
      <PaymentRequestButtonElement options={{ paymentRequest }} />
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
          setErr("Aucun fragment précédent");
        }
      })
      .catch(() => setErr("Erreur lors de la révélation"));
  }, [params]);

  return (
    <div className="mb-10 relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-white/[0.02] to-white/[0.02] rounded-lg blur-sm group-hover:from-white/[0.04] group-hover:to-white/[0.04] transition-all duration-700" />
      
      {/* Content */}
      <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg p-8 transition-all duration-700">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
            Fragment Précédent
          </span>
          {revealed && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
              Révélé
            </span>
          )}
        </div>

        {err ? (
          <p className="text-red-400/60 text-sm text-center font-light">{err}</p>
        ) : revealed ? (
          <blockquote className="text-white/80 text-base md:text-lg leading-relaxed text-center font-light tracking-wide">
            "{revealed}"
          </blockquote>
        ) : (
          <div className="space-y-3">
            <div className="h-3 bg-white/5 rounded-sm animate-pulse" style={{width: '85%'}} />
            <div className="h-3 bg-white/5 rounded-sm animate-pulse animation-delay-200" style={{width: '95%'}} />
            <div className="h-3 bg-white/5 rounded-sm animate-pulse animation-delay-400" style={{width: '70%'}} />
          </div>
        )}
      </div>
    </div>
  );
}
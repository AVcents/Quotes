"use client";
import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [text, setText] = useState("");
  type Msg = { text: string; created_at: string } | null;
  const [revealed, setRevealed] = useState<Msg>(null);
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

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
    } catch (e: any) {
      setErr(e.message || "Erreur serveur");
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
  const sessionId = params.get("session_id");
  if (!sessionId) return;

  fetch(`/api/confirm?session_id=${encodeURIComponent(sessionId)}`)
    .then(r => r.json())
    .then(d => {
      if (d?.previous) setRevealed(d.previous);
      window.history.replaceState({}, document.title, "/");
    })
    .catch(() => setErr("Erreur lors de la confirmation"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [params]);

  return (
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
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-4 tracking-tight animate-gradient-x">
            quotes.social
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light tracking-wide">
            Pay 1€ to see the last message and leave yours
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 backdrop-blur-sm bg-white/5 rounded-full border border-white/10">
              Curiosity
            </span>
            <span className="text-gray-600">×</span>
            <span className="px-3 py-1 backdrop-blur-sm bg-white/5 rounded-full border border-white/10">
              Humanity
            </span>
            <span className="text-gray-600">×</span>
            <span className="px-3 py-1 backdrop-blur-sm bg-white/5 rounded-full border border-white/10">
              Mystery
            </span>
          </div>
        </header>

        {/* Card principale */}
        <div className="w-full max-w-lg animate-fade-in-up">
          {/* Placeholder pour le dernier message */}
         <div className="mb-8 p-6 backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 shadow-2xl transform transition-all duration-300 hover:scale-[1.02]">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
      Last Message
    </span>
    <span className="text-xs text-gray-500">
      {revealed ? "Revealed" : "Hidden until payment"}
    </span>
  </div>

  {revealed ? (
    <blockquote className="text-gray-100 text-lg leading-relaxed">
      {revealed.text}
    </blockquote>
  ) : (
    <div className="space-y-2">
      <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-full animate-pulse" />
      <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-5/6 animate-pulse animation-delay-200" />
      <div className="h-4 bg-gradient-to-r from-white/10 to-transparent rounded-full w-4/6 animate-pulse animation-delay-400" />
    </div>
  )}
</div>

          {/* Formulaire */}
          <form onSubmit={pay} className="backdrop-blur-md bg-white/5 rounded-2xl border border-white/10 shadow-2xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Your message to the world
              </label>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="What's on your mind? Love? Hope? Anger? Share your truth..."
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
                w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform
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
                    Ouverture de Stripe...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">💭</span>
                    Payer 1€ et publier
                  </>
                )}
              </span>
              {!loading && text.trim() && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>

            {/* Message d'erreur */}
            {err && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
                <p className="text-red-400 text-sm text-center">{err}</p>
              </div>
            )}
          </form>

          {/* Footer info */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Is the world made of love or hate?</p>
            <p className="mt-1">Join the social experiment.</p>
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
  );
}
"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1>Paiement réussi ✅</h1>
      <p>Merci ! Ton message a bien été enregistré.</p>
      <p>Session ID : {sessionId}</p>
      <a href="/" style={{ color: "blue" }}>Retour à l’accueil</a>
    </main>
  );
}
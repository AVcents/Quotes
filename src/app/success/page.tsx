"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1>Paiement réussi ✅</h1>
      <p>Merci ! Ton message a bien été enregistré.</p>
      <p>Session ID : {sessionId}</p>
      <Link href="/" style={{ color: "blue" }}>Retour à l’accueil</Link>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}><p>Chargement…</p></main>}>
      <SuccessInner />
    </Suspense>
  );
}
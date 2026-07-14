"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
    if (!pk) {
      setError(
        "Paiement indisponible : clé Stripe publique manquante (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = (await res.json()) as {
        sessionId?: string;
        url?: string | null;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Impossible de créer la session de paiement.");
      }

      await loadStripe(pk);

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error("URL de paiement Stripe manquante.");
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : "Impossible d'ouvrir le paiement. Réessayez plus tard.",
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void startCheckout();
  }, [startCheckout]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-emerald-200 bg-white p-8 shadow-lg text-center">
        <div className="text-4xl mb-4" aria-hidden>
          {error ? "⚠️" : "🔒"}
        </div>
        <h1 className="text-xl font-bold text-emerald-900 mb-2">
          Audit IA Premium — 199 €
        </h1>

        {loading && !error ? (
          <>
            <p className="text-gray-600 mb-4">
              Redirection vers le paiement sécurisé Stripe…
            </p>
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
              role="status"
              aria-label="Chargement"
            />
          </>
        ) : null}

        {error ? (
          <>
            <p className="text-red-700 text-sm mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => void startCheckout()}
                className="big-green-button max-w-none sm:w-auto sm:px-8"
              >
                Réessayer le paiement
              </button>
              <button
                type="button"
                onClick={() => router.push("/audit")}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Retour au simulateur
              </button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

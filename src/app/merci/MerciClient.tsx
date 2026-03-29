"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const brand = "#2d5a3d";
const accent = "#52b788";

export default function MerciClient({
  sessionId,
}: {
  sessionId: string | null;
}) {
  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:py-16"
      style={{ backgroundColor: brand }}
    >
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
            delay: 0.05,
          }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#52b788] shadow-2xl ring-4 ring-white/25"
          aria-hidden
        >
          <motion.svg
            viewBox="0 0 48 48"
            className="h-12 w-12 text-white"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.path
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 24l8 8 16-20"
            />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="mt-10 text-center"
        >
          <h1 className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl md:text-[1.65rem]">
            🎉 Paiement confirmé ! Bienvenue chez ENERGIA-CONSEIL IA
          </h1>
          <p className="mt-4 text-lg text-white/85">
            Votre audit énergétique IA est en cours de préparation
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-10 rounded-2xl bg-white p-8 shadow-2xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-[#2d5a3d]/80">
            Prochaines étapes
          </p>
          <ol className="mt-6 space-y-5 text-left">
            {[
              {
                n: "1",
                text: "📧 Vous allez recevoir un email de confirmation",
              },
              {
                n: "2",
                text: "📸 Envoyez vos 15 photos à audit@energia-conseil-ia.com",
              },
              {
                n: "3",
                text: "📄 Recevez votre rapport PDF complet sous 48h",
              },
            ].map((step, i) => (
              <motion.li
                key={step.n}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
                className="flex gap-4"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {step.n}
                </span>
                <span className="pt-1 text-base font-medium leading-snug text-neutral-800">
                  {step.text}
                </span>
              </motion.li>
            ))}
          </ol>

          {sessionId ? (
            <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Numéro de commande
              </p>
              <p className="mt-1 break-all font-mono text-sm text-neutral-900">
                {sessionId}
              </p>
            </div>
          ) : null}

          <Link
            href="/guide-photos"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-center text-lg font-bold text-white shadow-xl transition hover:opacity-95"
            style={{ backgroundColor: accent }}
          >
            📸 Voir comment prendre les photos
          </Link>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-10 text-center text-sm text-white/75"
        >
          Questions ?{" "}
          <a
            href="mailto:contact@energia-conseil-ia.com"
            className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
          >
            contact@energia-conseil-ia.com
          </a>
        </motion.footer>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="text-sm font-medium text-white/70 hover:text-white"
          >
            ← Retour à l&apos;accueil
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

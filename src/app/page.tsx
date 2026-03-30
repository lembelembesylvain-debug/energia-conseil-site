"use client";

import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { motion, useInView, animate } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const brand = "#2d5a3d";
const accent = "#52b788";
const urgency = "#e63946";

const fadeSlideUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const trustItems = [
  "Certifié ANAH ✓",
  "Conforme RGE ✓",
  "Paiement sécurisé ✓",
  "Remboursement garanti ✓",
];

function useCountUp(
  target: number,
  options: { suffix?: string; prefix?: string; decimals?: number } = {},
) {
  const { suffix = "", prefix = "", decimals = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2.15,
      ease: [0.22, 1, 0.36, 1] as const,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, target]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("fr-FR");

  return {
    ref,
    text: `${prefix}${formatted}${suffix}`,
  };
}

function ParticleField() {
  const dots = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        left: `${((i * 73) % 97) + 1}%`,
        top: `${((i * 41) % 93) + 3}%`,
        delay: (i % 10) * 0.35,
        size: 2 + (i % 5),
        duration: 4 + (i % 5),
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/25"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
          }}
          animate={{
            opacity: [0.2, 0.85, 0.2],
            y: [0, -18, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const audits = useCountUp(4800, { suffix: "+" });
  const savings = useCountUp(18000, { suffix: "€" });
  const precision = useCountUp(95, { suffix: "%" });
  const zeroRef = useRef<HTMLDivElement>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const startCheckout = useCallback(async () => {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
    if (!pk) {
      window.alert(
        "Paiement indisponible : ajoutez NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans votre environnement.",
      );
      return;
    }
    setCheckoutLoading(true);
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
      window.alert(
        e instanceof Error
          ? e.message
          : "Impossible d'ouvrir le paiement. Réessayez plus tard.",
      );
      setCheckoutLoading(false);
    }
  }, []);

  return (
    <main className="overflow-x-hidden bg-white">
      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-[100dvh]">
        <div className="absolute inset-0">
          <Image
            src="/audit-scaled.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0f2418]/95 via-[#2d5a3d]/88 to-[#1a3d2a]/95"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              custom={0}
              variants={fadeSlideUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md"
            >
              <span className="animate-pulse">🏆</span>
              <span>#1 Plateforme Audit IA en France</span>
            </motion.div>
            <motion.div
              custom={0.4}
              variants={fadeSlideUp}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-lg backdrop-blur-md"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-[#0f2418]"
                aria-hidden
              >
                ✓
              </span>
              <span>Marque déposée à l&apos;INPI ®</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeSlideUp}
              className="max-w-4xl text-balance font-bold tracking-tight text-white"
            >
              <span className="block text-4xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl">
                Votre maison perd de l&apos;argent.
              </span>
              <span className="mt-3 block bg-gradient-to-r from-[#d8f3dc] to-[#52b788] bg-clip-text text-4xl leading-[1.1] text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                On vous dit exactement combien.
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeSlideUp}
              className="mt-6 max-w-2xl text-lg text-white/90 sm:text-xl"
            >
              Audit énergétique IA complet en 48h • 199€ • Remboursé si
              travaux
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeSlideUp}
              className="mt-10 flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <motion.button
                type="button"
                disabled={checkoutLoading}
                onClick={() => void startCheckout()}
                whileHover={checkoutLoading ? undefined : { scale: 1.03 }}
                whileTap={checkoutLoading ? undefined : { scale: 0.98 }}
                className="animate-pulse-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-[#52b788] px-8 py-4 text-lg font-semibold text-white shadow-2xl transition hover:bg-[#40916c] disabled:cursor-wait disabled:opacity-80"
              >
                {checkoutLoading
                  ? "Redirection vers Stripe…"
                  : "🔥 Obtenir mon audit maintenant"}
              </motion.button>
              <motion.a
                href="#comment-ca-marche"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-white/80 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Voir comment ça marche
              </motion.a>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeSlideUp}
              className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-8 border-t border-white/20 pt-10 sm:grid-cols-3"
            >
              {[
                { label: "4 800+", sub: "audits réalisés" },
                { label: "95%", sub: "précision IA" },
                { label: "18 000€", sub: "économies moyennes" },
              ].map((s) => (
                <div key={s.sub} className="text-center">
                  <p className="text-3xl font-bold text-white sm:text-4xl">
                    {s.label}
                  </p>
                  <p className="mt-1 text-sm text-white/75">{s.sub}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. BANDEAU CONFIANCE ─── */}
      <section
        className="border-y border-white/10 py-4"
        style={{ backgroundColor: brand }}
        aria-label="Réassurance"
      >
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex w-max whitespace-nowrap">
            {[...trustItems, ...trustItems].map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="mx-10 inline-flex items-center text-sm font-semibold tracking-wide text-white/95"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. PROBLÈME ─── */}
      <section className="bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-balance text-center text-3xl font-bold tracking-tight text-[#1a1a1a] sm:text-4xl md:text-5xl"
          >
            Votre logement vous coûte une fortune. Voici pourquoi.
          </motion.h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "💸",
                text: "Vous perdez en moyenne 3 200€/an en énergie gaspillée",
              },
              {
                icon: "❄️",
                text: "7 millions de logements classés F ou G en France",
              },
              {
                icon: "😤",
                text: "Les artisans vous font des devis sans audit = argent jeté",
              },
            ].map((card, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: idx * 0.12, duration: 0.55 }}
                className="rounded-2xl border border-red-100 bg-white p-8 shadow-2xl"
              >
                <div
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-4xl ring-2 ring-[#e63946]/35 shadow-inner"
                  aria-hidden
                >
                  {card.icon}
                </div>
                <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-800">
                  {card.text}
                </p>
              </motion.article>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center text-lg font-medium"
            style={{ color: accent }}
          >
            Il existe une autre voie : un audit fiable, rapide, à prix juste —
            avant tout engagement.
          </motion.p>
        </div>
      </section>

      {/* ─── 4. COMMENT ÇA MARCHE ─── */}
      <section
        id="comment-ca-marche"
        className="scroll-mt-24 bg-white px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            Trois étapes. Zéro déplacement. Résultat professionnel.
          </p>

          {/* Mobile : pile verticale | Desktop : timeline horizontal */}
          <div className="relative mt-16 lg:hidden">
            <div className="space-y-10">
              {[
                {
                  step: "1",
                  emoji: "📸",
                  title: "15 photos en 10 min",
                  desc: "Façades, pièces, équipements — tout ce dont notre IA a besoin.",
                },
                {
                  step: "2",
                  emoji: "🤖",
                  title: "Notre IA analyse 300+ paramètres",
                  desc: "Modélisation thermique, scénarios, aides — en moins de 48h.",
                },
                {
                  step: "3",
                  emoji: "📄",
                  title: "Rapport PDF 40-60 pages",
                  desc: "DPE, aides au centime près, recommandations artisans RGE.",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: idx * 0.1 }}
                  className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-8 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2d5a3d] text-xl font-bold text-white">
                      {item.step}
                    </span>
                    <span className="text-3xl">{item.emoji}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-neutral-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative mt-16 hidden lg:block">
            <div className="relative px-4">
              <div className="absolute left-[8%] right-[8%] top-[2.25rem] h-0.5 rounded-full bg-gradient-to-r from-[#52b788] via-[#2d5a3d] to-[#52b788]" />
              <div className="relative grid grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    emoji: "📸",
                    title: "15 photos en 10 min",
                    desc: "Façades, pièces, équipements — tout ce dont notre IA a besoin.",
                  },
                  {
                    step: "2",
                    emoji: "🤖",
                    title: "Notre IA analyse 300+ paramètres",
                    desc: "Modélisation thermique, scénarios, aides — en moins de 48h.",
                  },
                  {
                    step: "3",
                    emoji: "📄",
                    title: "Rapport PDF 40-60 pages",
                    desc: "DPE, aides au centime près, recommandations artisans RGE.",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={`lg-${item.step}`}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.55, delay: idx * 0.15 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="relative z-10 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border-4 border-white bg-[#2d5a3d] text-2xl font-bold text-white shadow-2xl">
                      {item.step}
                    </div>
                    <span className="mt-4 text-4xl">{item.emoji}</span>
                    <h3 className="mt-3 text-lg font-bold text-neutral-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. COMPARATIF ─── */}
      <section className="bg-neutral-100 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Pourquoi 4 800 familles nous ont choisis ?
          </h2>
          <div className="mt-12 overflow-x-auto rounded-2xl shadow-2xl">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-[#1a3c5e] text-white">
                  <th className="rounded-tl-2xl px-4 py-4 text-sm font-semibold sm:px-6">
                    Critère
                  </th>
                  <th className="px-4 py-4 text-sm font-semibold sm:px-6">
                    Audit traditionnel
                  </th>
                  <th className="relative rounded-tr-2xl bg-[#2d5a3d] px-4 py-4 text-sm font-semibold sm:px-6">
                    <span className="inline-flex items-center gap-2">
                      ⚡ ENERGIA-CONSEIL IA
                      <span className="rounded-full bg-[#52b788] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                        Meilleur choix
                      </span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white text-sm sm:text-base">
                {[
                  ["Prix", "800-1500€ ❌", "199€ ✅"],
                  ["Délai", "4-6 semaines ❌", "48h ✅"],
                  ["Déplacement", "Obligatoire ❌", "100% à distance ✅"],
                  ["Précision", "Variable ❌", "95% certifiée ✅"],
                  ["Aides calculées", "Non ❌", "Au centime près ✅"],
                  ["Artisans RGE", "Non inclus ❌", "5 devis inclus ✅"],
                ].map(([crit, trad, energia], i) => (
                  <tr
                    key={crit}
                    className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}
                  >
                    <td className="border-b border-neutral-100 px-4 py-4 font-medium text-neutral-800 sm:px-6">
                      {crit}
                    </td>
                    <td className="border-b border-neutral-100 px-4 py-4 text-neutral-600 sm:px-6">
                      {trad}
                    </td>
                    <td className="border-b border-neutral-100 bg-[#f0fdf4] px-4 py-4 font-semibold text-[#166534] sm:px-6">
                      {energia}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── 6. COMPTEURS ─── */}
      <section
        className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
        style={{
          background: `linear-gradient(135deg, ${brand} 0%, #1e3d2a 50%, #163524 100%)`,
        }}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <CounterBlock
            refProp={audits.ref}
            label="Audits réalisés"
            value={audits.text}
          />
          <CounterBlock
            refProp={savings.ref}
            label="Économies moyennes"
            value={savings.text}
          />
          <CounterBlock
            refProp={precision.ref}
            label="Précision IA"
            value={precision.text}
          />
          <CounterBlock
            refProp={zeroRef}
            label="Reste à charge possible"
            value="0€"
          />
        </div>
      </section>

      {/* ─── 7. TÉMOIGNAGES ─── */}
      <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            ⭐ Ils nous font confiance
          </h2>
          <div className="mt-14 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              {
                initials: "MD",
                color: "from-emerald-500 to-teal-600",
                quote:
                  "Enfin un rapport clair avant de signer quoi que ce soit. Les aides étaient pile ce qu’on a obtenus.",
                name: "Marie D.",
                place: "Lyon 6ème",
                extra: "Économie 18 000€ d'aides",
              },
              {
                initials: "TL",
                color: "from-sky-500 to-blue-700",
                quote:
                  "L’équipe m’a aidé à prioriser les travaux. Le photovoltaïque a été financé à un niveau que je n’imaginais pas.",
                name: "Thomas L.",
                place: "Villeurbanne",
                extra: "Installation 6kWc financée à 70%",
              },
              {
                initials: "SM",
                color: "from-violet-500 to-fuchsia-600",
                quote:
                  "Process 100 % à distance, résultat en deux jours. On a sécurisé le dossier et le reste à charge.",
                name: "Sophie M.",
                place: "Bordeaux",
                extra: "Reste à charge 0€ sur 55 000€ de travaux",
              },
            ].map((t, i) => (
              <motion.article
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[85vw] shrink-0 snap-center rounded-2xl border border-neutral-100 bg-neutral-50/80 p-8 shadow-2xl md:min-w-0"
              >
                <div className="flex text-amber-400" aria-hidden>
                  {"★★★★★".split("").map((s, j) => (
                    <span key={j} className="text-xl">
                      {s}
                    </span>
                  ))}
                </div>
                <blockquote className="mt-4 text-lg italic leading-relaxed text-neutral-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${t.color} text-lg font-bold text-white shadow-lg`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{t.name}</p>
                    <p className="text-sm text-neutral-500">{t.place}</p>
                    <p className="mt-1 text-sm font-medium" style={{ color: accent }}>
                      {t.extra}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. CTA FINAL ─── */}
      <section
        id="cta-final"
        className="relative scroll-mt-24 overflow-hidden px-4 py-28 sm:px-6 lg:px-8"
        style={{
          background: `linear-gradient(160deg, #0f2418 0%, ${brand} 45%, #0d1f14 100%)`,
        }}
      >
        <ParticleField />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Prêt à arrêter de perdre de l&apos;argent ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-6 text-lg text-white/85 sm:text-xl"
          >
            Rejoignez 4 800 familles qui ont transformé leur logement
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="mt-12"
          >
            <motion.button
              type="button"
              disabled={checkoutLoading}
              onClick={() => void startCheckout()}
              whileHover={checkoutLoading ? undefined : { scale: 1.04 }}
              whileTap={checkoutLoading ? undefined : { scale: 0.97 }}
              className="animate-pulse-cta inline-flex w-full max-w-lg items-center justify-center gap-2 rounded-2xl bg-[#52b788] px-10 py-5 text-xl font-bold text-white shadow-2xl disabled:cursor-wait disabled:opacity-80 sm:text-2xl"
            >
              {checkoutLoading
                ? "Redirection vers Stripe…"
                : "🔥 Démarrer mon audit à 199€ →"}
            </motion.button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-sm text-white/80 sm:text-base"
          >
            ✓ Remboursé si vous faites les travaux • ✓ Résultat en 48h • ✓
            Sans engagement
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#e63946]/40 bg-[#e63946]/15 px-4 py-3 text-sm font-semibold text-[#fecaca] sm:text-base"
            style={{ borderColor: `${urgency}66` }}
          >
            <span>⏰</span>
            <span>
              Offre valable jusqu&apos;au 31 mars 2026 — Prix passe à 299€
            </span>
          </motion.p>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-10 text-center text-sm text-neutral-500">
        <p className="font-semibold text-[#2d5a3d]">
          ENERGIA-CONSEIL IA® — Audit Énergétique Intelligence Artificielle
        </p>
        <p className="mt-2 text-sm text-gray-400">
          ENERGIA-CONSEIL IA® est une marque déposée à l&apos;INPI
        </p>
        <p className="mt-1 text-xs text-gray-500">
          SIRET : 94181942700019 — 16 Rue Cuvier, 69006 Lyon
        </p>
      </footer>
    </main>
  );
}

function CounterBlock({
  refProp,
  label,
  value,
}: {
  refProp: React.RefObject<HTMLDivElement | null>;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      ref={refProp}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-white/75">
        {label}
      </p>
    </motion.div>
  );
}
